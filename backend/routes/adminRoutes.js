import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';
import { requireAllowedIP } from '../middleware/ipRestriction.js';
import User from '../models/user.js';
import Gallery from '../models/gallery.js';
import GalleryFolder from '../models/galleryFolder.js';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../controllers/campaignController.js';
import {
  getMe,
  updateMe,
  getDashboardStats,
  getCandidates,
  updateCandidateStatus,
  getMembers,
  addMember,
  updateMember,
  updateMemberRole,
  deactivateMember,
  uploadCertificateFile,
  deleteMember,
  getDonations,
  getCertificates,
  generateCertificate,
  revokeCertificate,
  downloadCertificate,
  getReports,
  getSettings,
  updateSettings,
  getAuditLogs,
} from '../controllers/adminController.js';

const router = express.Router();

const BUCKET_NAME = 'galleryMedia';
const MAX_GALLERY_MEDIA_SIZE = 100 * 1024 * 1024; // 100MB per file
const MAX_GALLERY_MEDIA_FILES = 100;

const getBucket = () => new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
const getGalleryMediaUrl = (id) => `/api/gallery/media/${id}`;
const getMediaType = (mimetype = '') => (mimetype.startsWith('video/') ? 'video' : 'image');

const slugifyFolderName = (name = '') => {
  const slug = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `gallery-folder-${Date.now()}`;
};

const normalizeObjectId = (id, label = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${label}`);
    error.statusCode = 400;
    throw error;
  }

  return new mongoose.Types.ObjectId(id);
};

const serializeGalleryItem = (item) => {
  const doc = item.toObject ? item.toObject() : item;
  delete doc.imageBuffer;

  return {
    ...doc,
    folderId: doc.folderId || null,
    imageUrl: getGalleryMediaUrl(doc._id),
  };
};

const buildFolderSummary = async (folder) => {
  const [mediaCount, explicitCover] = await Promise.all([
    Gallery.countDocuments({ folderId: folder._id }),
    folder.coverMediaId ? Gallery.findById(folder.coverMediaId) : null,
  ]);

  const coverMedia = explicitCover || await Gallery.findOne({ folderId: folder._id }).sort({ createdAt: -1 });
  const doc = folder.toObject ? folder.toObject() : folder;

  return {
    ...doc,
    mediaCount,
    coverMedia: coverMedia ? serializeGalleryItem(coverMedia) : null,
  };
};

const getUniqueFolderSlug = async (name, currentFolderId = null) => {
  const baseSlug = slugifyFolderName(name);
  let slug = baseSlug;
  let suffix = 2;

  while (await GalleryFolder.exists({ slug, ...(currentFolderId ? { _id: { $ne: currentFolderId } } : {}) })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const findFolderOrThrow = async (folderId) => {
  const objectId = normalizeObjectId(folderId, 'gallery folder id');
  const folder = await GalleryFolder.findById(objectId);

  if (!folder) {
    const error = new Error('Gallery folder not found');
    error.statusCode = 404;
    throw error;
  }

  return folder;
};

const refreshFolderCover = async (folderId) => {
  if (!folderId) return;

  const nextCover = await Gallery.findOne({ folderId }).sort({ createdAt: -1 });
  await GalleryFolder.findByIdAndUpdate(folderId, { coverMediaId: nextCover?._id || null });
};

const uploadBufferToGridFS = (file) => new Promise((resolve, reject) => {
  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(file.originalname || `gallery-${Date.now()}`, {
    contentType: file.mimetype,
    metadata: {
      originalName: file.originalname,
      size: file.size,
      mediaType: getMediaType(file.mimetype),
    },
  });

  uploadStream.once('error', reject);
  uploadStream.once('finish', () => resolve(uploadStream.id));
  uploadStream.end(file.buffer);
});

const deleteGridFSFile = async (fileId) => {
  if (!fileId) return;

  try {
    const objectId = fileId instanceof ObjectId ? fileId : new ObjectId(String(fileId));
    await getBucket().delete(objectId);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('GridFS cleanup warning:', error.message);
    }
  }
};

const galleryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_GALLERY_MEDIA_SIZE,
    files: MAX_GALLERY_MEDIA_FILES,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith('image/') || file.mimetype?.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed.'));
    }
  },
});

const galleryMediaUpload = galleryUpload.fields([
  { name: 'media', maxCount: MAX_GALLERY_MEDIA_FILES },
  { name: 'images', maxCount: MAX_GALLERY_MEDIA_FILES },
  { name: 'image', maxCount: 1 },
]);

const getUploadedMediaFiles = (req) => [
  ...(req.files?.media || []),
  ...(req.files?.images || []),
  ...(req.files?.image || []),
];

const mediaTitleFromFile = (file) => (file.originalname || 'Gallery media').replace(/\.[^/.]+$/, '');

const createGalleryMedia = async ({ file, title, folderId = null }) => {
  const fileId = await uploadBufferToGridFS(file);

  const image = await Gallery.create({
    title: title || mediaTitleFromFile(file),
    folderId,
    imageUrl: '/api/gallery/media/pending',
    fileId,
    contentType: file.mimetype,
    mediaType: getMediaType(file.mimetype),
    originalName: file.originalname || '',
    size: file.size || 0,
  });

  image.imageUrl = getGalleryMediaUrl(image._id);
  await image.save();

  if (folderId) {
    const folder = await GalleryFolder.findById(folderId);
    if (folder && !folder.coverMediaId) {
      folder.coverMediaId = image._id;
      await folder.save();
    }
  }

  return image;
};

const certificateUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF certificate files are allowed.'));
    }
  },
});

// Unprotected route so you can seed the DB from your browser.
router.get('/seed', async (req, res) => {
  try {
    const ADMIN_EMAIL = 'tech.amaanitvam@gmail.com';
    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      existing.role = 'admin';
      existing.status = 'active';
      await existing.save();
      return res.json({ success: true, message: 'User already existed and was updated to admin' });
    }

    const adminUser = new User({
      name: 'Amaanitvam Admin',
      email: ADMIN_EMAIL,
      role: 'admin',
      status: 'active',
      department: 'Technology',
    });

    await adminUser.save();
    res.json({ success: true, message: 'Super admin created successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.use(verifyFirebaseToken);

router.get('/me', getMe);
router.put('/me', updateMe);
router.post('/update-profile', updateMe);
router.put('/update-profile', updateMe);

router.get('/stats', requireAdmin, requireAllowedIP, getDashboardStats);
router.get('/reports', requireAdmin, requireAllowedIP, getReports);
router.get('/candidates', requireAdmin, requireAllowedIP, getCandidates);
router.put('/candidates/:id/status', requireAdmin, requireAllowedIP, updateCandidateStatus);
router.get('/members', requireAdmin, requireAllowedIP, getMembers);
router.post('/members', requireAdmin, requireAllowedIP, addMember);
router.put('/members/:id', requireAdmin, requireAllowedIP, updateMember);
router.put('/members/:id/role', requireAdmin, requireAllowedIP, updateMemberRole);
router.put('/members/:id/deactivate', requireAdmin, requireAllowedIP, deactivateMember);
router.delete('/members/:id', requireAdmin, requireAllowedIP, deleteMember);
router.get('/donations', requireAdmin, requireAllowedIP, getDonations);
router.get('/campaigns', requireAdmin, requireAllowedIP, getCampaigns);
router.post('/campaigns', requireAdmin, requireAllowedIP, createCampaign);
router.put('/campaigns/:id', requireAdmin, requireAllowedIP, updateCampaign);
router.delete('/campaigns/:id', requireAdmin, requireAllowedIP, deleteCampaign);
router.get('/certificates', requireAdmin, requireAllowedIP, getCertificates);
router.put('/certificates/:id/revoke', requireAdmin, requireAllowedIP, revokeCertificate);
router.get('/certificates/:id/download', requireAdmin, requireAllowedIP, downloadCertificate);
router.post('/certificates', requireAdmin, requireAllowedIP, certificateUpload.single('certificate'), generateCertificate);
router.put('/certificates/:id/file', requireAdmin, requireAllowedIP, certificateUpload.single('certificate'), uploadCertificateFile);
router.get('/settings', requireAdmin, requireAllowedIP, getSettings);
router.put('/settings', requireAdmin, requireAllowedIP, updateSettings);
router.get('/audit-logs', requireAdmin, requireAllowedIP, getAuditLogs);

router.get('/gallery/folders', requireAdmin, requireAllowedIP, async (req, res) => {
  try {
    const folders = await GalleryFolder.find().sort({ createdAt: -1 });
    const serializedFolders = await Promise.all(folders.map(buildFolderSummary));
    res.json({ success: true, folders: serializedFolders });
  } catch (error) {
    console.error('Gallery folders fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/gallery/folders', requireAdmin, requireAllowedIP, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    const folder = await GalleryFolder.create({
      name,
      slug: await getUniqueFolderSlug(name),
      description: String(req.body.description || '').trim(),
    });

    res.status(201).json({ success: true, folder: await buildFolderSummary(folder) });
  } catch (error) {
    console.error('Gallery folder create error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.put('/gallery/folders/:folderId', requireAdmin, requireAllowedIP, async (req, res) => {
  try {
    const folder = await findFolderOrThrow(req.params.folderId);

    if (req.body.name !== undefined) {
      const name = String(req.body.name || '').trim();
      if (!name) {
        return res.status(400).json({ success: false, message: 'Folder name is required' });
      }
      folder.name = name;
      folder.slug = await getUniqueFolderSlug(name, folder._id);
    }

    if (req.body.description !== undefined) {
      folder.description = String(req.body.description || '').trim();
    }

    await folder.save();
    res.json({ success: true, folder: await buildFolderSummary(folder) });
  } catch (error) {
    console.error('Gallery folder update error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.get('/gallery/folders/:folderId/media', requireAdmin, requireAllowedIP, async (req, res) => {
  try {
    const folder = await findFolderOrThrow(req.params.folderId);
    const images = await Gallery.find({ folderId: folder._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      folder: await buildFolderSummary(folder),
      images: images.map(serializeGalleryItem),
    });
  } catch (error) {
    console.error('Gallery folder media fetch error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.post('/gallery/folders/:folderId/bulk', requireAdmin, requireAllowedIP, galleryMediaUpload, async (req, res) => {
  try {
    const folder = await findFolderOrThrow(req.params.folderId);
    const files = getUploadedMediaFiles(req);

    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No photos or videos uploaded' });
    }

    const titlePrefix = String(req.body.titlePrefix || req.body.title || folder.name).trim();
    const createdImages = [];

    for (let i = 0; i < files.length; i += 1) {
      const itemTitle = files.length === 1 ? titlePrefix : `${titlePrefix} ${i + 1}`;
      const image = await createGalleryMedia({ file: files[i], title: itemTitle, folderId: folder._id });
      createdImages.push(serializeGalleryItem(image));
    }

    await refreshFolderCover(folder._id);

    res.status(201).json({
      success: true,
      message: `${createdImages.length} gallery media item(s) uploaded to ${folder.name}`,
      folder: await buildFolderSummary(folder),
      images: createdImages,
    });
  } catch (error) {
    console.error('Gallery folder bulk upload error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.delete('/gallery/folders/:folderId', requireAdmin, requireAllowedIP, async (req, res) => {
  try {
    const folder = await findFolderOrThrow(req.params.folderId);
    const mediaItems = await Gallery.find({ folderId: folder._id });

    for (const item of mediaItems) {
      await deleteGridFSFile(item.fileId);
    }

    await Gallery.deleteMany({ folderId: folder._id });
    await GalleryFolder.findByIdAndDelete(folder._id);

    res.json({ success: true, message: 'Gallery folder and its media deleted successfully' });
  } catch (error) {
    console.error('Gallery folder delete error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.post('/gallery', requireAdmin, requireAllowedIP, galleryMediaUpload, async (req, res) => {
  try {
    const [file] = getUploadedMediaFiles(req);

    if (!file) {
      return res.status(400).json({ success: false, message: 'No photo or video uploaded' });
    }

    const title = String(req.body.title || '').trim();

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const folderId = req.body.folderId ? (await findFolderOrThrow(req.body.folderId))._id : null;
    const image = await createGalleryMedia({ file, title, folderId });
    res.status(201).json({ success: true, image: serializeGalleryItem(image) });
  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.post('/gallery/bulk', requireAdmin, requireAllowedIP, galleryMediaUpload, async (req, res) => {
  try {
    const files = getUploadedMediaFiles(req);

    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No photos or videos uploaded' });
    }

    const title = String(req.body.title || req.body.titlePrefix || '').trim();

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const folderId = req.body.folderId ? (await findFolderOrThrow(req.body.folderId))._id : null;
    const createdImages = [];

    for (let i = 0; i < files.length; i += 1) {
      const itemTitle = files.length === 1 ? title : `${title} ${i + 1}`;
      const image = await createGalleryMedia({ file: files[i], title: itemTitle, folderId });
      createdImages.push(serializeGalleryItem(image));
    }

    if (folderId) await refreshFolderCover(folderId);

    res.status(201).json({
      success: true,
      message: `${createdImages.length} gallery media item(s) uploaded successfully`,
      images: createdImages,
    });
  } catch (error) {
    console.error('Gallery bulk upload error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.delete('/gallery/:id', requireAdmin, requireAllowedIP, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Gallery media not found' });
    }

    const oldFolderId = image.folderId;
    await deleteGridFSFile(image.fileId);
    await Gallery.findByIdAndDelete(req.params.id);
    await refreshFolderCover(oldFolderId);

    res.status(200).json({ success: true, message: 'Gallery media deleted successfully' });
  } catch (error) {
    console.error('Gallery delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/gallery/:id', requireAdmin, requireAllowedIP, galleryMediaUpload, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Gallery media not found' });
    }

    const oldFolderId = image.folderId;

    if (req.body.title) {
      image.title = String(req.body.title).trim();
    }

    if (req.body.folderId !== undefined) {
      image.folderId = req.body.folderId ? (await findFolderOrThrow(req.body.folderId))._id : null;
    }

    const [file] = getUploadedMediaFiles(req);

    if (file) {
      await deleteGridFSFile(image.fileId);
      image.fileId = await uploadBufferToGridFS(file);
      image.imageUrl = getGalleryMediaUrl(image._id);
      image.contentType = file.mimetype;
      image.mediaType = getMediaType(file.mimetype);
      image.originalName = file.originalname || '';
      image.size = file.size || 0;
      image.imageBuffer = undefined;
    }

    await image.save();
    await refreshFolderCover(oldFolderId);
    await refreshFolderCover(image.folderId);

    res.status(200).json({ success: true, image: serializeGalleryItem(image) });
  } catch (error) {
    console.error('Gallery update error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

export default router;
