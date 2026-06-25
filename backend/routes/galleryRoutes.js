import express from 'express';
import Gallery from '../models/gallery.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filenameGallery = fileURLToPath(import.meta.url);
const __dirnameGallery = path.dirname(__filenameGallery);

const router = express.Router();

// GET /api/gallery
// Public route to fetch all gallery images
router.get('/', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, images });
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({ success: false, message: 'Server error fetching gallery.' });
    }
});

// GET /api/gallery/seed
// Public route to seed initial gallery images
router.get('/seed', async (req, res) => {
    try {
        const sourceDir = path.join(__dirnameGallery, '../../frontend/assets/images');
        const destDir = path.join(__dirnameGallery, '../uploads');

        const defaultImages = [
            { file: 'project-manthan2.png', title: 'Project Manthan — Counselling & Awareness' },
            { file: 'project-shiksha2.png', title: 'Project Shiksha — Education Support' },
            { file: 'hero.png', title: 'Project Pravah — Youth Empowerment in Hisar' },
            { file: 'prakruti-seva-samman.jpeg', title: 'Community Ceremony' },
            { file: 'gallery_image_2.png', title: 'Prakruti Seva Samman Award Recognition' },
            { file: 'gallery_image_3.png', title: 'Internship Drive' }
        ];

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        await Gallery.deleteMany({});
        let created = 0;

        for (const img of defaultImages) {
            const sourcePath = path.join(sourceDir, img.file);
            const destFileName = `seeded_${Date.now()}_${img.file}`;
            const destPath = path.join(destDir, destFileName);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                await Gallery.create({
                    imageUrl: `/uploads/${destFileName}`,
                    title: img.title
                });
                created++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully seeded ${created} gallery images! They will now appear on both the main website and the admin portal.`
        });
    } catch (error) {
        console.error('Error seeding gallery:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
