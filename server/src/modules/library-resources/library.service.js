import multer from "multer";

import { countDomainsBySubject, countResourcesByCategory, countResourcesByDomain, countResourcesBySubject, countSubjectsByCategory, createCategory, createDomain, createResource, createSubject, deleteDomainById, deleteResourceById, deleteSubjectById, findCategoryByName, findDomainByName, findSubjectByName, getAccessHistoryById, getCategories, getCategoryById, getDomainById, getDomains, getResourceById, getResources, getSubjectById, getSubjects, updateCategoryById, updateDomainById, updateSubjectById } from "./library.repository.js"
import logger from "../../shared/logger/index.js";
import cloudinary from "../../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

//DETERMINE THE RESOURCE TYPE FOR STORING IN CLOUDINARY DATABASE
function getResourceType(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";

  return "raw";
}

async function validateResource(resourceId) {
  const resource = await getResourceById(resourceId);

  if (!resource) {
    throw new Error("Resource not found.");
  }

  if (resource.is_deleted) {
    throw new Error("Resource has been deleted.");
  }

  if (!resource.is_published) {
    throw new Error("Resource is not published.");
  }

  return resource;
}

// CATEGORY SERVICE
export async function createCategoryService(data) {
  const existingCategory = await findCategoryByName(data.name);
  if (existingCategory) {
    throw new Error("Category already exists.");
  }

  return await createCategory(data);
}

export async function getCategoriesService(query) {
  const filter = {};

  if (query.name) {
    filter.name = query.name;
  }

  if (query.is_active !== undefined) {
    filter.is_active = query.is_active;
  }

  return await getCategories(filter);
}

export async function getCategoryByIdService(id) {
  const category = await getCategoryById(id);
  if (!category) {
    throw new Error("Category not found.");
  }

  return category;
}

export async function updateCategoryService(id, data) {
  const category = await getCategoryById(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  if (data.name && data.name !== category.name) {
    const existingCategory = await findCategoryByName(data.name);
    if (existingCategory && existingCategory._id.toString() !== id
    ) {
      throw new Error("Category already exists.");
    }
  }

  return await updateCategoryById(id, data);
}

export async function deleteCategoryService(id) {
  const category = await getCategoryById(id);
  if (!category) {
    throw new Error("Category not found.");
  }

  // Check Subjects
  const subjectCount = await countSubjectsByCategory(id);
  if (subjectCount > 0) {
    throw new Error(
      "Cannot delete category because it contains subjects."
    );
  }

  // Check Resources
  const resourceCount = await countResourcesByCategory(id);
  if (resourceCount > 0) {
    throw new Error(
      "Cannot delete category because it is used by resources."
    );
  }

  return await deleteCategory(id);
}

// SUBJECT SERVICE
export async function createSubjectService(data) {
  const category = await getCategoryById(data.category_id);

  if (!category) {
    throw new Error("Category not found.");
  }

  const existingSubject = await findSubjectByName(
    data.category_id,
    data.name
  );

  if (existingSubject) {
    throw new Error("Subject already exists in this category.");
  }

  return await createSubject(data);
}

export async function getSubjectsService(query) {
  const filter = {};

  if (query.category_id) {
    filter.category_id = query.category_id;
  }

  if (query.name) {
    filter.name = {
      $regex: query.name,
      $options: "i"
    };
  }

  if (query.is_active !== undefined) {
    filter.is_active = query.is_active;
  }

  return await getSubjects(filter);
}

export async function getSubjectByIdService(id) {
  const subject = await getSubjectById(id);

  if (!subject) {
    throw new Error("Subject not found.");
  }

  return subject;
}

export async function updateSubjectService(id, data) {
  const subject = await getSubjectById(id);

  if (!subject) {
    throw new Error("Subject not found.");
  }

  if (data.category_id) {
    const category = await getCategoryById(data.category_id);

    if (!category) {
      throw new Error("Category not found.");
    }
  }

  if (data.name) {
    const categoryId = data.category_id || subject.category_id;

    const existingSubject = await findSubjectByName(
      categoryId,
      data.name
    );

    if (existingSubject && existingSubject._id.toString() !== id
    ) {
      throw new Error(
        "Subject already exists in this category."
      );
    }
  }

  return await updateSubjectById(id, data);
}

export async function deleteSubjectService(id) {
  const subject = await getSubjectById(id);

  if (!subject) {
    throw new Error("Subject not found.");
  }

  const domainCount = await countDomainsBySubject(id);
  if (domainCount > 0) {
    throw new Error(
      "Cannot delete subject because it contains domains."
    );
  }

  const resourceCount = await countResourcesBySubject(id);
  if (resourceCount > 0) {
    throw new Error(
      "Cannot delete subject because it is used by resources."
    );
  }

  return await deleteSubjectById(id);
}

// DOMAIN SERVICE
export async function createDomainService(data) {
  const subject = await getSubjectById(data.subject_id);

  if (!subject) {
    throw new Error("Subject not found.");
  }

  const existingDomain = await findDomainByName(
    data.subject_id,
    data.name
  );

  if (existingDomain) {
    throw new Error("Domain already exists in this subject.");
  }

  return await createDomain(data);
}

export async function getDomainsService(query) {
  const filter = {};

  if (query.subject_id) {
    filter.subject_id = query.subject_id;
  }

  if (query.name) {
    filter.name = {
      $regex: query.name,
      $options: "i"
    };
  }

  if (query.is_active !== undefined) {
    filter.is_active = query.is_active;
  }

  return await getDomains(filter);
}

export async function getDomainByIdService(id) {
  const domain = await getDomainById(id);
  if (!domain) {
    throw new Error("Domain not found.");
  }

  return domain;
}

export async function updateDomainService(id, data) {
  const domain = await getDomainById(id);

  if (!domain) {
    throw new Error("Domain not found.");
  }

  if (data.subject_id) {
    const subject = await getSubjectById(data.subject_id);

    if (!subject) {
      throw new Error("Subject not found.");
    }
  }

  if (data.name) {
    const subjectId = data.subject_id || domain.subject_id;
    const existingDomain = await findDomainByName(
      subjectId,
      data.name
    );

    if (existingDomain && existingDomain._id.toString() !== id
    ) {
      throw new Error("Domain already exists in this subject.");
    }
  }

  return await updateDomainById(id, data);
}

export async function deleteDomainService(id) {
  const domain = await getDomainById(id);

  if (!domain) {
    throw new Error("Domain not found.");
  }

  const resourceCount = await countResourcesByDomain(id);
  if (resourceCount > 0) {
    throw new Error(
      "Cannot delete domain because it is used by resources."
    );
  }

  return await deleteDomainById(id);
}

// RESOURCE
export async function createResourceService(data, file) {
  // File validation
  if (!file) {
    throw new Error("Resource file is required.");
  }

  // Validate Category
  const category = await getCategoryById(data.category_id);

  if (!category) {
    throw new Error("Category not found.");
  }

  // Validate Subject
  const subject = await getSubjectById(data.subject_id);

  if (!subject) {
    throw new Error("Subject not found.");
  }

  // Validate Domain
  const domain = await getDomainById(data.domain_id);

  if (!domain) {
    throw new Error("Domain not found.");
  }

  // Determine Cloudinary resource type
  const resourceType = getResourceType(file.mimetype);

  // const uploadedFile = await uploadResourceFile(
  //   file,
  //   "library/resources",
  //   resourceType
  // );

  // Prepare resource data
  const resourceData = {
    ...data,
    content_url: file.path,
    content_public_id: file.filename,
    mime_type: file.mimetype,
    file_size: file.size,
    view_count: 0,
    download_count: 0,
    ai_indexed: false
  };

  // Save to database
  const resource = await createResource(resourceData);

  // Future AI indexing can be triggered here
  // await aiIndexingService(resource);

  return resource;
}

export async function getResourcesService(query) {
  const filter = {};

  if (query.category_id) {
    filter.category_id = query.category_id;
  }

  if (query.subject_id) {
    filter.subject_id = query.subject_id;
  }

  if (query.domain_id) {
    filter.domain_id = query.domain_id;
  }

  if (query.grade_level) {
    filter.grade_level = query.grade_level;
  }

  if (query.resource_type) {
    filter.resource_type = query.resource_type;
  }

  if (query.language) {
    filter.language = query.language;
  }

  if (query.is_free !== undefined) {
    filter.is_free = query.is_free;
  }

  return await getResources(filter);
}

export async function getResourceByIdService(id) {
  const resource = await getDomainById(id);
  if (!resource) {
    throw new Error("Resource not found.");
  }

  return domain;
}

export async function updateResourceService(id, data, file) {
  // Check if resource exists
  const resource = await validateResource(id);

  // Validate Category If category not found and it try to update
  if (data.category_id) {
    const category = await getCategoryById(data.category_id);

    if (!category) {
      throw new Error("Category not found.");
    }
  }

  // Validate Subject If subject not found and it try to update
  if (data.subject_id) {
    const subject = await getSubjectById(data.subject_id);

    if (!subject) {
      throw new Error("Subject not found.");
    }
  }

  // // Validate Domain If Domain not found and it try to update
  if (data.domain_id) {
    const domain = await getDomainById(data.domain_id);

    if (!domain) {
      throw new Error("Domain not found.");
    }
  }

  // Upload new file if provided
  if (file) {
    // Delete old file from Cloudinary
    if (resource.content_public_id) {
      const oldResourceType = getResourceType(resource.mime_type);

      await deleteFile(
        resource.content_public_id,
        oldResourceType
      );
    }

    // Upload new file
    const newResourceType = getResourceType(file.mimetype);

    const uploadedFile = await uploadFile(
      file.buffer,
      "library/resources",
      newResourceType
    );

    // Update file-related fields
    data.content_url = uploadedFile.secure_url;
    data.content_public_id = uploadedFile.public_id;
    data.mime_type = file.mimetype;
    data.file_size = file.size;
  }

  return await updateResourceRepository(id, data);
}

export async function deleteResourceService(id, permanent) {
  return await deleteResourceById(id, permanent);
}

export async function downloadResourceService(resourceId, userId) {
  const resource = await validateResource(resourceId);

  await incrementDownloadCount(resourceId);

  await createAccessHistory({
    resource_id: resourceId,
    user_id: userId,
    action: "DOWNLOAD"
  });

  return resource;
}

export async function viewResourceService(resourceId, userId) {
  const resource = await validateResource(resourceId);

  await incrementViewCount(resourceId);

  await createAccessHistory({
    resource_id: resourceId,
    user_id: userId,
    action: "VIEW"
  });

  return resource;
}

// RESOURCE ACCESS HISTORY
export async function getAccessHistoryService(resourceId) {
  const resource = await validateResource(resourceId);

  return getAccessHistory(resourceId);
}

// MULTER FILE UPLOAD SERVICE
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = file.originalname.split(".")[0];
    const uniqueId = Date.now();

    return {
      folder: "library/resources",
      public_id: `${uniqueId}-${originalName}`,
      resource_type: "auto",
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type."));
  }
};

export const uploadResourceService = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

// CLOUDINARY UPLOAD FILE SERVICE;
export async function uploadResourceFile(
  file,
  folder = "library/resources",
  resourceType = "raw"
) {
  if (!file) {
    throw new Error("No file provided.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary Upload Error");
          console.error(error);
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          originalFilename: result.original_filename,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
}