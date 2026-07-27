import { API_BASE_URL } from './api-client.js';

/* ===== Amaanitvam Optimized Gallery Album Loader & Lightbox ===== */
(function () {
    'use strict';

    const container = document.getElementById('gallery-album-container');
    const isGalleryPage = document.body?.dataset?.page === 'gallery' || /gallery\.html?$/i.test(window.location.pathname);
    if (!container || !isGalleryPage) return;

    // Optimized static project albums dataset (capped at max 30 images per album)
    const STATIC_ALBUMS = [
  {
    "id": "project-shiksha",
    "name": "Project Shiksha",
    "description": "Education support, tutoring sessions, and learning material distribution for underprivileged students.",
    "folder": "Projects/ProjectShiksha",
    "mediaCount": 30,
    "coverUrl": "/images/Projects/ProjectShiksha/1.jpg",
    "images": [
      {
        "id": "project-shiksha-1.jpg",
        "title": "Project Shiksha - Photo 1",
        "imageUrl": "/images/Projects/ProjectShiksha/1.jpg",
        "url": "/images/Projects/ProjectShiksha/1.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-2.jpg",
        "title": "Project Shiksha - Photo 2",
        "imageUrl": "/images/Projects/ProjectShiksha/2.jpg",
        "url": "/images/Projects/ProjectShiksha/2.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-3.jpg",
        "title": "Project Shiksha - Photo 3",
        "imageUrl": "/images/Projects/ProjectShiksha/3.jpg",
        "url": "/images/Projects/ProjectShiksha/3.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-4.png",
        "title": "Project Shiksha - Photo 4",
        "imageUrl": "/images/Projects/ProjectShiksha/4.png",
        "url": "/images/Projects/ProjectShiksha/4.png",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-5.jpg",
        "title": "Project Shiksha - Photo 5",
        "imageUrl": "/images/Projects/ProjectShiksha/5.jpg",
        "url": "/images/Projects/ProjectShiksha/5.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-6.jpg",
        "title": "Project Shiksha - Photo 6",
        "imageUrl": "/images/Projects/ProjectShiksha/6.jpg",
        "url": "/images/Projects/ProjectShiksha/6.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-7.png",
        "title": "Project Shiksha - Photo 7",
        "imageUrl": "/images/Projects/ProjectShiksha/7.png",
        "url": "/images/Projects/ProjectShiksha/7.png",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-8.jpg",
        "title": "Project Shiksha - Photo 8",
        "imageUrl": "/images/Projects/ProjectShiksha/8.jpg",
        "url": "/images/Projects/ProjectShiksha/8.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-9.png",
        "title": "Project Shiksha - Photo 9",
        "imageUrl": "/images/Projects/ProjectShiksha/9.png",
        "url": "/images/Projects/ProjectShiksha/9.png",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-10.jpg",
        "title": "Project Shiksha - Photo 10",
        "imageUrl": "/images/Projects/ProjectShiksha/10.jpg",
        "url": "/images/Projects/ProjectShiksha/10.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-11.jpg",
        "title": "Project Shiksha - Photo 11",
        "imageUrl": "/images/Projects/ProjectShiksha/11.jpg",
        "url": "/images/Projects/ProjectShiksha/11.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-12.png",
        "title": "Project Shiksha - Photo 12",
        "imageUrl": "/images/Projects/ProjectShiksha/12.png",
        "url": "/images/Projects/ProjectShiksha/12.png",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-13.jpg",
        "title": "Project Shiksha - Photo 13",
        "imageUrl": "/images/Projects/ProjectShiksha/13.jpg",
        "url": "/images/Projects/ProjectShiksha/13.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-14.jpg",
        "title": "Project Shiksha - Photo 14",
        "imageUrl": "/images/Projects/ProjectShiksha/14.jpg",
        "url": "/images/Projects/ProjectShiksha/14.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-15.jpg",
        "title": "Project Shiksha - Photo 15",
        "imageUrl": "/images/Projects/ProjectShiksha/15.jpg",
        "url": "/images/Projects/ProjectShiksha/15.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-16.jpg",
        "title": "Project Shiksha - Photo 16",
        "imageUrl": "/images/Projects/ProjectShiksha/16.jpg",
        "url": "/images/Projects/ProjectShiksha/16.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-17.jpg",
        "title": "Project Shiksha - Photo 17",
        "imageUrl": "/images/Projects/ProjectShiksha/17.jpg",
        "url": "/images/Projects/ProjectShiksha/17.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-18.png",
        "title": "Project Shiksha - Photo 18",
        "imageUrl": "/images/Projects/ProjectShiksha/18.png",
        "url": "/images/Projects/ProjectShiksha/18.png",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-19.jpg",
        "title": "Project Shiksha - Photo 19",
        "imageUrl": "/images/Projects/ProjectShiksha/19.jpg",
        "url": "/images/Projects/ProjectShiksha/19.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-20.jpg",
        "title": "Project Shiksha - Photo 20",
        "imageUrl": "/images/Projects/ProjectShiksha/20.jpg",
        "url": "/images/Projects/ProjectShiksha/20.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-21.png",
        "title": "Project Shiksha - Photo 21",
        "imageUrl": "/images/Projects/ProjectShiksha/21.png",
        "url": "/images/Projects/ProjectShiksha/21.png",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-22.jpg",
        "title": "Project Shiksha - Photo 22",
        "imageUrl": "/images/Projects/ProjectShiksha/22.jpg",
        "url": "/images/Projects/ProjectShiksha/22.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-23.png",
        "title": "Project Shiksha - Photo 23",
        "imageUrl": "/images/Projects/ProjectShiksha/23.png",
        "url": "/images/Projects/ProjectShiksha/23.png",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-24.jpg",
        "title": "Project Shiksha - Photo 24",
        "imageUrl": "/images/Projects/ProjectShiksha/24.jpg",
        "url": "/images/Projects/ProjectShiksha/24.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-25.jpg",
        "title": "Project Shiksha - Photo 25",
        "imageUrl": "/images/Projects/ProjectShiksha/25.jpg",
        "url": "/images/Projects/ProjectShiksha/25.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-26.png",
        "title": "Project Shiksha - Photo 26",
        "imageUrl": "/images/Projects/ProjectShiksha/26.png",
        "url": "/images/Projects/ProjectShiksha/26.png",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-27.jpg",
        "title": "Project Shiksha - Photo 27",
        "imageUrl": "/images/Projects/ProjectShiksha/27.jpg",
        "url": "/images/Projects/ProjectShiksha/27.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-28.jpg",
        "title": "Project Shiksha - Photo 28",
        "imageUrl": "/images/Projects/ProjectShiksha/28.jpg",
        "url": "/images/Projects/ProjectShiksha/28.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-29.jpg",
        "title": "Project Shiksha - Photo 29",
        "imageUrl": "/images/Projects/ProjectShiksha/29.jpg",
        "url": "/images/Projects/ProjectShiksha/29.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-shiksha-30.jpg",
        "title": "Project Shiksha - Photo 30",
        "imageUrl": "/images/Projects/ProjectShiksha/30.jpg",
        "url": "/images/Projects/ProjectShiksha/30.jpg",
        "mediaType": "image"
      }
    ]
  },
  {
    "id": "project-manthan",
    "name": "Project Manthan",
    "description": "Awareness campaigns, mental health workshops, and community counselling drives.",
    "folder": "Projects/ProjectManthan",
    "mediaCount": 16,
    "coverUrl": "/images/Projects/ProjectManthan/1.jpg",
    "images": [
      {
        "id": "project-manthan-1.jpg",
        "title": "Project Manthan - Photo 1",
        "imageUrl": "/images/Projects/ProjectManthan/1.jpg",
        "url": "/images/Projects/ProjectManthan/1.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-2.jpg",
        "title": "Project Manthan - Photo 2",
        "imageUrl": "/images/Projects/ProjectManthan/2.jpg",
        "url": "/images/Projects/ProjectManthan/2.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-3.jpg",
        "title": "Project Manthan - Photo 3",
        "imageUrl": "/images/Projects/ProjectManthan/3.jpg",
        "url": "/images/Projects/ProjectManthan/3.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-4.jpg",
        "title": "Project Manthan - Photo 4",
        "imageUrl": "/images/Projects/ProjectManthan/4.jpg",
        "url": "/images/Projects/ProjectManthan/4.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-5.jpg",
        "title": "Project Manthan - Photo 5",
        "imageUrl": "/images/Projects/ProjectManthan/5.jpg",
        "url": "/images/Projects/ProjectManthan/5.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-6.jpg",
        "title": "Project Manthan - Photo 6",
        "imageUrl": "/images/Projects/ProjectManthan/6.jpg",
        "url": "/images/Projects/ProjectManthan/6.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-7.jpg",
        "title": "Project Manthan - Photo 7",
        "imageUrl": "/images/Projects/ProjectManthan/7.jpg",
        "url": "/images/Projects/ProjectManthan/7.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-8.jpg",
        "title": "Project Manthan - Photo 8",
        "imageUrl": "/images/Projects/ProjectManthan/8.jpg",
        "url": "/images/Projects/ProjectManthan/8.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-9.jpg",
        "title": "Project Manthan - Photo 9",
        "imageUrl": "/images/Projects/ProjectManthan/9.jpg",
        "url": "/images/Projects/ProjectManthan/9.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-10.jpg",
        "title": "Project Manthan - Photo 10",
        "imageUrl": "/images/Projects/ProjectManthan/10.jpg",
        "url": "/images/Projects/ProjectManthan/10.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-11.jpg",
        "title": "Project Manthan - Photo 11",
        "imageUrl": "/images/Projects/ProjectManthan/11.jpg",
        "url": "/images/Projects/ProjectManthan/11.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-12.jpg",
        "title": "Project Manthan - Photo 12",
        "imageUrl": "/images/Projects/ProjectManthan/12.jpg",
        "url": "/images/Projects/ProjectManthan/12.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-13.jpg",
        "title": "Project Manthan - Photo 13",
        "imageUrl": "/images/Projects/ProjectManthan/13.jpg",
        "url": "/images/Projects/ProjectManthan/13.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-14.jpg",
        "title": "Project Manthan - Photo 14",
        "imageUrl": "/images/Projects/ProjectManthan/14.jpg",
        "url": "/images/Projects/ProjectManthan/14.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-15.jpg",
        "title": "Project Manthan - Photo 15",
        "imageUrl": "/images/Projects/ProjectManthan/15.jpg",
        "url": "/images/Projects/ProjectManthan/15.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-manthan-16.jpg",
        "title": "Project Manthan - Photo 16",
        "imageUrl": "/images/Projects/ProjectManthan/16.jpg",
        "url": "/images/Projects/ProjectManthan/16.jpg",
        "mediaType": "image"
      }
    ]
  },
  {
    "id": "project-udaan",
    "name": "Project Udaan",
    "description": "Community outreach, youth empowerment, and career orientation programs.",
    "folder": "Projects/ProjectUdaan",
    "mediaCount": 12,
    "coverUrl": "/images/Projects/ProjectUdaan/1.jpg",
    "images": [
      {
        "id": "project-udaan-1.jpg",
        "title": "Project Udaan - Photo 1",
        "imageUrl": "/images/Projects/ProjectUdaan/1.jpg",
        "url": "/images/Projects/ProjectUdaan/1.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-2.jpg",
        "title": "Project Udaan - Photo 2",
        "imageUrl": "/images/Projects/ProjectUdaan/2.jpg",
        "url": "/images/Projects/ProjectUdaan/2.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-3.jpg",
        "title": "Project Udaan - Photo 3",
        "imageUrl": "/images/Projects/ProjectUdaan/3.jpg",
        "url": "/images/Projects/ProjectUdaan/3.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-4.jpg",
        "title": "Project Udaan - Photo 4",
        "imageUrl": "/images/Projects/ProjectUdaan/4.jpg",
        "url": "/images/Projects/ProjectUdaan/4.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-5.jpg",
        "title": "Project Udaan - Photo 5",
        "imageUrl": "/images/Projects/ProjectUdaan/5.jpg",
        "url": "/images/Projects/ProjectUdaan/5.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-6.jpg",
        "title": "Project Udaan - Photo 6",
        "imageUrl": "/images/Projects/ProjectUdaan/6.jpg",
        "url": "/images/Projects/ProjectUdaan/6.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-7.jpg",
        "title": "Project Udaan - Photo 7",
        "imageUrl": "/images/Projects/ProjectUdaan/7.jpg",
        "url": "/images/Projects/ProjectUdaan/7.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-8.jpg",
        "title": "Project Udaan - Photo 8",
        "imageUrl": "/images/Projects/ProjectUdaan/8.jpg",
        "url": "/images/Projects/ProjectUdaan/8.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-9.jpg",
        "title": "Project Udaan - Photo 9",
        "imageUrl": "/images/Projects/ProjectUdaan/9.jpg",
        "url": "/images/Projects/ProjectUdaan/9.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-10.jpg",
        "title": "Project Udaan - Photo 10",
        "imageUrl": "/images/Projects/ProjectUdaan/10.jpg",
        "url": "/images/Projects/ProjectUdaan/10.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-11.jpg",
        "title": "Project Udaan - Photo 11",
        "imageUrl": "/images/Projects/ProjectUdaan/11.jpg",
        "url": "/images/Projects/ProjectUdaan/11.jpg",
        "mediaType": "image"
      },
      {
        "id": "project-udaan-12.jpg",
        "title": "Project Udaan - Photo 12",
        "imageUrl": "/images/Projects/ProjectUdaan/12.jpg",
        "url": "/images/Projects/ProjectUdaan/12.jpg",
        "mediaType": "image"
      }
    ]
  },
  {
    "id": "project-pravah",
    "name": "Project Pravah",
    "description": "Cleanliness and environmental sustainability initiatives.",
    "folder": "Projects/ProjectPravah",
    "mediaCount": 1,
    "coverUrl": "/images/Projects/ProjectPravah/1.jpg",
    "images": [
      {
        "id": "project-pravah-1.jpg",
        "title": "Project Pravah - Photo 1",
        "imageUrl": "/images/Projects/ProjectPravah/1.jpg",
        "url": "/images/Projects/ProjectPravah/1.jpg",
        "mediaType": "image"
      }
    ]
  },
  {
    "id": "clothes-donation",
    "name": "Clothes Donation Drive",
    "description": "Cloth collection and distribution drives for families in need.",
    "folder": "ClothesDonation",
    "mediaCount": 11,
    "coverUrl": "/images/ClothesDonation/1.jpg",
    "images": [
      {
        "id": "clothes-donation-1.jpg",
        "title": "Clothes Donation Drive - Photo 1",
        "imageUrl": "/images/ClothesDonation/1.jpg",
        "url": "/images/ClothesDonation/1.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-2.jpg",
        "title": "Clothes Donation Drive - Photo 2",
        "imageUrl": "/images/ClothesDonation/2.jpg",
        "url": "/images/ClothesDonation/2.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-3.jpg",
        "title": "Clothes Donation Drive - Photo 3",
        "imageUrl": "/images/ClothesDonation/3.jpg",
        "url": "/images/ClothesDonation/3.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-4.jpg",
        "title": "Clothes Donation Drive - Photo 4",
        "imageUrl": "/images/ClothesDonation/4.jpg",
        "url": "/images/ClothesDonation/4.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-5.jpg",
        "title": "Clothes Donation Drive - Photo 5",
        "imageUrl": "/images/ClothesDonation/5.jpg",
        "url": "/images/ClothesDonation/5.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-6.jpg",
        "title": "Clothes Donation Drive - Photo 6",
        "imageUrl": "/images/ClothesDonation/6.jpg",
        "url": "/images/ClothesDonation/6.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-7.jpg",
        "title": "Clothes Donation Drive - Photo 7",
        "imageUrl": "/images/ClothesDonation/7.jpg",
        "url": "/images/ClothesDonation/7.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-8.jpg",
        "title": "Clothes Donation Drive - Photo 8",
        "imageUrl": "/images/ClothesDonation/8.jpg",
        "url": "/images/ClothesDonation/8.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-9.jpg",
        "title": "Clothes Donation Drive - Photo 9",
        "imageUrl": "/images/ClothesDonation/9.jpg",
        "url": "/images/ClothesDonation/9.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-10.jpg",
        "title": "Clothes Donation Drive - Photo 10",
        "imageUrl": "/images/ClothesDonation/10.jpg",
        "url": "/images/ClothesDonation/10.jpg",
        "mediaType": "image"
      },
      {
        "id": "clothes-donation-11.jpg",
        "title": "Clothes Donation Drive - Photo 11",
        "imageUrl": "/images/ClothesDonation/11.jpg",
        "url": "/images/ClothesDonation/11.jpg",
        "mediaType": "image"
      }
    ]
  },
  {
    "id": "webinars",
    "name": "Webinars & Workshops",
    "description": "Interactive online webinars, guest speaker sessions, and panel discussions.",
    "folder": "Webinar",
    "mediaCount": 4,
    "coverUrl": "/images/Webinar/Webinar1.jpeg",
    "images": [
      {
        "id": "webinars-Webinar1.jpeg",
        "title": "Webinars & Workshops - Photo 1",
        "imageUrl": "/images/Webinar/Webinar1.jpeg",
        "url": "/images/Webinar/Webinar1.jpeg",
        "mediaType": "image"
      },
      {
        "id": "webinars-Webinar2.jpeg",
        "title": "Webinars & Workshops - Photo 2",
        "imageUrl": "/images/Webinar/Webinar2.jpeg",
        "url": "/images/Webinar/Webinar2.jpeg",
        "mediaType": "image"
      },
      {
        "id": "webinars-webinar3.jpeg",
        "title": "Webinars & Workshops - Photo 3",
        "imageUrl": "/images/Webinar/webinar3.jpeg",
        "url": "/images/Webinar/webinar3.jpeg",
        "mediaType": "image"
      },
      {
        "id": "webinars-webinar4.jpeg",
        "title": "Webinars & Workshops - Photo 4",
        "imageUrl": "/images/Webinar/webinar4.jpeg",
        "url": "/images/Webinar/webinar4.jpeg",
        "mediaType": "image"
      }
    ]
  },
  {
    "id": "awards",
    "name": "Awards & Recognition",
    "description": "Awards and honors received by Amaanitvam Foundation and its volunteers.",
    "folder": "awards",
    "mediaCount": 2,
    "coverUrl": "/images/awards/1.jpeg",
    "images": [
      {
        "id": "awards-1.jpeg",
        "title": "Awards & Recognition - Photo 1",
        "imageUrl": "/images/awards/1.jpeg",
        "url": "/images/awards/1.jpeg",
        "mediaType": "image"
      },
      {
        "id": "awards-2.jpeg",
        "title": "Awards & Recognition - Photo 2",
        "imageUrl": "/images/awards/2.jpeg",
        "url": "/images/awards/2.jpeg",
        "mediaType": "image"
      }
    ]
  }
];

    let activeApiBase = cleanBase(
        container.dataset.galleryApiBase ||
        window.GALLERY_API_BASE ||
        (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL.replace(/\/api$/, '') : '') ||
        localStorage.getItem('GALLERY_API_BASE') ||
        localStorage.getItem('API_BASE_URL') ||
        localStorage.getItem('backendUrl') ||
        ''
    );

    let currentFolders = [];
    const folderMediaCache = new Map();

    function cleanBase(value) {
        return String(value || '').trim().replace(/\/+$/, '');
    }

    function apiBaseCandidates() {
        const candidates = [];
        if (activeApiBase) candidates.push(activeApiBase);
        if (window.location.hostname.includes('github.dev')) {
            candidates.push(window.location.origin.replace(/-\d+\.github\.dev$/, '-5000.github.dev'));
        }
        candidates.push('https://amaanitvam-foundation.onrender.com');
        if (!['5500', '5501'].includes(window.location.port) && window.location.protocol !== 'file:') {
            candidates.push(window.location.origin);
        }
        return [...new Set(candidates.map(cleanBase).filter(Boolean))];
    }

    function backendBase() {
        const candidates = apiBaseCandidates();
        return cleanBase(activeApiBase || candidates[0] || 'https://amaanitvam-foundation.onrender.com');
    }

    async function fetchGalleryJson(path) {
        let lastError = null;
        for (const base of apiBaseCandidates()) {
            try {
                const controller = new AbortController();
                const timeout = window.setTimeout(() => controller.abort(), 5000);
                const response = await fetch(`${base}${path}`, { signal: controller.signal }).finally(() => window.clearTimeout(timeout));
                const data = await response.json().catch(() => ({}));

                if (!response.ok || data.success === false) {
                    throw new Error(data.message || `Gallery request failed: ${response.status}`);
                }

                activeApiBase = base;
                return data;
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError || new Error('Backend offline');
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getId(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value._id || value.id || value.mediaId || value.fileId || value.gridFsId || '';
    }

    function rawMediaUrl(media) {
        if (!media) return '';
        if (typeof media === 'string') return media;
        return media.imageUrl || media.url || media.secure_url || media.src || media.path || media.fileUrl || media.mediaUrl || '';
    }

    function normalizeMediaUrl(media) {
        const raw = String(rawMediaUrl(media) || '').trim();
        const id = getId(media);
        const base = backendBase();

        if (!raw && id) return `${base}/api/gallery/media/${encodeURIComponent(id)}`;
        if (!raw) return '';

        try {
            const parsed = new URL(raw, window.location.origin);
            if (parsed.pathname.startsWith('/api/')) return `${base}${parsed.pathname}${parsed.search}`;
        } catch (_) {}

        if (/^(data:|blob:)/i.test(raw)) return raw;
        if (raw.startsWith('/images/')) return raw;
        if (/^https?:\/\//i.test(raw) && !raw.includes(':5500/api/')) return raw;

        if (raw.startsWith('/api/')) return `${base}${raw}`;
        if (raw.startsWith('api/')) return `${base}/${raw}`;

        if (raw.startsWith('/uploads/') || raw.startsWith('/gallery/') || raw.startsWith('/media/')) return `${base}${raw}`;
        if (raw.startsWith('uploads/') || raw.startsWith('gallery/') || raw.startsWith('media/')) return `${base}/${raw}`;

        return raw;
    }

    function isVideo(media) {
        const url = normalizeMediaUrl(media);
        return media?.mediaType === 'video'
            || String(media?.contentType || '').startsWith('video/')
            || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
    }

    function pickFolderCover(folder) {
        if (folder.coverUrl) return { imageUrl: folder.coverUrl, title: folder.name };
        return folder?.__coverMedia || folder?.coverMedia || folder?.coverImage || folder?.thumbnail || folder?.cover || null;
    }

    async function getFolderMedia(folderId) {
        if (folderMediaCache.has(folderId)) return folderMediaCache.get(folderId);

        const targetNorm = normalizeAlbumName(folderId);

        // Check static albums dataset first with canonical alias matching
        const staticAlbum = STATIC_ALBUMS.find(
            (a) => a.id === folderId || a.id === targetNorm || normalizeAlbumName(a.name) === targetNorm || a.name.toLowerCase() === String(folderId).toLowerCase()
        );
        if (staticAlbum && staticAlbum.images && staticAlbum.images.length > 0) {
            // Ensure max 30 images
            const capped = staticAlbum.images.slice(0, 30);
            folderMediaCache.set(folderId, capped);
            return capped;
        }

        // Try API if available
        try {
            const data = await fetchGalleryJson(`/api/gallery/folders/${encodeURIComponent(folderId)}/media`);
            const media = Array.isArray(data.images) ? data.images : Array.isArray(data.media) ? data.media : [];
            const capped = media.slice(0, 30);
            folderMediaCache.set(folderId, capped);
            return capped;
        } catch (_) {
            return [];
        }
    }

    function placeholderMarkup(extraClass = '') {
        return `<div class="gallery-album-placeholder ${extraClass}" aria-hidden="true">
    <span class="material-symbols-outlined">photo_library</span>
  </div>`;
    }

    function mediaThumb(media, extraClass = '', index = 0) {
        const url = normalizeMediaUrl(media);
        const title = escapeHtml(media?.title || media?.originalName || media?.filename || media?.name || 'Gallery media');

        if (!url) return placeholderMarkup(extraClass);

        if (isVideo(media)) {
            return `<video class="${extraClass}" src="${escapeHtml(url)}" controls playsinline preload="metadata" aria-label="${title}"></video>`;
        }

        // PERFORMANCE: loading="lazy" and decoding="async" on every gallery image
        return `<img class="${extraClass}" src="${escapeHtml(url)}" alt="${title}" loading="lazy" decoding="async" data-lightbox-index="${index}" style="cursor:pointer;" />`;
    }

    function albumCoverMarkup(folder) {
        const cover = pickFolderCover(folder);
        const url = normalizeMediaUrl(cover);
        const title = escapeHtml(cover?.title || folder?.name || 'Gallery album cover');

        if (!url) return placeholderMarkup('gallery-album-cover-media');

        if (isVideo(cover)) {
            return `<video class="gallery-album-cover-media" src="${escapeHtml(url)}" muted playsinline preload="metadata" aria-label="${title}"></video>`;
        }

        // PERFORMANCE: Cover image uses loading="lazy" and decoding="async"
        return `<img class="gallery-album-cover-media" src="${escapeHtml(url)}" alt="${title}" loading="lazy" decoding="async" />`;
    }

    function setIntro(title, description) {
        const heading = document.getElementById('gallery-grid-title');
        const introText = document.querySelector('.gallery-intro .section-desc');
        if (heading) heading.textContent = title;
        if (introText && description) introText.textContent = description;
    }

    function albumCountLabel(count) {
        const total = Number(count || 0);
        return `${total} ${total === 1 ? 'media item' : 'media items'}`;
    }

    function normalizeAlbumName(name) {
        const s = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (s.includes('clothes') || s.includes('cloth')) return 'clothes-donation';
        if (s.includes('webinar') || s.includes('competition')) return 'webinars';
        if (s.includes('award')) return 'awards';
        if (s.includes('shiksha')) return 'project-shiksha';
        if (s.includes('manthan')) return 'project-manthan';
        if (s.includes('udaan')) return 'project-udaan';
        if (s.includes('pravah')) return 'project-pravah';
        return s;
    }

    function renderAlbums() {
        setIntro('Browse Gallery Albums', 'Open an album to view photos and videos from our initiatives.');
        container.className = 'gallery-grid gallery-albums-grid';

        // Enforce strict deduplication and filter out empty (0-item) albums
        const seenNorms = new Set();
        const albums = currentFolders.filter((folder) => {
            const count = folder.mediaCount || (folder.images ? folder.images.length : 0);
            if (count <= 0) return false;

            const norm = normalizeAlbumName(folder.name || folder.id);
            if (seenNorms.has(norm)) return false;
            seenNorms.add(norm);
            return true;
        });

        if (!albums.length) {
            container.className = 'gallery-album-shell';
            container.innerHTML = '<div class="gallery-state">No gallery albums available.</div>';
            return;
        }

        // Render initial album cover cards ONLY (images inside albums are not rendered until opened)
        container.innerHTML = albums.map((folder) => {
            const id = getId(folder);
            const name = folder.name || folder.title || 'Untitled Album';
            const description = folder.description || 'View photos from this project album.';
            const count = Math.min(30, folder.mediaCount || (folder.images ? folder.images.length : 0));

            return `<article class="gallery-album-card gallery-card reveal-card" data-folder-id="${escapeHtml(id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(name)} album">
      <div class="gallery-album-cover">
        ${albumCoverMarkup(folder)}
        <span class="gallery-album-count">${escapeHtml(albumCountLabel(count))}</span>
      </div>
      <div class="gallery-album-body">
        <h3>${escapeHtml(name)}</h3>
        <p>${escapeHtml(description)}</p>
        <span class="gallery-album-open">Open Album <span aria-hidden="true">→</span></span>
      </div>
    </article>`;
        }).join('');

        container.querySelectorAll('.gallery-album-card').forEach((card) => {
            const folderId = card.dataset.folderId;
            const open = () => openAlbum(folderId);
            card.addEventListener('click', open);
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open();
                }
            });
        });
    }

    // PERFORMANCE: Load album images ONLY when album is clicked/opened
    async function openAlbum(folderId) {
        const folder = currentFolders.find((item) => String(getId(item)) === String(folderId));
        if (!folder) return;

        setIntro(folder.name || 'Gallery Album', folder.description || 'Browse images and videos from this album.');
        container.className = 'gallery-album-shell';
        container.innerHTML = `<div class="gallery-album-toolbar">
    <button class="gallery-back-button" type="button" id="galleryBackToAlbums">← Back to Albums</button>
    <div>
      <span class="gallery-album-kicker">Album</span>
      <h3>${escapeHtml(folder.name || 'Gallery Album')}</h3>
    </div>
  </div>
  <div class="gallery-state">Loading album media...</div>`;

        document.getElementById('galleryBackToAlbums')?.addEventListener('click', renderAlbums);

        const media = await getFolderMedia(folderId);
        renderAlbumMedia(folder, media);
    }

    // Lightbox modal logic
    let activeMediaList = [];
    let currentLightboxIndex = 0;

    function openLightbox(index) {
        if (!activeMediaList || index < 0 || index >= activeMediaList.length) return;
        currentLightboxIndex = index;

        let lightbox = document.getElementById('gallery-lightbox-modal');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'gallery-lightbox-modal';
            lightbox.className = 'gallery-lightbox-overlay';
            lightbox.innerHTML = `
                <div class="gallery-lightbox-content">
                    <button type="button" class="gallery-lightbox-close" id="lightboxCloseBtn" aria-label="Close">&times;</button>
                    <button type="button" class="gallery-lightbox-nav prev" id="lightboxPrevBtn" aria-label="Previous">&lsaquo;</button>
                    <button type="button" class="gallery-lightbox-nav next" id="lightboxNextBtn" aria-label="Next">&rsaquo;</button>
                    <div class="gallery-lightbox-body">
                        <img id="lightboxImg" src="" alt="" loading="lazy" decoding="async" />
                        <div class="gallery-lightbox-caption">
                            <span id="lightboxTitle"></span>
                            <span id="lightboxCounter"></span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(lightbox);

            document.getElementById('lightboxCloseBtn')?.addEventListener('click', closeLightbox);
            document.getElementById('lightboxPrevBtn')?.addEventListener('click', () => navigateLightbox(-1));
            document.getElementById('lightboxNextBtn')?.addEventListener('click', () => navigateLightbox(1));
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });

            document.addEventListener('keydown', (e) => {
                const modal = document.getElementById('gallery-lightbox-modal');
                if (!modal || modal.style.display !== 'flex') return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') navigateLightbox(-1);
                if (e.key === 'ArrowRight') navigateLightbox(1);
            });
        }

        updateLightboxContent();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lightbox = document.getElementById('gallery-lightbox-modal');
        if (lightbox) lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    function navigateLightbox(direction) {
        currentLightboxIndex = (currentLightboxIndex + direction + activeMediaList.length) % activeMediaList.length;
        updateLightboxContent();
    }

    function updateLightboxContent() {
        const media = activeMediaList[currentLightboxIndex];
        if (!media) return;

        const imgEl = document.getElementById('lightboxImg');
        const titleEl = document.getElementById('lightboxTitle');
        const counterEl = document.getElementById('lightboxCounter');

        if (imgEl) {
            imgEl.src = normalizeMediaUrl(media);
            imgEl.alt = media.title || 'Gallery Image';
        }
        if (titleEl) titleEl.textContent = media.title || '';
        if (counterEl) counterEl.textContent = `${currentLightboxIndex + 1} / ${activeMediaList.length}`;
    }

    function renderAlbumMedia(folder, media) {
        container.className = 'gallery-album-shell';
        activeMediaList = media;

        const count = albumCountLabel(media.length);
        const grid = media.length
            ? `<div class="gallery-album-media-grid">
        ${media.map((item, idx) => {
                const title = item.title || item.originalName || item.filename || 'Gallery media';
                return `<figure class="gallery-media-card gallery-card reveal-card">
            <div class="gallery-media-frame">${mediaThumb(item, 'gallery-media-file', idx)}</div>
            <figcaption>${escapeHtml(title)}</figcaption>
          </figure>`;
            }).join('')}
      </div>`
            : `<div class="gallery-state">No media in this album yet.</div>`;

        container.innerHTML = `<div class="gallery-album-toolbar">
    <button class="gallery-back-button" type="button" id="galleryBackToAlbums">← Back to Albums</button>
    <div>
      <span class="gallery-album-kicker">${escapeHtml(count)}</span>
      <h3>${escapeHtml(folder.name || 'Gallery Album')}</h3>
    </div>
  </div>
  ${grid}`;

        document.getElementById('galleryBackToAlbums')?.addEventListener('click', renderAlbums);

        container.querySelectorAll('img[data-lightbox-index]').forEach((img) => {
            img.addEventListener('click', () => {
                const index = Number(img.dataset.lightboxIndex);
                openLightbox(index);
            });
        });
    }

    async function initAlbumGallery() {
        // On initial page load, only load album cover cards
        let apiFolders = [];
        try {
            const foldersData = await fetchGalleryJson('/api/gallery/folders');
            apiFolders = Array.isArray(foldersData.folders) ? foldersData.folders : [];
        } catch (_) {
            apiFolders = [];
        }

        // Normalization helper to match album aliases and prevent duplicate folders
        function normalizeAlbumName(name) {
            const s = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (s.includes('clothes') || s.includes('cloth')) return 'clothes-donation';
            if (s.includes('webinar') || s.includes('competition')) return 'webinars';
            if (s.includes('award')) return 'awards';
            if (s.includes('shiksha')) return 'project-shiksha';
            if (s.includes('manthan')) return 'project-manthan';
            if (s.includes('udaan')) return 'project-udaan';
            if (s.includes('pravah')) return 'project-pravah';
            return s;
        }

        // Merge API folders with STATIC_ALBUMS
        const mergedFolders = STATIC_ALBUMS.map(a => ({
            ...a,
            mediaCount: Math.min(30, a.mediaCount)
        }));

        for (const apiFolder of apiFolders) {
            const apiNorm = normalizeAlbumName(apiFolder.name || apiFolder.id);
            const existingIndex = mergedFolders.findIndex(
                (f) => f.id === apiFolder._id || f.id === apiFolder.id || normalizeAlbumName(f.id) === apiNorm || normalizeAlbumName(f.name) === apiNorm
            );

            if (existingIndex >= 0) {
                if (apiFolder.mediaCount > 0) {
                    mergedFolders[existingIndex]._id = apiFolder._id;
                }
            } else if ((apiFolder.mediaCount || 0) > 0 || (apiFolder.images && apiFolder.images.length > 0)) {
                mergedFolders.push({
                    id: apiFolder._id || apiFolder.id,
                    _id: apiFolder._id,
                    name: apiFolder.name || 'API Album',
                    description: apiFolder.description || 'Uploaded album',
                    mediaCount: Math.min(30, apiFolder.mediaCount || 0),
                    coverUrl: apiFolder.coverUrl || '',
                    images: []
                });
            }
        }

        // Filter out any 0-item empty repetitive albums
        currentFolders = mergedFolders.filter(f => (f.mediaCount || 0) > 0 || (f.images && f.images.length > 0));
        renderAlbums();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAlbumGallery, { once: true });
    } else {
        initAlbumGallery();
    }
})();
