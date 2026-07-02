import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Certificate from '../models/certificate.js';
import fs from 'fs';
import path from 'path';

dotenv.config();
await connectDB();

const pdfPath = '/home/codespace/Desktop/GH_ANTIGRAVITY/amaanitvam/jitisha_certificate.pdf';

try {
    if (!fs.existsSync(pdfPath)) {
        console.error('PDF file not found at:', pdfPath);
        process.exit(1);
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    const certData = {
        certificateId: 'AF-2026-002',
        issuedTo: 'Jitisha',
        email: 'jitisha@example.com',
        type: 'Internship',
        domain: 'Frontend Development',
        duration: '3 months',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-04-01'),
        issueDate: new Date('2026-04-15'),
        issuedBy: 'Amaanitvam Foundation',
        isValid: true,
        pdfBuffer: pdfBuffer
    };

    const existing = await Certificate.findOne({ certificateId: 'AF-2026-002' });
    if (existing) {
        existing.pdfBuffer = pdfBuffer;
        await existing.save();
        console.log('Certificate AF-2026-002 updated with PDF buffer!');
    } else {
        await Certificate.create(certData);
        console.log('Certificate AF-2026-002 seeded successfully with PDF!');
    }
} catch (err) {
    console.error('Error seeding certificate:', err.message);
}
process.exit(0);
