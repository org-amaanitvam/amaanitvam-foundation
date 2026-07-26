import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requireRole,
} from "../../middleware/dashboardAccess.js";
import {
  listContacts,
  listEventRegistrations,
  registerForEvent,
  submitContact,
} from "./publicForm.controller.js";

const router = express.Router();

router.post("/contact", submitContact);
router.post("/contacts", submitContact);
router.post("/learning-hub/register", registerForEvent);
router.post("/events/register", registerForEvent);

const superAdminOnly = [
  authenticate,
  requireDashboardAccess,
  requireRole("super_admin"),
];

router.get("/public-forms/contacts", ...superAdminOnly, listContacts);
router.get(
  "/public-forms/event-registrations",
  ...superAdminOnly,
  listEventRegistrations,
);

export default router;
