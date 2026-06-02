export default class Navbar {
  render() {
    return `
      <header class="absolute top-0 left-0 w-full z-50 transition-all duration-500 border-b border-white/5 text-stone-200 navigation-header" id="nav-header">
        <div class="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          
          <!-- Elegant Serif Branding with Lotus Logo -->
          <a href="#/" class="flex items-center gap-3 group select-none">
            <img src="/amaanitvam-logo.png" alt="Lotus logo" class="h-9 w-auto filter brightness-0 invert transition-all duration-300" id="nav-logo">
            <span class="font-display font-medium tracking-wide text-white text-lg md:text-xl transition-colors duration-300" id="nav-title">Amaanitvam</span>
          </a>

          <!-- Horizontal Navigation Links -->
          <nav class="hidden lg:flex items-center gap-7 font-interface font-medium text-[11px] uppercase tracking-widest text-stone-300" id="nav-links">
            <a href="#/" class="hover:text-white transition-colors duration-300 py-1" id="link-home">Home</a>
            <a href="#/about" class="hover:text-white transition-colors duration-300 py-1" id="link-about">About Us</a>
            <a href="#/programs" class="hover:text-white transition-colors duration-300 py-1" id="link-programs">Programs</a>
            <a href="#community" class="hover:text-white transition-colors duration-300 py-1">Community</a>
            <a href="#volunteer-form" class="hover:text-white transition-colors duration-300 py-1">Volunteer</a>
            <a href="#verify-certificate" class="hover:text-white transition-colors duration-300 py-1">Verify Certificate</a>
          </nav>

          <!-- CTA & Mobile Toggle -->
          <div class="flex items-center gap-4">
            <a href="https://www.amaanitvam.org/donate/" target="_blank" class="hidden sm:inline-flex font-interface font-semibold text-[11px] uppercase tracking-widest px-5 py-2.5 rounded bg-pink-ruby text-white hover:bg-pink-ruby/90 shadow-sm transition-all duration-300" id="nav-donate">
              Donate
            </a>
            
            <button id="mobile-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Toggle Navigation" class="lg:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 focus:outline-none z-50">
              <span class="w-6 h-0.5 bg-white transition-all duration-300 ease-out origin-left hamburger-line" id="ham-line-1"></span>
              <span class="w-6 h-0.5 bg-white transition-all duration-300 ease-out hamburger-line" id="ham-line-2"></span>
              <span class="w-6 h-0.5 bg-white transition-all duration-300 ease-out origin-left hamburger-line" id="ham-line-3"></span>
            </button>
          </div>
        </div>

        <!-- Mobile Curtain Menu -->
        <div id="mobile-menu" class="fixed inset-0 bg-stone-950/98 backdrop-blur-xl flex flex-col pt-28 px-8 pb-8 z-40 translate-x-full transition-transform duration-500 lg:hidden shadow-2xl">
          <nav class="flex flex-col gap-6 font-interface font-semibold text-sm uppercase tracking-widest text-stone-300 mt-4">
            <a href="#/" class="mobile-nav-link hover:text-white transition-colors">Home</a>
            <a href="#/about" class="mobile-nav-link hover:text-white transition-colors">About Us</a>
            <a href="#/programs" class="mobile-nav-link hover:text-white transition-colors">Programs</a>
            <a href="#community" class="mobile-nav-link hover:text-white transition-colors">Community</a>
            <a href="#volunteer-form" class="mobile-nav-link hover:text-white transition-colors">Volunteer</a>
            <a href="#verify-certificate" class="mobile-nav-link hover:text-white transition-colors">Verify Certificate</a>
            
            <a href="https://www.amaanitvam.org/donate/" target="_blank" class="w-full text-center mt-6 font-interface font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded bg-pink-ruby text-white transition-all duration-300">
              Donate Now
            </a>
          </nav>
        </div>
      </header>
    `;
  }

  static init() {
    const header = document.getElementById('nav-header');
    const logo = document.getElementById('nav-logo');
    const title = document.getElementById('nav-title');
    const navLinks = document.getElementById('nav-links');
    const toggleBtn = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const hamburgerLines = document.querySelectorAll('.hamburger-line');

    if (!header || !toggleBtn || !mobileMenu) return;

    // Highlight active link based on hash path
    const hash = window.location.hash || '#/';
    if (hash === '#/about') {
      const link = document.getElementById('link-about');
      if (link) link.classList.add('active-nav');
    } else if (hash === '#/programs') {
      const link = document.getElementById('link-programs');
      if (link) link.classList.add('active-nav');
    } else if (hash === '#/' || hash === '') {
      const link = document.getElementById('link-home');
      if (link) link.classList.add('active-nav');
    }

    // Sticky Scroll Handler (Dual-state design: Light text on Dark Hero, Dark text on Light Content)
    const handleScroll = () => {
      if (window.scrollY > 60) {
        header.classList.remove('absolute', 'text-stone-200', 'border-white/5');
        header.classList.add('fixed', 'glass-nav', 'h-16', 'md:h-20', 'shadow-sm', 'border-b', 'border-stone-200/40', 'text-stone-600');
        
        logo.classList.remove('brightness-0', 'invert');
        title.classList.remove('text-white');
        title.classList.add('text-text-dark');
        
        if (navLinks) {
          navLinks.classList.remove('text-stone-300');
          navLinks.classList.add('text-stone-600');
          navLinks.querySelectorAll('a').forEach(a => {
            a.classList.remove('hover:text-white');
            a.classList.add('hover:text-text-dark');
          });
        }

        hamburgerLines.forEach(l => {
          l.classList.remove('bg-white');
          l.classList.add('bg-text-dark');
        });
      } else {
        header.classList.remove('fixed', 'glass-nav', 'h-16', 'md:h-20', 'shadow-sm', 'border-b', 'border-stone-200/40', 'text-stone-600');
        header.classList.add('absolute', 'text-stone-200', 'border-white/5');
        
        logo.classList.add('brightness-0', 'invert');
        title.classList.add('text-white');
        title.classList.remove('text-text-dark');
        
        if (navLinks) {
          navLinks.classList.add('text-stone-300');
          navLinks.classList.remove('text-stone-600');
          navLinks.querySelectorAll('a').forEach(a => {
            a.classList.add('hover:text-white');
            a.classList.remove('hover:text-text-dark');
          });
        }

        hamburgerLines.forEach(l => {
          l.classList.add('bg-white');
          l.classList.remove('bg-text-dark');
        });
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    let isOpen = false;
    const toggleMenu = () => {
      isOpen = !isOpen;
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      
      if (isOpen) {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        hamburgerLines[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
        hamburgerLines[1].style.opacity = '0';
        hamburgerLines[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
      } else {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        hamburgerLines[0].style.transform = '';
        hamburgerLines[1].style.opacity = '';
        hamburgerLines[2].style.transform = '';
      }
    };

    toggleBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isOpen) toggleMenu();
      });
    });
  }
}
