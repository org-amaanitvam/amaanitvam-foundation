import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Certificate from '../models/certificate.js';

dotenv.config();
await connectDB();

const sampleCert = {
    certificateId: 'AF-2026-001',
    issuedTo: 'Amaanitvam Foundation',
    email: 'tech.amaanitvam@gmail.com',
    type: 'Internship',
    domain: 'Full stack',
    duration: '3 months',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-06-01'),
    issueDate: new Date('2026-06-15'),
    issuedBy: 'Amaanitvam Foundation',
    isValid: true
};

try {
    const existing = await Certificate.findOne({ certificateId: 'AF-2026-001' });
    if (existing) {
        console.log('Certificate AF-2026-001 already exists!');
    } else {
        await Certificate.create(sampleCert);
        console.log('Certificate AF-2026-001 seeded successfully!');
    }
} catch (err) {
    console.error('Error seeding certificate:', err.message);
}
process.exit(0);
