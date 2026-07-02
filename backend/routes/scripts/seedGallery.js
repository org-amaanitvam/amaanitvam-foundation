import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Gallery from '../models/gallery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const sourceDir = path.join(__dirname, '../../frontend/assets/images');
const destDir = path.join(__dirname, '../uploads');

const defaultImages = [
    { file: 'project-manthan2.png', title: 'Project Manthan — Counselling & Awareness' },
    { file: 'project-shiksha2.png', title: 'Project Shiksha — Education Support' },
    { file: 'hero.png', title: 'Project Pravah — Youth Empowerment in Hisar' },
    { file: 'prakruti-seva-samman.jpeg', title: 'Community Ceremony' },
    { file: 'gallery_image_2.png', title: 'Prakruti Seva Samman Award Recognition' },
    { file: 'gallery_image_3.png', title: 'Internship Drive' }
];

async function seedGallery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // ensure uploads directory exists
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // clear existing gallery
        await Gallery.deleteMany({});
        console.log('Cleared existing gallery entries');

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
                console.log(`Added: ${img.title}`);
            } else {
                console.log(`File not found: ${sourcePath}`);
            }
        }

        console.log('Gallery seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding gallery:', err);
        process.exit(1);
    }
}

seedGallery();
