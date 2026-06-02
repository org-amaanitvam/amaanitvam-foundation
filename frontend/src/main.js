import './style.css';
import HomePage from './pages/HomePage.js';
import AboutPage from './pages/AboutPage.js';
import ProgramsPage from './pages/ProgramsPage.js';

const appElement = document.querySelector('#app');

const routes = {
  '#/': HomePage,
  '#/about': AboutPage,
  '#/programs': ProgramsPage,
};

function router() {
  const hash = window.location.hash || '#/';
  
  let PageClass;
  let targetAnchor = null;
  
  if (hash === '#/about') {
    PageClass = AboutPage;
  } else if (hash === '#/programs') {
    PageClass = ProgramsPage;
  } else if (hash === '#/' || hash === '') {
    PageClass = HomePage;
  } else if (hash.startsWith('#') && !hash.startsWith('#/')) {
    // Standard homepage scroll anchors (like #community, #volunteer-form, etc.)
    PageClass = HomePage;
    targetAnchor = hash;
  } else {
    PageClass = HomePage;
  }
  
  const previousPage = appElement.dataset.currentPage;
  const newPageName = PageClass === HomePage ? 'home' : (PageClass === AboutPage ? 'about' : 'programs');
  
  if (previousPage !== newPageName) {
    window.scrollTo(0, 0);
    const pageInstance = new PageClass();
    appElement.innerHTML = pageInstance.render();
    appElement.dataset.currentPage = newPageName;
    pageInstance.init();
  }
  
  // If we have an anchor, let's scroll to it after rendering
  if (targetAnchor) {
    setTimeout(() => {
      const el = document.querySelector(targetAnchor);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, previousPage !== newPageName ? 300 : 50);
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
