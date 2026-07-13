import express from "express";
import { createContact, getContactMessages } from "../controllers/contactController.js";

const router = express.Router();

// Public website form submission route
router.post('/', createContact);

// Admin Portal fetch routes (We add '/all' to bypass the trailing slash bug)
router.get('/', getContactMessages);
router.get('/all', getContactMessages);

export default router;