import { createCategoryService, createDomainService, createResourceService, createSubjectService, deleteCategoryService, deleteDomainService, deleteResourceService, deleteSubjectService, downloadResourceService, getCategoriesService, getCategoryByIdService, getDomainByIdService, getDomainsService, getResourceByIdService, getResourcesService, getSubjectByIdService, getSubjectsService, updateCategoryService, updateDomainService, updateResourceService, updateSubjectService, viewResourceService } from "./library.service.js";

function successResponse(res, statusCode = 200, message = "Success", data = null, meta = null) {
  const response = {
    success: true,
    statusCode,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

export async function createCategory(req, res, next) {
  try {
    const category = await createCategoryService(req.body);

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await getCategoriesService(req.query);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const category = await getCategoryByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully.",
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await updateCategoryService(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await deleteCategoryService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}

// Create Subject
export async function createSubject(req, res, next) {
  try {
    const subject = await createSubjectService(req.body);

    return successResponse(
      res,
      201,
      "Subject created successfully.",
      subject
    );
  } catch (error) {
    next(error);
  }
}

// Get All Subjects
export async function getSubjects(req, res, next) {
  try {
    const subjects = await getSubjectsService(req.query);

    return successResponse(
      res,
      200,
      "Subjects fetched successfully.",
      subjects
    );
  } catch (error) {
    next(error);
  }
}

// Get Subject By ID
export async function getSubjectById(req, res, next) {
  try {
    const subject = await getSubjectByIdService(req.params.id);

    return successResponse(
      res,
      200,
      "Subject fetched successfully.",
      subject
    );
  } catch (error) {
    next(error);
  }
}

// Update Subject
export async function updateSubject(req, res, next) {
  try {
    const subject = await updateSubjectService(req.params.id, req.body);

    return successResponse(
      res,
      200,
      "Subject updated successfully.",
      subject
    );
  } catch (error) {
    next(error);
  }
}

// Delete Subject
export async function deleteSubject(req, res, next) {
  try {
    await deleteSubjectService(req.params.id);

    return successResponse(
      res,
      200,
      "Subject deleted successfully."
    );
  } catch (error) {
    next(error);
  }
}

// Create Domain
export async function createDomain(req, res, next) {
  try {
    const domain = await createDomainService(req.body);

    return successResponse(
      res,
      201,
      "Domain created successfully.",
      domain
    );
  } catch (error) {
    next(error);
  }
}

// Get All Domains
export async function getDomains(req, res, next) {
  try {
    const domains = await getDomainsService(req.query);

    return successResponse(
      res,
      200,
      "Domains fetched successfully.",
      domains
    );
  } catch (error) {
    next(error);
  }
}

// Get Domain By ID
export async function getDomainById(req, res, next) {
  try {
    const domain = await getDomainByIdService(req.params.id);

    return successResponse(
      res,
      200,
      "Domain fetched successfully.",
      domain
    );
  } catch (error) {
    next(error);
  }
}

// Update Domain
export async function updateDomain(req, res, next) {
  try {
    const domain = await updateDomainService(req.params.id, req.body);

    return successResponse(
      res,
      200,
      "Domain updated successfully.",
      domain
    );
  } catch (error) {
    next(error);
  }
}

// Delete Domain
export async function deleteDomain(req, res, next) {
  try {
    await deleteDomainService(req.params.id);

    return successResponse(
      res,
      200,
      "Domain deleted successfully."
    );
  } catch (error) {
    next(error);
  }
}

// Create Resource
export async function createResource(req, res, next) {
  try {
    const resource = await createResourceService(req.body, req.file);

    return successResponse(
      res,
      201,
      "Resource created successfully.",
      resource
    );
  } catch (error) {
    next(error);
  }
}

// Get All Resources
export async function getResources(req, res, next) {
  try {
    const resources = await getResourcesService(req.query);

    return successResponse(
      res,
      200,
      "Resources fetched successfully.",
      resources
    );
  } catch (error) {
    next(error);
  }
}

// Get Resource By ID
export async function getResourceById(req, res, next) {
  try {
    const resource = await getResourceByIdService(
      req.params.id
    );

    return successResponse(
      res,
      200,
      "Resource fetched successfully.",
      resource
    );
  } catch (error) {
    next(error);
  }
}

// Update Resource
export async function updateResource(req, res, next) {
  try {
    const resource = await updateResourceService(
      req.params.id,
      req.body,
      req.file
    );

    return successResponse(
      res,
      200,
      "Resource updated successfully.",
      resource
    );
  } catch (error) {
    next(error);
  }
}

// Delete Resource
export async function deleteResource(req, res, next) {
  try {
    await deleteResourceService(req.params.id);

    return successResponse(
      res,
      200,
      "Resource deleted successfully."
    );
  } catch (error) {
    next(error);
  }
}

// View Resource
export async function viewResource(req, res, next) {
  try {
    const resource = await viewResourceService(
      req.params.id,
      req.user?._id
    );

    return successResponse(
      res,
      200,
      "Resource viewed successfully.",
      resource
    );
  } catch (error) {
    next(error);
  }
}

// Download Resource
export async function downloadResource(req, res, next) {
  try {
    const resource = await downloadResourceService(
      req.params.id,
      req.user?._id
    );

    return successResponse(
      res,
      200,
      "Download URL generated successfully.",
      resource
    );
  } catch (error) {
    next(error);
  }
}