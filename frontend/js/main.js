(function () {
  'use strict';

  const nav = document.getElementById('site-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const currentPage = document.body.dataset.page || '';
  const navLinks = document.getElementById('nav-links');
  const hasGroupedNavbar = !!document.querySelector('.nav-item.has-dropdown');
  const needsNavbarUpgrade = !!nav && !!navLinks && !!mobileMenu && !hasGroupedNavbar;

  const pageMap = {
    about: 0,
    impact: 0,
    gallery: 0,
    volunteer: 1,
    internship: 1,
    contact: 1,
    resources: 2,
    updates: 2,
    verify: 2,
    faq: 2,
    circulars: 2
  };

  if (needsNavbarUpgrade) {
    navLinks.innerHTML = [
      '<a href="index.html" class="nav-link" data-nav="home">Home</a>',
      '<div class="nav-item has-dropdown">',
      '  <button class="nav-link dropdown-trigger" aria-haspopup="true" aria-expanded="false">',
      '    About Us',
      '    <span class="nav-chevron" aria-hidden="true">',
      '      <svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '    </span>',
      '  </button>',
      '  <div class="dropdown-menu" role="menu">',
      '    <a href="about.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">info</span></span>',
      '      <span class="dropdown-text"><strong>About Foundation</strong><small>Our story &amp; values</small></span>',
      '    </a>',
      '    <a href="impact.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">bar_chart</span></span>',
      '      <span class="dropdown-text"><strong>Impact</strong><small>What we\'ve achieved</small></span>',
      '    </a>',
      '    <a href="programs.html" class="dropdown-item" role="menuitem">',
'      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">school</span></span>',
'      <span class="dropdown-text"><strong>Programs</strong><small>Our initiatives and projects</small></span>',
'    </a>',
      '    <a href="gallery.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">photo_library</span></span>',
      '      <span class="dropdown-text"><strong>Gallery</strong><small>Photos &amp; moments</small></span>',
      '    </a>',
      '  </div>',
      '</div>',
      '<div class="nav-item has-dropdown">',
      '  <button class="nav-link dropdown-trigger" aria-haspopup="true" aria-expanded="false">',
      '    Get Involved',
      '    <span class="nav-chevron" aria-hidden="true">',
      '      <svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '    </span>',
      '  </button>',
      '  <div class="dropdown-menu" role="menu">',
      '    <a href="volunteer.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">volunteer_activism</span></span>',
      '      <span class="dropdown-text"><strong>Volunteer</strong><small>Join our volunteer network</small></span>',
      '    </a>',
      '    <a href="internship.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">work</span></span>',
      '      <span class="dropdown-text"><strong>Internship</strong><small>Apply for internship</small></span>',
      '    </a>',
      '    <a href="contact.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">mail</span></span>',
      '      <span class="dropdown-text"><strong>Contact Us</strong><small>Get in touch</small></span>',
      '    </a>',
      '    <a href="contact.html#partnerships-heading" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">handshake</span></span>',
      '      <span class="dropdown-text"><strong>Collaborations &amp; Partnerships</strong><small>Partner with our mission</small></span>',
      '    </a>',
      '  </div>',
      '</div>',
      '<div class="nav-item has-dropdown">',
      '  <button class="nav-link dropdown-trigger" aria-haspopup="true" aria-expanded="false">',
      '    Resources',
      '    <span class="nav-chevron" aria-hidden="true">',
      '      <svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '    </span>',
      '  </button>',
      '  <div class="dropdown-menu" role="menu">',
      '    <a href="updates.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">newspaper</span></span>',
      '      <span class="dropdown-text"><strong>Circulars &amp; Updates</strong><small>Latest news &amp; notices</small></span>',
      '    </a>',
      '    <a href="contact.html#faq" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">help</span></span>',
      '      <span class="dropdown-text"><strong>FAQ</strong><small>Common questions answered</small></span>',
      '    </a>',
      '    <a href="verify.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">verified</span></span>',
      '      <span class="dropdown-text"><strong>Verify Certificate</strong><small>Check your certificate</small></span>',
      '    </a>',
      '  </div>',
      '</div>'
    ].join('');

    mobileMenu.innerHTML = [
      '<div class="mobile-menu-inner">',
      '  <a href="index.html" class="mobile-link" style="padding:1rem 0.25rem;font-weight:600;display:block;">Home</a>',
      '  <div class="mobile-section">',
      '    <button class="mobile-group-toggle" aria-expanded="false">',
      '      About Us <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>',
      '    </button>',
      '    <div class="mobile-group-links">',
      '      <a href="about.html" class="mobile-link">About Foundation</a>',
      '      <a href="impact.html" class="mobile-link">Impact</a>',
      '      <a href="programs.html" class="mobile-link">Programs</a>',
      '      <a href="gallery.html" class="mobile-link">Gallery</a>',
      '    </div>',
      '  </div>',
      '  <div class="mobile-section">',
      '    <button class="mobile-group-toggle" aria-expanded="false">',
      '      Get Involved <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>',
      '    </button>',
      '    <div class="mobile-group-links">',
      '      <a href="volunteer.html" class="mobile-link">Volunteer</a>',
      '      <a href="internship.html" class="mobile-link">Internship</a>',
      '      <a href="contact.html" class="mobile-link">Contact Us</a>',
      '      <a href="contact.html#partnerships-heading" class="mobile-link">Collaborations &amp; Partnerships</a>',
      '    </div>',
      '  </div>',
      '  <div class="mobile-section">',
      '    <button class="mobile-group-toggle" aria-expanded="false">',
      '      Resources <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>',
      '    </button>',
      '    <div class="mobile-group-links">',
      '      <a href="updates.html" class="mobile-link">Circulars &amp; Updates</a>',
      '      <a href="contact.html#faq" class="mobile-link">FAQ</a>',
      '      <a href="verify.html" class="mobile-link">Verify Certificate</a>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  /* Navbar logic for grouped nav markup, including pages that still need upgrading. */
  if (hasGroupedNavbar || needsNavbarUpgrade) {
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      if (link.dataset.nav === currentPage) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });

    if (currentPage && pageMap[currentPage] !== undefined) {
      const triggers = document.querySelectorAll('.nav-link.dropdown-trigger');
      const activeTrigger = triggers[pageMap[currentPage]];

      if (activeTrigger) {
        activeTrigger.classList.add('is-active');
      }
    }

    function updateNav() {
      if (!nav) return;
      const hero = document.querySelector('[data-hero]');
      const scrolled = window.scrollY > 40;
      const hasHero = hero && hero.getBoundingClientRect().bottom > 80;

      if (hasHero && !scrolled) {
        nav.classList.add('is-transparent');
        nav.classList.remove('is-solid');
      } else {
        nav.classList.remove('is-transparent');
        nav.classList.add('is-solid');
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', function () {
        const open = mobileMenu.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', open);
        menuToggle.classList.toggle('is-active', open);
        mobileMenu.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
      });

      mobileMenu.querySelectorAll('.mobile-group-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const section = btn.closest('.mobile-section');
          const links = section ? section.querySelector('.mobile-group-links') : null;
          const isExpanded = btn.getAttribute('aria-expanded') === 'true';

          mobileMenu.querySelectorAll('.mobile-section').forEach(function (item) {
            const toggle = item.querySelector('.mobile-group-toggle');
            const panel = item.querySelector('.mobile-group-links');

            if (toggle) toggle.setAttribute('aria-expanded', 'false');
            if (panel) panel.classList.remove('is-open');
          });

          if (!isExpanded && links) {
            btn.setAttribute('aria-expanded', 'true');
            links.classList.add('is-open');
          }
        });
      });

      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('is-open');
          mobileMenu.setAttribute('aria-hidden', 'true');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('is-active');
          document.body.style.overflow = '';
        });
      });
    }

    document.querySelectorAll('.nav-item.has-dropdown').forEach(function (item) {
      const trigger = item.querySelector('.dropdown-trigger');
      const menu = item.querySelector('.dropdown-menu');

      if (!trigger || !menu) return;

      function openMenu() {
        trigger.setAttribute('aria-expanded', 'true');
        menu.classList.add('is-open');
      }

      function closeMenu() {
        trigger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      }

      item.addEventListener('mouseenter', openMenu);
      item.addEventListener('mouseleave', closeMenu);

      trigger.addEventListener('click', function () {
        trigger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
      });

      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item.has-dropdown')) {
        document.querySelectorAll('.dropdown-trigger').forEach(function (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll('.dropdown-menu').forEach(function (menu) {
          menu.classList.remove('is-open');
        });
      }
    });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      const expanded = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', expanded);
    });
  });

  /* Contact form */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contact-status');
  const whatsappInviteUrl = 'https://chat.whatsapp.com/DhebPGMO2JILFfja86gybF';

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonHtml = submitButton ? submitButton.innerHTML : '';
      const formData = new FormData(contactForm);
      const apiUrl = contactForm.dataset.apiUrl || 'http://localhost:5000/api/contact';

      if (contactStatus) {
        contactStatus.innerHTML = '<p style="margin:0;">Sending your message...</p>';
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">progress_activity</span> Sending...';
      }

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to send message');
        }

        contactForm.reset();

        if (contactStatus) {
          contactStatus.innerHTML = [
            '<div style="padding:1rem 1.1rem;border:1px solid rgba(46, 125, 50, 0.2);border-radius:16px;background:rgba(46, 125, 50, 0.06);color:var(--navy);">',
            '  <p style="margin:0 0 0.75rem;">',
            '    Please join the WhatsApp community to stay updated and in touch with us.',
            '  </p>',
            '  <a class="btn btn-whatsapp" href="' + whatsappInviteUrl + '" target="_blank" rel="noopener noreferrer">',
            '    <i class="fab fa-whatsapp" aria-hidden="true"></i>',
            '    Join WhatsApp',
            '  </a>',
            '</div>'
          ].join('');
        }
      } catch (error) {
        if (contactStatus) {
          contactStatus.textContent = error.message || 'Something went wrong. Please try again.';
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
        }
      }
    });
  }

  /* Certificate verification demo */
  const verifyForm = document.getElementById('verify-form');
  if (verifyForm) {
    verifyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('cert-id').value.trim();
      const result = document.getElementById('verify-result');
      if (!id) return;
      result.hidden = false;
      result.className = 'mt-6 p-6 rounded-xl border ';
      if (id.toUpperCase().startsWith('AF-')) {
        result.className += 'border-green-200 bg-green-50';
        result.innerHTML = '<div class="flex items-start gap-3"><span class="material-symbols-outlined text-green-600 icon-fill">verified</span><div><p class="font-semibold text-green-800">Certificate Verified</p><p class="text-sm text-green-700 mt-1">This certificate is authentic and was issued by Amaanitvam Foundation.</p></div></div>';
      } else {
        result.className += 'border-red-200 bg-red-50';
        result.innerHTML = '<div class="flex items-start gap-3"><span class="material-symbols-outlined text-red-600">cancel</span><div><p class="font-semibold text-red-800">Not Found</p><p class="text-sm text-red-700 mt-1">No matching certificate found. Please check the ID and try again.</p></div></div>';
      }
    });
  }
})();
/* Donation Section */

let selectedAmount = 10;

const amountButtons = document.querySelectorAll('.amount-btn');
const customAmount = document.getElementById('customAmount');
const payButton = document.getElementById('payButton');

if (amountButtons.length) {

  amountButtons.forEach(btn => {

    btn.addEventListener('click', () => {

      amountButtons.forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      selectedAmount = btn.dataset.amount;

      if (customAmount) {
        customAmount.value = '';
      }

    });

  });

}

if (customAmount) {

  customAmount.addEventListener('input', function () {

    amountButtons.forEach(b => b.classList.remove('active'));

    selectedAmount = this.value;

  });

}

if (payButton) {

  payButton.addEventListener('click', () => {

    if (!selectedAmount || selectedAmount < 10) {
      alert('Minimum donation amount is ₹10');
      return;
    }

    alert(
      `Selected Donation Amount: ₹${selectedAmount}\n\nRazorpay integration will be connected by backend.`
    );

  });

}