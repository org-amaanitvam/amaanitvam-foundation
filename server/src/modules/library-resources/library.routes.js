import { Router } from "express";

import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, createSubject, getSubjects, getSubjectById, updateSubject, deleteSubject, createDomain, getDomains, getDomainById, updateDomain, deleteDomain,  createResource, getResources, getResourceById, updateResource, deleteResource, viewResource, downloadResource } from "./library.controller.js";

import { validate } from "../../middleware/validate.js";
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

import { createCategorySchema, updateCategorySchema, createSubjectSchema, updateSubjectSchema, createDomainSchema, updateDomainSchema, uploadResourceSchema, updateResourceSchema, resourceFilterSchema } from "./library.validation.js";
import { uploadResourceService } from "./library.service.js";

const libraryRoutes = Router();

// Category Routes
libraryRoutes.post("/categories",authenticate, authorize('admin', 'faculty', 'super_admin'), validate(createCategorySchema), createCategory);
libraryRoutes.get("/categories", getCategories);
libraryRoutes.get("/categories/:id", getCategoryById);
libraryRoutes.put("/categories/:id", authenticate, authorize('admin', 'faculty', 'super_admin'), validate(updateCategorySchema), updateCategory);
libraryRoutes.delete("/categories/:id", authenticate, authorize('admin', 'faculty', 'super_admin'), deleteCategory);


// Subject Routes
libraryRoutes.post("/subjects", authenticate, authorize('admin', 'faculty', 'super_admin'), validate(createSubjectSchema), createSubject);
libraryRoutes.get("/subjects", getSubjects);
libraryRoutes.get("/subjects/:id", getSubjectById);
libraryRoutes.put("/subjects/:id", authenticate, authorize('admin', 'faculty', 'super_admin'), validate(updateSubjectSchema), updateSubject);
libraryRoutes.delete("/subjects/:id", authenticate, authorize('admin', 'faculty', 'super_admin'), deleteSubject);

// Domain Routes
libraryRoutes.post("/domains", authenticate, authorize('admin', 'faculty', 'super_admin'), validate(createDomainSchema), createDomain);
libraryRoutes.get("/domains", getDomains);
libraryRoutes.get("/domains/:id", getDomainById);
libraryRoutes.put("/domains/:id", authenticate, authorize('admin', 'faculty', 'super_admin'),  validate(updateDomainSchema), updateDomain);
libraryRoutes.delete("/domains/:id", authenticate, authorize('admin', 'faculty', 'super_admin'), deleteDomain);

//  Resource Routes
libraryRoutes.post("/resources", uploadResourceService.single("file"), authenticate, authorize('admin', 'faculty', 'super_admin'), validate(uploadResourceSchema), createResource);
libraryRoutes.get("/resources", getResources);
libraryRoutes.get("/resources/:id/view", viewResource);
libraryRoutes.get("/resources/:id/download", downloadResource);
libraryRoutes.get("/resources/:id", getResourceById);
libraryRoutes.put("/resources/:id", authenticate, authorize('admin', 'faculty', 'super_admin'), uploadResourceService.single("file"), validate(updateResourceSchema), updateResource);
libraryRoutes.delete("/resources/:id", authenticate, authorize('admin', 'faculty', 'super_admin'), deleteResource);
  
export default libraryRoutes;