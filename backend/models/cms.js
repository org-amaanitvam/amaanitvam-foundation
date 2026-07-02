import mongoose from 'mongoose';

const cmsSchema = new mongoose.Schema({
    homepage: {
        heroTitle: { type: String, default: 'Welcome to Amaanitvam Foundation' },
        heroSubtitle: { type: String, default: 'Empowering Communities' },
        aboutSummary: { type: String, default: 'A brief summary about us.' }
    },
    aboutUs: {
        mission: { type: String, default: 'Our Mission' },
        vision: { type: String, default: 'Our Vision' },
        history: { type: String, default: 'Our History' }
    },
    testimonials: [{
        name: String,
        role: String,
        message: String,
        image: String
    }],
    faq: [{
        question: String,
        answer: String
    }]
}, { timestamps: true });

export default mongoose.model('CMS', cmsSchema);
