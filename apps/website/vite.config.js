import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'src/pages/about.html'),
        collaborations: resolve(__dirname, 'src/pages/collaborations.html'),
        contact: resolve(__dirname, 'src/pages/contact.html'),
        faq: resolve(__dirname, 'src/pages/faq.html'),
        gallery: resolve(__dirname, 'src/pages/gallery.html'),
        impact: resolve(__dirname, 'src/pages/impact.html'),
        internship: resolve(__dirname, 'src/pages/internship.html'),
        programs: resolve(__dirname, 'src/pages/programs.html'),
        verify: resolve(__dirname, 'src/pages/verify.html'),
        volunteer: resolve(__dirname, 'src/pages/volunteer.html'),
        webinars: resolve(__dirname, 'src/pages/webinars-competitions.html'),
        privacy: resolve(__dirname, 'src/pages/legal/privacy-policy.html'),
        refund: resolve(__dirname, 'src/pages/legal/refund-policy.html'),
        terms: resolve(__dirname, 'src/pages/legal/terms-conditions.html'),
      },
    },
  },
});
