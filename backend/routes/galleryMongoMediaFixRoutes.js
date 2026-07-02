import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 100,
  },
});

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const BUCKET_NAMES = ['gallery', 'uploads', 'fs', 'media', 'images', 'galleryFiles', 'galleryMedia'];
const DOC_COLLECTION_HINTS = [
  'galleries',
  'gallery',
  'galleryitems',
  'galleryItems',
  'galleryimages',
  'galleryImages',
  'gallerymedia',
  'galleryMedia',
  'media',
  'images',
];

function database() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error('MongoDB is not connected yet');
  }
  return mongoose.connection.db;
}

function cleanId(value) {
  if (value === null || value === undefined) return '';

  // IMPORTANT:
  // Mongoose/BSON ObjectId has an `_id` getter that returns itself.
  // If we call cleanId(value._id) on an ObjectId, it creates infinite recursion.
  if (typeof value === 'object') {
    if (typeof value.toHexString === 'function') return value.toHexString();
    if (value.$oid) return String(value.$oid).trim();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  if (typeof value === 'object') {
    if (Object.prototype.hasOwnProperty.call(value, 'id') && value.id !== value) {
      return cleanId(value.id);
    }

    if (Object.prototype.hasOwnProperty.call(value, '_id') && value._id !== value) {
      return cleanId(value._id);
    }

    if (typeof value.toString === 'function') {
      const text = String(value.toString()).trim();
      if (text && text !== '[object Object]') return text;
    }
  }

  return '';
}

function asObjectId(value) {
  const id = cleanId(value);
  return OBJECT_ID_RE.test(id) ? new ObjectId(id) : null;
}

function sameId(a, b) {
  return cleanId(a) && cleanId(a) === cleanId(b);
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
}

function publicUrl(fileId) {
  return `/api/gallery/media/${encodeURIComponent(cleanId(fileId))}`;
}

function getFileId(doc) {
  return firstValue(
    doc?.fileId,
    doc?.gridFsFileId,
    doc?.gridfsFileId,
    doc?.gridFSFileId,
    doc?.mediaId,
    doc?.imageId,
    doc?.file?._id,
    doc?.image?._id,
    doc?.media?._id,
    doc?._id,
  );
}

function serializeGalleryDoc(doc) {
  const fileId = getFileId(doc);
  const title = firstValue(
    doc.title,
    doc.name,
    doc.caption,
    doc.originalName,
    doc.filename,
    doc.fileName,
    doc.file?.originalName,
    doc.image?.originalName,
    'Gallery media',
  );
  const contentType = firstValue(
    doc.contentType,
    doc.mimeType,
    doc.mimetype,
    doc.type,
    doc.mediaType,
    doc.file?.contentType,
    doc.image?.contentType,
    '',
  );

  return {
    ...doc,
    _id: cleanId(doc._id),
    id: cleanId(doc._id),
    fileId: cleanId(fileId),
    title,
    originalName: firstValue(doc.originalName, doc.file?.originalName, doc.image?.originalName, title),
    filename: firstValue(doc.filename, doc.fileName, doc.file?.filename, doc.image?.filename, title),
    folderId: cleanId(firstValue(doc.folderId, doc.folder, doc.categoryId, doc.albumId, '')),
    contentType,
    mimeType: contentType,
    mediaType: String(contentType).startsWith('video/') ? 'video' : 'image',
    imageUrl: publicUrl(fileId),
    mediaUrl: publicUrl(fileId),
    url: publicUrl(fileId),
  };
}

function toBuffer(value) {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value.buffer && value.buffer instanceof ArrayBuffer) return Buffer.from(value.buffer);
  if (value._bsontype === 'Binary' && typeof value.value === 'function') return Buffer.from(value.value(true));
  if (value.type === 'Buffer' && Array.isArray(value.data)) return Buffer.from(value.data);
  if (value.$binary?.base64) return Buffer.from(value.$binary.base64, 'base64');
  if (typeof value === 'string') {
    const dataUrl = value.match(/^data:([^;]+);base64,(.+)$/i);
    if (dataUrl) return Buffer.from(dataUrl[2], 'base64');
    if (/^[A-Za-z0-9+/=\r\n]+$/.test(value) && value.length > 200) return Buffer.from(value, 'base64');
  }
  return null;
}

function pickBuffer(doc) {
  const candidates = [
    doc.data,
    doc.fileData,
    doc.imageData,
    doc.mediaData,
    doc.buffer,
    doc.content,
    doc.file,
    doc.image,
    doc.media,
    doc.file?.data,
    doc.image?.data,
    doc.media?.data,
    doc.file?.buffer,
    doc.image?.buffer,
    doc.media?.buffer,
  ];

  for (const candidate of candidates) {
    const buffer = toBuffer(candidate);
    if (buffer && buffer.length) return buffer;
  }
  return null;
}

function contentTypeOf(doc = {}, fallback = 'application/octet-stream') {
  return String(firstValue(
    doc.contentType,
    doc.mimeType,
    doc.mimetype,
    doc.file?.contentType,
    doc.image?.contentType,
    doc.media?.contentType,
    doc.metadata?.contentType,
    fallback,
  ));
}

function isLocalOrApiUrl(url) {
  return /localhost|127\.0\.0\.1|\/api\/gallery\/media\//i.test(String(url || ''));
}

function remoteUrlOf(doc = {}) {
  const url = firstValue(doc.cloudinaryUrl, doc.secure_url, doc.remoteUrl, doc.file?.url, doc.image?.url, doc.media?.url, doc.url, doc.imageUrl, doc.mediaUrl, doc.src);
  if (!url || isLocalOrApiUrl(url)) return '';
  if (/^https?:\/\//i.test(String(url))) return String(url);
  return '';
}

async function candidateDocCollections() {
  const db = database();
  const listed = await db.listCollections({}, { nameOnly: true }).toArray();
  const dynamic = listed
    .map((item) => item.name)
    .filter((name) => /gallery|media|image/i.test(name))
    .filter((name) => !/\.files$|\.chunks$/i.test(name));
  return [...new Set([...DOC_COLLECTION_HINTS, ...dynamic])];
}

function idQueries(id) {
  const clean = cleanId(id);
  const oid = asObjectId(clean);
  const queries = [{ _id: clean }];

  if (oid) queries.unshift({ _id: oid });

  ['fileId', 'gridFsFileId', 'gridfsFileId', 'gridFSFileId', 'mediaId', 'imageId'].forEach((field) => {
    queries.push({ [field]: clean });
    if (oid) queries.push({ [field]: oid });
  });

  return queries;
}

async function findGalleryDoc(id) {
  const db = database();
  const collections = await candidateDocCollections();
  const queries = idQueries(id);

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    for (const query of queries) {
      const doc = await collection.findOne(query);
      if (doc) return { doc, collectionName };
    }
  }
  return null;
}

async function findGridFsFile(id) {
  const db = database();
  const oid = asObjectId(id);
  if (!oid) return null;

  for (const bucketName of BUCKET_NAMES) {
    const fileDoc = await db.collection(`${bucketName}.files`).findOne({ _id: oid });
    if (fileDoc) return { bucketName, fileDoc, oid };
  }
  return null;
}

async function streamGridFs(id, res) {
  const found = await findGridFsFile(id);
  if (!found) return false;

  const db = database();
  const bucket = new GridFSBucket(db, { bucketName: found.bucketName });
  const contentType = contentTypeOf(found.fileDoc, found.fileDoc.contentType || found.fileDoc.metadata?.contentType || 'application/octet-stream');

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  if (found.fileDoc.length) res.setHeader('Content-Length', String(found.fileDoc.length));

  await new Promise((resolve, reject) => {
    const stream = bucket.openDownloadStream(found.oid);
    stream.on('error', reject);
    stream.on('end', resolve);
    stream.pipe(res);
  });
  return true;
}

async function streamById(id, res, visited = new Set()) {
  const clean = cleanId(id);
  if (!clean || visited.has(clean)) return false;
  visited.add(clean);

  if (await streamGridFs(clean, res)) return true;

  const foundDoc = await findGalleryDoc(clean);
  if (!foundDoc) return false;

  const { doc } = foundDoc;
  const linkedFileId = getFileId(doc);
  if (linkedFileId && !sameId(linkedFileId, clean) && !sameId(linkedFileId, doc._id)) {
    if (await streamById(linkedFileId, res, visited)) return true;
  }

  const buffer = pickBuffer(doc);
  if (buffer) {
    res.setHeader('Content-Type', contentTypeOf(doc));
    res.setHeader('Content-Length', String(buffer.length));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(buffer);
    return true;
  }

  const remoteUrl = remoteUrlOf(doc);
  if (remoteUrl) {
    res.redirect(remoteUrl);
    return true;
  }

  return false;
}

async function listGalleryDocs(folderId = '') {
  const db = database();
  const collections = await candidateDocCollections();
  const output = [];
  const seen = new Set();
  const cleanFolderId = cleanId(folderId);
  const folderObjectId = asObjectId(cleanFolderId);

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const query = cleanFolderId
      ? { $or: [
          { folderId: cleanFolderId },
          { folder: cleanFolderId },
          { categoryId: cleanFolderId },
          ...(folderObjectId ? [{ folderId: folderObjectId }, { folder: folderObjectId }, { categoryId: folderObjectId }] : []),
        ] }
      : {};

    const docs = await collection.find(query).sort({ createdAt: -1, updatedAt: -1, _id: -1 }).limit(500).toArray();
    docs.forEach((doc) => {
      const key = `${collectionName}:${cleanId(doc._id)}`;
      if (!seen.has(key)) {
        seen.add(key);
        output.push(serializeGalleryDoc(doc));
      }
    });

    if (output.length) break;
  }

  return output;
}

router.get('/gallery/media/:id', async (req, res) => {
  try {
    const ok = await streamById(req.params.id, res);
    if (!ok && !res.headersSent) {
      res.status(404).json({
        success: false,
        message: 'Gallery file exists as a record, but no MongoDB/GridFS binary was found for this id. Re-upload this image once after applying the fix.',
        id: req.params.id,
      });
    }
  } catch (error) {
    console.error('Gallery media stream error:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/gallery', async (req, res) => {
  try {
    const media = await listGalleryDocs(req.query.folderId || '');
    res.json({ success: true, media, data: media, images: media });
  } catch (error) {
    console.error('Gallery list error:', error);
    res.status(500).json({ success: false, message: error.message, media: [] });
  }
});

router.get('/public/gallery', async (req, res) => {
  try {
    const media = await listGalleryDocs(req.query.folderId || '');
    res.json({ success: true, media, data: media, images: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, media: [] });
  }
});

router.get('/gallery/folders/:folderId/media', async (req, res) => {
  try {
    const media = await listGalleryDocs(req.params.folderId);
    res.json({ success: true, media, data: media, images: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, media: [] });
  }
});

router.get('/public/gallery/folders/:folderId/media', async (req, res) => {
  try {
    const media = await listGalleryDocs(req.params.folderId);
    res.json({ success: true, media, data: media, images: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, media: [] });
  }
});

router.get('/gallery/folders', async (req, res) => {
  try {
    const db = database();
    const docs = await db.collection('galleries').find({}).project({ folderId: 1, folder: 1 }).limit(1000).toArray();
    const ids = [...new Set(docs.map((doc) => cleanId(doc.folderId || doc.folder)).filter(Boolean))];
    const folders = [];

    for (const id of ids) {
      const oid = asObjectId(id);
      const folderDoc = oid
        ? await db.collection('galleryfolders').findOne({ _id: oid }).catch(() => null)
        : null;
      folders.push({ _id: id, id, name: folderDoc?.name || folderDoc?.title || 'Gallery Folder', mediaCount: docs.filter((doc) => cleanId(doc.folderId || doc.folder) === id).length });
    }

    res.json({ success: true, folders, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, folders: [] });
  }
});

router.get('/public/gallery/folders', async (req, res) => {
  try {
    const db = database();
    const docs = await db.collection('galleries').find({}).project({ folderId: 1, folder: 1 }).limit(1000).toArray();
    const ids = [...new Set(docs.map((doc) => cleanId(doc.folderId || doc.folder)).filter(Boolean))];
    res.json({ success: true, folders: ids.map((id) => ({ _id: id, id, name: 'Gallery Folder' })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, folders: [] });
  }
});

async function saveFileToGridFs(file, body = {}) {
  const db = database();
  const bucket = new GridFSBucket(db, { bucketName: 'gallery' });
  const fileId = new ObjectId();
  const safeName = file.originalname || `gallery-${Date.now()}`;
  const contentType = file.mimetype || 'application/octet-stream';

  await new Promise((resolve, reject) => {
    const readable = Readable.from(file.buffer);
    const writeStream = bucket.openUploadStreamWithId(fileId, safeName, {
      contentType,
      metadata: {
        originalName: file.originalname,
        fieldName: file.fieldname,
        folderId: body.folderId || body.folder || body.categoryId || null,
        uploadedAt: new Date(),
      },
    });
    readable.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    readable.pipe(writeStream);
  });

  const doc = {
    title: body.title || body.name || file.originalname || 'Gallery media',
    caption: body.caption || '',
    folderId: body.folderId || body.folder || body.categoryId || null,
    fileId,
    filename: safeName,
    originalName: file.originalname || safeName,
    contentType,
    mimeType: contentType,
    mediaType: contentType.startsWith('video/') ? 'video' : 'image',
    size: file.size,
    imageUrl: publicUrl(fileId),
    mediaUrl: publicUrl(fileId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const inserted = await db.collection('galleries').insertOne(doc);
  return serializeGalleryDoc({ ...doc, _id: inserted.insertedId });
}

async function uploadHandler(req, res) {
  try {
    const files = (req.files || []).filter((file) => /^image\//i.test(file.mimetype || '') || /^video\//i.test(file.mimetype || ''));
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No image/video files received. Use form-data field names like images, files, media, photo, or video.' });
    }

    const media = [];
    for (const file of files) {
      media.push(await saveFileToGridFs(file, req.body || {}));
    }

    return res.status(201).json({ success: true, message: `${media.length} gallery file(s) uploaded to MongoDB GridFS`, uploaded: media.length, media, data: media, images: media });
  } catch (error) {
    console.error('Gallery upload error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

router.post('/admin/gallery/bulk', upload.any(), uploadHandler);
router.post('/admin/gallery/upload', upload.any(), uploadHandler);
router.post('/admin/gallery', upload.any(), uploadHandler);
router.post('/gallery/bulk', upload.any(), uploadHandler);
router.post('/gallery/upload', upload.any(), uploadHandler);

export default router;
