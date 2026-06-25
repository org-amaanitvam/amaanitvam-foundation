import express from 'express';
const app = express();
const router = express.Router();
router.get('/', (req, res) => res.send('root'));
router.get('/seed', (req, res) => res.send('seed'));
app.use('/api/gallery', router);
app.listen(5001, () => {
  setTimeout(() => process.exit(0), 1000);
});
