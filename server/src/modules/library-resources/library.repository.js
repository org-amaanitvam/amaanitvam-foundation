import { Category, Domain, Resource, Subject } from "./library.model.js"

//CATEGORY
export async function createCategory(data) {
  return Category.create(data);
}

export async function getCategories(filter) {
  return Category.find({
    ...filter,
    is_active: true
  }).sort({ name: 1 });
}

export async function getCategoryById(id) {
  return Category.findById(id);
}

export async function updateCategoryById(id, data) {
  return Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

export async function deleteCategoryById(id) {
  return Category.findByIdAndDelete(id);
}

export async function findCategoryByName(name) {
  return Category.findOne({
    name,
    is_active: true
  });
}

export async function countSubjectsByCategory(categoryId) {
  return Subject.countDocuments({
    category_id: categoryId
  });
}

export async function countResourcesByCategory(categoryId) {
  return Resource.countDocuments({
    category_id: categoryId,
    is_deleted: false
  });
}

//SUBJECT
export async function createSubject(data) {
  return Subject.create(data);
}

export async function getSubjects(filter) {
  return Subject.find({
    ...filter,
    is_active: true
  });
}

export async function getSubjectById(id) {
  return Subject.findById(id);
}

export async function updateSubjectById(id, data) {
  return Subject.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  })
}

export async function deleteSubjectById(id) {
  return Subject.findByIdAndDelete(id);
}

export async function findSubjectByName(categoryId, name) {
  return Subject.findOne({
    name,
    category_id: categoryId,
    is_active: true
  })
}

export async function countDomainsBySubject(subjectId) {
  return Domain.countDocuments({
    subject_id: subjectId
  });
}

export async function countResourcesBySubject(subjectId) {
  return Resource.countDocuments({
    subject_id: subjectId,
    is_deleted: false
  });
}

//DOMAIN
export async function createDomain(data) {
  return Domain.create(data);
}

export async function getDomains(filter) {
  return Domain.find({
    ...filter,
    is_active: true
  })
}

export async function getDomainById(id) {
  return Domain.findById(id);
}

export async function updateDomainById(id, data) {
  return Domain.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  })
}

export async function deleteDomainById(id) {
  return Domain.findByIdAndDelete(id);
}

export async function findDomainByName(subjectId, name) {
  return Domain.findOne({
    subject_id: subjectId,
    name,
    is_active: true
  });
}

export async function countResourcesByDomain(domainId) {
  return Resource.countDocuments({
    domain_id: domainId,
    is_deleted: false
  });
}

// RESOURCE
export async function createResource(data) {
  return Resource.create(data);
}

export async function getResources({
  page = 1,
  limit = 10,
  search,
  category_id,
  subject_id,
  domain_id,
  grade_level,
  resource_type,
  language,
  is_free,
  sort_by = "createdAt",
  sort_order = "desc"
}) {
  const filter = {
    is_published: true
  };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category_id) filter.category_id = category_id;
  if (subject_id) filter.subject_id = subject_id;
  if (domain_id) filter.domain_id = domain_id;
  if (grade_level) filter.grade_level = grade_level;
  if (resource_type) filter.resource_type = resource_type;
  if (language) filter.language = language;
  if (typeof is_free === "boolean") filter.is_free = is_free;

  const skip = (page - 1) * limit;

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .sort({ [sort_by]: sort_order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit),

    Resource.countDocuments(filter)
  ]);

  return {
    resources,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getResourceById(id) {
  return Resource.findById(id);
}

export async function updateResourceById(id, data) {
  return Resource.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

export async function deleteResourceById(id, permanent = false) {
  return permanent
    ? Resource.findByIdAndDelete(id)
    : Resource.findByIdAndUpdate(
      id,
      { is_deleted: true },
      {
        new: true,
        runValidators: true
      }
    );
}

export async function incrementViewCount(id) {
  return Resource.findByIdAndUpdate(
    id,
    { $inc: { view_count: 1 } },
    { new: true }
  );
}

export async function incrementDownloadCount(id) {
  return Resource.findByIdAndUpdate(
    id,
    { $inc: { download_count: 1 } },
    { new: true }
  );
}

// RESOURCE ACCESS HISTORY
export async function createAccessHistory(data) {
  return ResourceAccessHistory.create(data);
}

export async function getAccessHistoryById(resourceId) {
  return ResourceAccessHistory.find({
    resource_id: resourceId
  }).sort({ createdAt: -1 });
}