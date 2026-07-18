import express from 'express';
import { getAllUsers, createUser } from './user.controller.js'; // Added createUser here

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser); // This line unlocks Thunder Client!

export default router;