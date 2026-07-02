import express from 'express';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import Gallery from '../models/gallery.js';
import GalleryFolder from '../models/galleryFolder.js';

const router = express.Router();
const BUCKET_NAME = 'galleryMedia';

const getBucket = () => new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });

const getGalleryMediaUrl = (req, fileId) => `${req.protocol}://${req.get('host')}/api/gallery/media/${fileId}`;

const getMediaType = (item = {}) => item.mediaType || (item.contentType?.startsWith('video/') ? 'video' : 'image');

const serializeGalleryItem = (item, req) => {
  const doc = item.toObject ? item.toObject() : item;
  delete doc.imageBuffer;

  return {
    ...doc,
    folderId: doc.folderId || null,
    mediaType: getMediaType(doc),
    imageUrl: getGalleryMediaUrl(req, doc._id),
  };
};

const serializeFolder = (folder, req, stats = {}) => {
  const doc = folder.toObject ? folder.toObject() : folder;

  return {
    ...doc,
    mediaCount: stats.mediaCount || 0,
    coverMedia: stats.coverMedia ? serializeGalleryItem(stats.coverMedia, req) : null,
  };
};

const ensureObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

const buildFolderSummary = async (folder, req) => {
  const [mediaCount, explicitCover] = await Promise.all([
    Gallery.countDocuments({ folderId: folder._id }),
    folder.coverMediaId ? Gallery.findById(folder.coverMediaId) : null,
  ]);

  const coverMedia = explicitCover || await Gallery.findOne({ folderId: folder._id }).sort({ createdAt: -1 });
  return serializeFolder(folder, req, { mediaCount, coverMedia });
};

router.get('/folders', async (req, res) => {
  try {
    const folders = await GalleryFolder.find().sort({ createdAt: -1 });
    const serializedFolders = await Promise.all(folders.map((folder) => buildFolderSummary(folder, req)));

    res.json({ success: true, folders: serializedFolders });
  } catch (error) {
    console.error('Public gallery folders fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/folders/:folderId/media', async (req, res) => {
  try {
    const folderObjectId = ensureObjectId(req.params.folderId);
    if (!folderObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid gallery folder id' });
    }

    const folder = await GalleryFolder.findById(folderObjectId);
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Gallery folder not found' });
    }

    const images = await Gallery.find({ folderId: folderObjectId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      folder: await buildFolderSummary(folder, req),
      images: images.map((item) => serializeGalleryItem(item, req)),
    });
  } catch (error) {
    console.error('Public gallery folder media fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.folderId) {
      const folderObjectId = ensureObjectId(req.query.folderId);
      if (!folderObjectId) {
        return res.status(400).json({ success: false, message: 'Invalid gallery folder id' });
      }
      query.folderId = folderObjectId;
    }

    if (req.query.uncategorized === 'true') {
      query.folderId = null;
    }

    const images = await Gallery.find(query).sort({ createdAt: -1 });
    res.json({ success: true, images: images.map((item) => serializeGalleryItem(item, req)) });
  } catch (error) {
    console.error('Public gallery fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const streamGalleryMedia = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem?.fileId) {
      return res.status(404).json({ success: false, message: 'Gallery media not found' });
    }

    const gridFsId = galleryItem.fileId instanceof ObjectId ? galleryItem.fileId : new ObjectId(String(galleryItem.fileId));
    const bucket = getBucket();
    const [file] = await bucket.find({ _id: gridFsId }).toArray();

    if (!file) {
      return res.status(404).json({ success: false, message: 'Gallery media file not found' });
    }

    res.set('Content-Type', galleryItem.contentType || file.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    const downloadStream = bucket.openDownloadStream(gridFsId);
    downloadStream.on('error', (error) => {
      console.error('GridFS gallery stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Unable to stream gallery media' });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Gallery media stream error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/media/:id', streamGalleryMedia);
router.get('/images/:id', streamGalleryMedia);

router.post('/seed', (req, res) => {
  res.status(410).json({ success: false, message: 'Gallery seed endpoint is disabled. Upload media from admin portal.' });
});

export default router;
