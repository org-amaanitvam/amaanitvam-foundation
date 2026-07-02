import express from 'express';
import { globalSearch } from '../controllers/searchController.js';

const searchRouter = express.Router();
searchRouter.get('/', globalSearch);

export default searchRouter;
