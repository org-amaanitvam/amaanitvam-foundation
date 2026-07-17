import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  Folder,
  FolderPlus,
  Image,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import api from '../../../config/api.js';

const MAX_GALLERY_MEDIA_SIZE = 100 * 1024 * 1024;
const GALLERY_UPLOAD_BATCH_SIZE = 5;

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const chunkFiles = (files, size = GALLERY_UPLOAD_BATCH_SIZE) => {
  const chunks = [];

  for (let i = 0; i < files.length; i += size) {
    chunks.push(files.slice(i, i + size));
  }

  return chunks;
};

const isAllowedGalleryFile = (file) => file?.type?.startsWith('image/') || file?.type?.startsWith('video/');
const isVideoMedia = (item) => item?.mediaType === 'video' || item?.contentType?.startsWith('video/');

const getApiBaseUrl = () => (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

const getMediaSrc = (item) => {
  if (!item?.imageUrl) return '';
  if (item.imageUrl.startsWith('http')) return item.imageUrl;
  return `${getApiBaseUrl()}${item.imageUrl}`;
};

const validateGalleryFiles = (files) => {
  const invalidFiles = files.filter((file) => !isAllowedGalleryFile(file));

  if (invalidFiles.length) {
    return `Only photo and video files are allowed. Invalid: ${invalidFiles.map((file) => file.name).join(', ')}`;
  }

  const oversizedFiles = files.filter((file) => file.size > MAX_GALLERY_MEDIA_SIZE);

  if (oversizedFiles.length) {
    return `Each file must be 100MB or smaller. Too large: ${oversizedFiles
      .map((file) => `${file.name} (${formatBytes(file.size)})`)
      .join(', ')}`;
  }

  return '';
};

const formatDate = (value) => {
  if (!value) return '';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function Gallery() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [titlePrefix, setTitlePrefix] = useState('');
  const [viewingMedia, setViewingMedia] = useState(null);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [error, setError] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const selectedFolderSummary = useMemo(
    () => folders.find((folder) => folder._id === selectedFolder?._id) || selectedFolder,
    [folders, selectedFolder]
  );

  const fetchFolders = useCallback(async () => {
    try {
      setError('');
      const response = await api.get('/admin/gallery/folders');
      setFolders(response.data?.folders || []);
    } catch (err) {
      console.error('Error fetching gallery folders:', err);
      setError(err.response?.data?.message || 'Failed to load gallery folders');
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const fetchFolderMedia = useCallback(async (folderId) => {
    if (!folderId) return;

    try {
      setError('');
      setLoadingMedia(true);
      const response = await api.get(`/admin/gallery/folders/${folderId}/media`);
      setMediaItems(response.data?.images || []);

      if (response.data?.folder) {
        setSelectedFolder(response.data.folder);
      }
    } catch (err) {
      console.error('Error fetching folder media:', err);
      setError(err.response?.data?.message || 'Failed to load folder media');
    } finally {
      setLoadingMedia(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const openFolder = (folder) => {
    setSelectedFolder(folder);
    setMediaItems([]);
    fetchFolderMedia(folder._id);
  };

  const goBackToFolders = () => {
    setSelectedFolder(null);
    setMediaItems([]);
    setError('');
    fetchFolders();
  };

  const resetUploadForm = () => {
    setSelectedFiles([]);
    setTitlePrefix('');
    setShowUploadModal(false);
  };


  const openEditMedia = (mediaItem) => {
    setEditingMedia(mediaItem);
    setEditTitle(mediaItem?.title || '');
    setEditFile(null);
    setError('');
  };

  const resetEditForm = () => {
    setEditingMedia(null);
    setEditTitle('');
    setEditFile(null);
  };

  const handleCreateFolder = async (event) => {
    event.preventDefault();
    const folderName = newFolderName.trim();

    if (!folderName) {
      setError('Folder name is required');
      return;
    }

    try {
      setCreatingFolder(true);
      setError('');
      const response = await api.post('/admin/gallery/folders', {
        name: folderName,
        description: newFolderDescription.trim(),
      });

      const createdFolder = response.data?.folder;
      setNewFolderName('');
      setNewFolderDescription('');
      setShowCreateFolder(false);
      await fetchFolders();

      if (createdFolder) {
        openFolder(createdFolder);
      }
    } catch (err) {
      console.error('Error creating gallery folder:', err);
      setError(err.response?.data?.message || 'Failed to create gallery folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    const validationError = validateGalleryFiles(files);

    if (validationError) {
      setError(validationError);
      event.target.value = '';
      return;
    }

    setSelectedFiles(files);
    setError('');
  };


  const handleEditFileChange = (event) => {
    const [file] = Array.from(event.target.files || []);

    if (!file) {
      setEditFile(null);
      return;
    }

    const validationError = validateGalleryFiles([file]);

    if (validationError) {
      setError(validationError);
      setEditFile(null);
      event.target.value = '';
      return;
    }

    setEditFile(file);
    setError('');
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFolderSummary?._id) {
      setError('Open a folder before uploading media');
      return;
    }

    if (!selectedFiles.length) {
      setError('Please select photos or videos to upload');
      return;
    }

    const validationError = validateGalleryFiles(selectedFiles);

    if (validationError) {
      setError(validationError);
      return;
    }

    const uploadTitle = titlePrefix.trim() || selectedFolderSummary.name;
    const batches = chunkFiles(selectedFiles);
    const uploaded = [];

    try {
      setUploading(true);
      setError('');

      for (const batch of batches) {
        const formData = new FormData();
        formData.append('titlePrefix', uploadTitle);
        formData.append('folderId', selectedFolderSummary._id);

        batch.forEach((file) => formData.append('media', file));

        const response = await api.post(
          `/admin/gallery/folders/${selectedFolderSummary._id}/bulk`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        uploaded.push(...(response.data?.images || []));
      }

      setMediaItems((prev) => [...uploaded, ...prev]);
      resetUploadForm();
      await fetchFolders();
      await fetchFolderMedia(selectedFolderSummary._id);
    } catch (err) {
      console.error('Error uploading gallery media:', err);
      setError(err.response?.data?.message || 'Failed to upload gallery media');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateMedia = async (event) => {
    event.preventDefault();

    if (!editingMedia?._id) {
      setError('Select media to edit');
      return;
    }

    const nextTitle = editTitle.trim();

    if (!nextTitle) {
      setError('Media name is required');
      return;
    }

    if (editFile) {
      const validationError = validateGalleryFiles([editFile]);

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      setSavingEdit(true);
      setError('');

      const formData = new FormData();
      formData.append('title', nextTitle);

      if (editFile) {
        formData.append('media', editFile);
      }

      const response = await api.put(`/admin/gallery/${editingMedia._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedMedia = response.data?.image;

      if (updatedMedia) {
        setMediaItems((prev) => prev.map((item) => (item._id === updatedMedia._id ? updatedMedia : item)));
        setViewingMedia((prev) => (prev?._id === updatedMedia._id ? updatedMedia : prev));
      }

      resetEditForm();
      await fetchFolders();

      if (selectedFolderSummary?._id) {
        await fetchFolderMedia(selectedFolderSummary._id);
      }
    } catch (err) {
      console.error('Error updating gallery media:', err);
      setError(err.response?.data?.message || 'Failed to update gallery media');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteMedia = async (mediaItem) => {
    const confirmed = window.confirm(`Delete "${mediaItem.title}" from this folder?`);

    if (!confirmed) return;

    try {
      setError('');
      await api.delete(`/admin/gallery/${mediaItem._id}`);
      setMediaItems((prev) => prev.filter((item) => item._id !== mediaItem._id));
      await fetchFolders();
      if (selectedFolderSummary?._id) {
        await fetchFolderMedia(selectedFolderSummary._id);
      }
    } catch (err) {
      console.error('Error deleting gallery media:', err);
      setError(err.response?.data?.message || 'Failed to delete gallery media');
    }
  };

  const handleDeleteFolder = async (folder) => {
    const confirmed = window.confirm(
      `Delete the folder "${folder.name}" and all ${folder.mediaCount || 0} media item(s) inside it?`
    );

    if (!confirmed) return;

    try {
      setError('');
      await api.delete(`/admin/gallery/folders/${folder._id}`);
      if (selectedFolder?._id === folder._id) {
        setSelectedFolder(null);
        setMediaItems([]);
      }
      await fetchFolders();
    } catch (err) {
      console.error('Error deleting gallery folder:', err);
      setError(err.response?.data?.message || 'Failed to delete gallery folder');
    }
  };

  const renderFolderGrid = () => {
    if (loadingFolders) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading gallery folders...</span>
        </div>
      );
    }

    if (!folders.length) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <Folder className="mx-auto mb-4 h-14 w-14 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">No gallery folders yet</h3>
          <p className="mt-2 text-sm text-gray-500">Create a project folder first, then upload photos and videos inside it.</p>
          <button
            onClick={() => setShowCreateFolder(true)}
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Folder
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {folders.map((folder) => {
          const coverMedia = folder.coverMedia;
          const coverSrc = getMediaSrc(coverMedia);
          const coverIsVideo = isVideoMedia(coverMedia);

          return (
            <div key={folder._id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <button type="button" onClick={() => openFolder(folder)} className="block w-full text-left">
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
                  {coverSrc ? (
                    coverIsVideo ? (
                      <video src={coverSrc} className="h-full w-full object-cover" muted preload="metadata" />
                    ) : (
                      <img src={coverSrc} alt={folder.name} className="h-full w-full object-cover" loading="lazy" />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Folder className="h-16 w-16 text-blue-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    {folder.mediaCount || 0} item{folder.mediaCount === 1 ? '' : 's'}
                  </div>
                  {coverIsVideo && (
                    <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                      Video cover
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {folder.description || 'Project gallery folder'}
                      </p>
                    </div>
                    <Folder className="h-5 w-5 shrink-0 text-blue-500" />
                  </div>
                  <p className="mt-4 text-xs text-gray-400">Created {formatDate(folder.createdAt)}</p>
                </div>
              </button>

              <div className="border-t border-gray-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => handleDeleteFolder(folder)}
                  className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete folder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMediaGrid = () => {
    if (loadingMedia) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading folder media...</span>
        </div>
      );
    }

    if (!mediaItems.length) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <Image className="mx-auto mb-4 h-14 w-14 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">This folder is empty</h3>
          <p className="mt-2 text-sm text-gray-500">Upload project photos and videos in bulk to create a clean folder preview.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {mediaItems.map((item) => {
          const mediaSrc = getMediaSrc(item);
          const isVideo = isVideoMedia(item);

          return (
            <div key={item._id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-video bg-gray-100">
                {isVideo ? (
                  <video src={mediaSrc} className="h-full w-full object-cover" muted preload="metadata" />
                ) : (
                  <img src={mediaSrc} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setViewingMedia(item)}
                    className="rounded-full bg-white p-3 text-gray-700 shadow hover:bg-gray-50"
                    title="Preview"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditMedia(item)}
                    className="rounded-full bg-blue-600 p-3 text-white shadow hover:bg-blue-700"
                    title="Edit"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(item)}
                    className="rounded-full bg-red-600 p-3 text-white shadow hover:bg-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                  {isVideo ? <Video className="mr-1 inline h-3 w-3" /> : <Image className="mr-1 inline h-3 w-3" />}
                  {isVideo ? 'Video' : 'Photo'}
                </div>
              </div>

              <div className="p-4">
                <h3 className="truncate text-sm font-semibold text-gray-900">{item.title}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{formatBytes(item.size)}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">Admin Portal</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="mt-2 text-sm text-gray-500">
            Organize project photos and videos into folders, upload in bulk, preview, edit, and delete media quickly.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedFolderSummary ? (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </button>
          ) : (
            <button
              onClick={() => setShowCreateFolder(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Folder
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="ml-4 text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {selectedFolderSummary ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={goBackToFolders}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                title="Back to folders"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedFolderSummary.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedFolderSummary.description || 'Project media folder'}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {selectedFolderSummary.mediaCount || mediaItems.length} media item(s)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Media
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFolder(selectedFolderSummary)}
                className="inline-flex items-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Folder
              </button>
            </div>
          </div>

          {renderMediaGrid()}
        </div>
      ) : (
        renderFolderGrid()
      )}

      {showCreateFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateFolder} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Gallery Folder</h2>
                <p className="mt-1 text-sm text-gray-500">Use one folder for each project/event.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateFolder(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  placeholder="Example: Tree Plantation Drive 2026"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newFolderDescription}
                  onChange={(event) => setNewFolderDescription(event.target.value)}
                  placeholder="Short project/event detail"
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateFolder(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingFolder}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingFolder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderPlus className="mr-2 h-4 w-4" />}
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {showUploadModal && selectedFolderSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleUpload} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Upload to {selectedFolderSummary.name}</h2>
                <p className="mt-1 text-sm text-gray-500">Photos and videos upload in safe batches of five, up to 100MB per file.</p>
              </div>
              <button
                type="button"
                onClick={resetUploadForm}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Media title prefix</label>
                <input
                  type="text"
                  value={titlePrefix}
                  onChange={(event) => setTitlePrefix(event.target.value)}
                  placeholder={selectedFolderSummary.name}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">Example: "Tree Plantation" becomes Tree Plantation 1, Tree Plantation 2...</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Select photos/videos</label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50">
                  <Upload className="mb-3 h-10 w-10 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Click to select files</span>
                  <span className="mt-1 text-xs text-gray-500">Bulk upload supported. Images and videos only.</span>
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">Selected files ({selectedFiles.length})</p>
                  <div className="mt-3 max-h-40 space-y-2 overflow-auto text-sm text-gray-600">
                    {selectedFiles.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded bg-white px-3 py-2">
                        <span className="truncate">{file.name}</span>
                        <span className="ml-3 shrink-0 text-xs text-gray-400">{formatBytes(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetUploadForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFiles.length}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Media'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleUpdateMedia} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Media</h2>
                <p className="mt-1 text-sm text-gray-500">Change the media name or replace the photo/video inside this folder.</p>
              </div>
              <button
                type="button"
                onClick={resetEditForm}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-[220px_1fr]">
              <div className="overflow-hidden rounded-xl bg-gray-100">
                {isVideoMedia(editingMedia) ? (
                  <video src={getMediaSrc(editingMedia)} className="aspect-video h-full w-full object-cover" muted preload="metadata" />
                ) : (
                  <img src={getMediaSrc(editingMedia)} alt={editingMedia.title} className="aspect-video h-full w-full object-cover" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Media Name</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    placeholder="Enter media name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Replace Photo/Video</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-5 text-center hover:border-blue-400 hover:bg-blue-50">
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Choose new file</span>
                    <span className="mt-1 text-xs text-gray-500">Optional. Leave blank to only rename.</span>
                    <input type="file" accept="image/*,video/*" onChange={handleEditFileChange} className="hidden" />
                  </label>
                </div>

                {editFile && (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate">{editFile.name}</span>
                      <span className="shrink-0 text-xs text-gray-400">{formatBytes(editFile.size)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetEditForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {viewingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-full w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setViewingMedia(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-h-[75vh] bg-black">
              {isVideoMedia(viewingMedia) ? (
                <video src={getMediaSrc(viewingMedia)} controls className="mx-auto max-h-[75vh] w-full object-contain" />
              ) : (
                <img src={getMediaSrc(viewingMedia)} alt={viewingMedia.title} className="mx-auto max-h-[75vh] w-full object-contain" />
              )}
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900">{viewingMedia.title}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {viewingMedia.originalName || 'Gallery media'} · {formatBytes(viewingMedia.size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
