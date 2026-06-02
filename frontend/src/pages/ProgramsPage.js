import Navbar from '../components/Navbar.js';
import ProgramsHero from '../components/programs/ProgramsHero.js';
import PotentialToPossibility from '../components/programs/PotentialToPossibility.js';
import ProgramsOverview from '../components/programs/ProgramsOverview.js';
import ProgramManthan from '../components/programs/ProgramManthan.js';
import ProgramShiksha from '../components/programs/ProgramShiksha.js';
import ProgramPravah from '../components/programs/ProgramPravah.js';
import ProgramJourney from '../components/programs/ProgramJourney.js';
import ProgramImpact from '../components/programs/ProgramImpact.js';
import GrowingWithCommunities from '../components/programs/GrowingWithCommunities.js';
import ProgramsCTA from '../components/programs/ProgramsCTA.js';
import Footer from '../components/Footer.js';

export default class ProgramsPage {
  constructor() {
    this.navbar = new Navbar();
    this.programsHero = new ProgramsHero();
    this.potentialToPossibility = new PotentialToPossibility();
    this.programsOverview = new ProgramsOverview();
    this.programManthan = new ProgramManthan();
    this.programShiksha = new ProgramShiksha();
    this.programPravah = new ProgramPravah();
    this.programJourney = new ProgramJourney();
    this.programImpact = new ProgramImpact();
    this.growingWithCommunities = new GrowingWithCommunities();
    this.programsCTA = new ProgramsCTA();
    this.footer = new Footer();
  }

  render() {
    return `
      <div class="flex flex-col min-h-screen bg-stone-50 select-none">
        
        <!-- Shared Header Navigation -->
        ${this.navbar.render()}
        
        <main class="flex-grow">
          
          <!-- Typography-Focused Programs Hero -->
          ${this.programsHero.render()}
          
          <!-- Context Narrative Origin Section -->
          ${this.potentialToPossibility.render()}
          
          <!-- Initiative Pathways Overview -->
          ${this.programsOverview.render()}
          
          <!-- Project Manthan Detail -->
          ${this.programManthan.render()}
          
          <!-- Project Shiksha Detail -->
          ${this.programShiksha.render()}
          
          <!-- Project Pravah Detail -->
          ${this.programPravah.render()}
          
          <!-- Journey of Care Timeline -->
          ${this.programJourney.render()}
          
          <!-- Measurable Progress Stats -->
          ${this.programImpact.render()}
          
          <!-- Future Vision -->
          ${this.growingWithCommunities.render()}
          
          <!-- Invitational CTA -->
          ${this.programsCTA.render()}
          
        </main>
        
        <!-- Footer with contact details and volunteer form -->
        ${this.footer.render()}
        
      </div>
    `;
  }

  init() {
    // Initialize scrolling header, hamburger toggle and scroll highlights
    Navbar.init();

    // Trigger sequential activation of milestone dots on scroll
    ProgramJourney.init();

    // Initialize volunteer form submission handling in Footer
    Footer.init();

    // --- INTERSECTION OBSERVER FOR NARRATIVE SCROLL REVEALS ---
    const reveals = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -40px 0px'
    });
    reveals.forEach(el => revealObserver.observe(el));

    // --- STAGGER GRID LOADING CONTROLLERS ---
    const staggerContainers = document.querySelectorAll('.stagger-container');
    staggerContainers.forEach(container => {
      const items = container.querySelectorAll('.stagger-load');
      const staggerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            items.forEach((item, idx) => {
              setTimeout(() => {
                item.classList.add('revealed');
              }, idx * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
      });
      staggerObserver.observe(container);
    });
  }
}
