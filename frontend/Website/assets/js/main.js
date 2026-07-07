const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : 'https://amaanitvam-foundation.onrender.com/api';
    
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
    collaborations: 1,
    resources: 2,
    verify: 2,
    faq: 2
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
      '    <a href="collaborations.html" class="dropdown-item" role="menuitem">',
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
      '    <a href="resources.html" class="dropdown-item" role="menuitem">',
      '      <span class="dropdown-icon"><span class="material-symbols-outlined" aria-hidden="true">library_books</span></span>',
      '      <span class="dropdown-text"><strong>Resources</strong><small>Guidelines, tools &amp; documents</small></span>',
      '    </a>',
      '    <a href="faq.html" class="dropdown-item" role="menuitem">',
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
      '  <a href="index.html" class="mobile-link" class="mobile-link mobile-home-link">Home</a>',
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
      '      <a href="collaborations.html" class="mobile-link">Collaborations &amp; Partnerships</a>',
      '    </div>',
      '  </div>',
      '  <div class="mobile-section">',
      '    <button class="mobile-group-toggle" aria-expanded="false">',
      '      Resources <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>',
      '    </button>',
      '    <div class="mobile-group-links">',
      '      <a href="resources.html" class="mobile-link">Resources</a>',
      '      <a href="faq.html" class="mobile-link">FAQ</a>',
      '      <a href="verify.html" class="mobile-link">Verify Certificate</a>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }


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


  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      const expanded = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', expanded);
    });
  });


  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contact-status');
  const whatsappInviteUrl = 'https://chat.whatsapp.com/DhebPGMO2JILFfja86gybF';

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonHtml = submitButton ? submitButton.innerHTML : '';
      const formData = new FormData(contactForm);
      const apiUrl = contactForm.dataset.apiUrl || API_BASE_URL + '/contact';

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

  const verifyForm = document.getElementById("verify-form");

  if (verifyForm) {
    verifyForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const id = document.getElementById("cert-id").value.trim().toUpperCase();
      const result = document.getElementById("verify-result");

      if (!id) return;

      result.hidden = false;
      result.innerHTML = "Verifying...";

      try {
        const response = await fetch(`${API_BASE_URL}/certificates/verify/${encodeURIComponent(id)}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Certificate not found");
        }

        const cert = data.certificate;

        result.className = "mt-6 p-6 rounded-xl border border-green-200 bg-green-50";
        result.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-green-600 icon-fill">verified</span>
          <div>
            <p class="font-semibold text-green-800">Certificate Verified</p>

            <p><strong>Name:</strong> ${cert.issuedTo}</p>
            <p><strong>Certificate ID:</strong> ${cert.certificateId}</p>
            <p><strong>Type:</strong> ${cert.type}</p>
            <p><strong>Domain:</strong> ${cert.domain}</p>
            <p><strong>Issued By:</strong> ${cert.issuedBy}</p>
          </div>
        </div>
      `;

      } catch (err) {

        result.className = "mt-6 p-6 rounded-xl border border-red-200 bg-red-50";
        result.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-red-600">cancel</span>
          <div>
            <p class="font-semibold text-red-800">Certificate Not Found</p>
            <p>${err.message}</p>
          </div>
        </div>
      `;
      }
    });
  }

  const socialBar = `
<div class="floating-socials">
    <a href="https://www.facebook.com/people/Amaanitvam-Foundation/61583427622759/" target="_blank">
        <i class="fa-brands fa-facebook-f"></i>
    </a>

    <a href="https://www.instagram.com/amaanitvamfoundation" target="_blank">
        <i class="fa-brands fa-instagram"></i>
    </a>

    <a href="https://x.com/AmaanitvamOrg" target="_blank">
        <i class="fa-brands fa-x-twitter"></i>
    </a>

    <a href="https://www.linkedin.com/company/amaanitvam-foundation/" target="_blank">
        <i class="fa-brands fa-linkedin-in"></i>
    </a>
</div>
`;

  if (document.body && !document.querySelector(".floating-socials")) {
    document.body.insertAdjacentHTML("beforeend", socialBar);
  }

  // Load common footer on all pages
  document.addEventListener("DOMContentLoaded", function () {
    const footer = document.getElementById("footer");

    if (footer) {
      fetch("footer.html")
        .then(function (response) {
          return response.text();
        })
        .then(function (data) {
          footer.innerHTML = data;
        })
        .catch(function (error) {
          console.error("Footer load error:", error);
        });
    }
  });


  /* ===== Campaign Donations + Funds Fix: single safe block ===== */
  (function () {
    if (window.__amaanitvamCampaignFundsFixLoaded) return;
    window.__amaanitvamCampaignFundsFixLoaded = true;

    const MIN_AMOUNT = 1;
    let activeCampaigns = [];
    let selectedCampaignId = 'organization';
    let workingApiBase = null;

    function isLocalHost() {
      return ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
    }

    function apiCandidates() {
      const configured =
        window.AMAANITVAM_API_BASE ||
        document.body?.dataset?.apiBase ||
        document.querySelector('meta[name="amaanitvam-api-base"]')?.content ||
        '';

      const list = [];
      if (configured) list.push(configured.replace(/\/$/, ''));

      // Always try the real backend first — on localhost AND in production.
      list.push(API_BASE_URL);

      return [...new Set(list.filter(Boolean))];
    }

    async function fetchJson(path, options = {}) {
    const { timeoutMs = 45000, ...fetchOptions } = options || {};
    const bases = workingApiBase ? [workingApiBase, ...apiCandidates()] : apiCandidates();
    let lastError;

    for (const base of [...new Set(bases)]) {
      let timer;
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

      try {
        if (controller && timeoutMs && Number(timeoutMs) > 0) {
          timer = setTimeout(() => {
            try {
              controller.abort(new Error('Request timed out.'));
            } catch (_) {
              controller.abort();
            }
          }, Number(timeoutMs));
        }

        const response = await fetch(`${base}${path}`, {
          ...fetchOptions,
          signal: controller ? controller.signal : fetchOptions.signal,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || `Request failed: ${response.status}`);

        workingApiBase = base;
        return data;
      } catch (error) {
        if (error?.name === 'AbortError' || /aborted|timeout|timed out/i.test(error?.message || '')) {
          lastError = new Error('Request timed out while confirming your payment. Please check the Donations admin panel before trying again.');
        } else {
          lastError = error;
        }
      } finally {
        if (timer) clearTimeout(timer);
      }
    }

    throw lastError || new Error('Backend API is not reachable.');
  }

    function escapeHtml(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function rupees(value) {
      return `₹${Number(value || 0).toLocaleString('en-IN')}`;
    }

    function progress(campaign) {
      const goal = Number(campaign.goalAmount || 0);
      const raised = Number(campaign.raisedAmount || 0);
      if (!goal) return 0;
      return Math.min(100, Math.max(0, Math.round((raised / goal) * 100)));
    }

    function injectStyles() {
      if (document.getElementById('amaanitvam-campaign-funds-style')) return;
      const style = document.createElement('style');
      style.id = 'amaanitvam-campaign-funds-style';
      style.textContent = `
      .campaign-donation-selector,.campaign-preview-section{margin:1.25rem 0}
      .campaign-selector-title,.campaign-eyebrow{color:#56051a;font-weight:800;letter-spacing:.02em}
      .campaign-selector-subtitle{color:#6b7280;margin:.25rem 0 1rem}
      .campaign-options,.campaign-preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.9rem}
      .campaign-option,.campaign-preview-card{border:1px solid #ead7dd;border-radius:16px;padding:1rem;background:#fff;box-shadow:0 10px 30px rgba(86,5,26,.08)}
      .campaign-option{cursor:pointer;display:block}
      .campaign-option input{margin-right:.5rem}
      .campaign-option.is-selected{border-color:#56051a;box-shadow:0 12px 35px rgba(86,5,26,.18)}
      .campaign-option-title,.campaign-preview-card h3{display:block;font-weight:800;color:#56051a;margin-bottom:.35rem}
      .campaign-option-desc,.campaign-preview-card p{color:#6b7280;font-size:.95rem;line-height:1.5}
      .campaign-progress{height:8px;background:#f3e7eb;border-radius:999px;overflow:hidden;margin:.75rem 0 .4rem}
      .campaign-progress span{display:block;height:100%;background:#56051a}
      .campaign-meta{color:#374151;font-weight:700;font-size:.9rem}
      .campaign-preview-section{padding:3rem 1.25rem;background:#fff7f9}
      .campaign-preview-inner{max-width:1120px;margin:0 auto}
      .campaign-preview-inner h2{color:#56051a;font-size:clamp(1.7rem,3vw,2.4rem);margin:.25rem 0 .75rem}
      .campaign-donate-link{display:inline-block;margin-top:.9rem;padding:.7rem 1rem;border-radius:999px;background:#56051a;color:#fff;text-decoration:none;font-weight:800}
      .campaign-error{color:#b91c1c;background:#fee2e2;border:1px solid #fecaca;border-radius:12px;padding:.85rem}
    `;
      document.head.appendChild(style);
    }

    async function loadCampaigns() {
      const data = await fetchJson('/donate/campaigns');
      activeCampaigns = Array.isArray(data) ? data : Array.isArray(data.campaigns) ? data.campaigns : [];
      return activeCampaigns;
    }

    function renderHomeCampaigns() {
      const container = document.getElementById('homeCampaigns');
      if (!container) return;

      if (!activeCampaigns.length) {
        container.innerHTML = `
        <div class="campaign-preview-inner">
          <p class="campaign-eyebrow">Active Fundraising Campaigns</p>
          <h2>Support Amaanitvam Foundation</h2>
          <p>No active campaigns are live right now. You can still make a direct organization donation.</p>
          <a class="campaign-donate-link" href="contact.html">Donate Now</a>
        </div>`;
        return;
      }

      container.innerHTML = `
      <div class="campaign-preview-inner">
        <p class="campaign-eyebrow">Active Fundraising Campaigns</p>
        <h2>Support a live campaign</h2>
        <div class="campaign-preview-grid">
          ${activeCampaigns.map((campaign) => {
        const id = campaign._id || campaign.id;
        const pct = progress(campaign);
        return `
              <article class="campaign-preview-card">
                <h3>${escapeHtml(campaign.title)}</h3>
                <p>${escapeHtml(campaign.description || 'Support this active campaign.')}</p>
                <div class="campaign-progress"><span style="width:${pct}%"></span></div>
                <div class="campaign-meta">${rupees(campaign.raisedAmount)} raised / ${rupees(campaign.goalAmount)} goal</div>
                <a class="campaign-donate-link" href="contact.html?campaign=${encodeURIComponent(id)}">Donate to this campaign</a>
              </article>`;
      }).join('')}
        </div>
      </div>`;
    }

    function renderCampaignSelector() {
      const container = document.getElementById('campaignDonationSelector');
      if (!container) return;

      const requested = new URLSearchParams(window.location.search).get('campaign');
      if (requested && activeCampaigns.some((c) => String(c._id || c.id) === String(requested))) {
        selectedCampaignId = requested;
      }

      const campaignCards = activeCampaigns.map((campaign) => {
        const id = campaign._id || campaign.id;
        const checked = String(selectedCampaignId) === String(id) ? 'checked' : '';
        const selected = checked ? ' is-selected' : '';
        const pct = progress(campaign);
        return `
        <label class="campaign-option${selected}">
          <input type="radio" name="donationTarget" value="${escapeHtml(id)}" ${checked}>
          <span class="campaign-option-title">${escapeHtml(campaign.title)}</span>
          <p class="campaign-option-desc">${escapeHtml(campaign.description || 'Support this active campaign.')}</p>
          <div class="campaign-progress"><span style="width:${pct}%"></span></div>
          <div class="campaign-meta">${rupees(campaign.raisedAmount)} raised / ${rupees(campaign.goalAmount)} goal</div>
        </label>`;
      }).join('');

      container.innerHTML = `
      <div class="campaign-selector-title">Choose where your donation should go</div>
      <p class="campaign-selector-subtitle">Donate directly to the organization or select an active campaign.</p>
      <div class="campaign-options">
        <label class="campaign-option ${selectedCampaignId === 'organization' ? 'is-selected' : ''}">
          <input type="radio" name="donationTarget" value="organization" ${selectedCampaignId === 'organization' ? 'checked' : ''}>
          <span class="campaign-option-title">Amaanitvam Foundation</span>
          <p class="campaign-option-desc">Direct donation to the organization for general foundation work.</p>
        </label>
        ${campaignCards || '<div class="campaign-option"><span class="campaign-option-title">No active campaigns right now</span><p class="campaign-option-desc">Direct organization donation is available.</p></div>'}
      </div>`;

      container.querySelectorAll('input[name="donationTarget"]').forEach((input) => {
        input.addEventListener('change', () => {
          selectedCampaignId = input.value || 'organization';
          container.querySelectorAll('.campaign-option').forEach((card) => card.classList.remove('is-selected'));
          input.closest('.campaign-option')?.classList.add('is-selected');
        });
      });
    }

    function currentAmount() {
      const activeBtn = document.querySelector('.amount-btn.active');
      const customAmount = document.getElementById('customAmount');
      const amount = Number(customAmount?.value || activeBtn?.dataset?.amount || 0);
      return Number.isFinite(amount) ? amount : 0;
    }

    function setupAmountButtons() {
      const customAmount = document.getElementById('customAmount');
      document.querySelectorAll('.amount-btn').forEach((btn) => {
        if (btn.dataset.campaignFundsBound === 'true') return;
        btn.dataset.campaignFundsBound = 'true';
        btn.addEventListener('click', () => {
          document.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          if (customAmount) customAmount.value = '';
        });
      });
      if (customAmount && customAmount.dataset.campaignFundsBound !== 'true') {
        customAmount.dataset.campaignFundsBound = 'true';
        customAmount.addEventListener('input', () => {
          document.querySelectorAll('.amount-btn').forEach((b) => b.classList.remove('active'));
        });
      }
    }

    function status(message, color) {
      const el = document.getElementById('donate-status');
      if (!el) return;
      el.textContent = message || '';
      el.style.color = color || '';
    }

    function loadRazorpay() {
      return new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existing) {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    function resetForm() {
      ['donorName', 'donorEmail', 'donorPhone'].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.value = '';
      });
      const customAmount = document.getElementById('customAmount');
      if (customAmount) customAmount.value = '';
      document.querySelectorAll('.amount-btn').forEach((btn) => btn.classList.remove('active'));
      selectedCampaignId = 'organization';
      renderCampaignSelector();
    }

    async function payNow(button) {
      const name = document.getElementById('donorName')?.value.trim() || '';
      const email = document.getElementById('donorEmail')?.value.trim() || '';
      const phone = document.getElementById('donorPhone')?.value.trim() || '';
      const amount = currentAmount();
      const campaignId = selectedCampaignId === 'organization' ? null : selectedCampaignId;

      if (!name || !email) return status('Please enter your name and email.', 'red');
      if (amount < MIN_AMOUNT) return status('Minimum donation amount is ₹1.', 'red');

      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = 'Processing...';
      status('', '');

      try {
        await loadRazorpay();
        const data = await fetchJson('/donate/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, amount, campaignId }),
        });

        const options = {
          key: data.key,
          amount: data.order.amount,
          currency: data.order.currency || 'INR',
          name: 'Amaanitvam Foundation',
          description: data.campaign?.title ? `Donation for ${data.campaign.title}` : 'Donation to Amaanitvam Foundation',
          order_id: data.order.id,
          prefill: { name, email, contact: phone },
          theme: { color: '#56051a' },
          modal: {
            ondismiss: () => {
              button.disabled = false;
              button.textContent = originalText || 'Proceed to Pay Securely';
            },
          },
          handler: async (paymentResponse) => {
            try {
              const verifyData = await fetchJson('/donate/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  campaignId,
                }),
              });

              status('✅ ' + (verifyData.message || 'Payment successful. Thank you!'), '#16a34a');
              resetForm();
              await loadCampaigns();
              renderCampaignSelector();
              renderHomeCampaigns();
            } catch (error) {
              status(error.message || 'Payment verification failed. Please contact support.', 'red');
            } finally {
              button.disabled = false;
              button.textContent = originalText || 'Proceed to Pay Securely';
            }
          },
        };

        new window.Razorpay(options).open();
      } catch (error) {
        status(error.message || 'Donation failed. Please try again.', 'red');
        button.disabled = false;
        button.textContent = originalText || 'Proceed to Pay Securely';
      }
    }

    async function boot() {
      const hasCampaignArea = document.getElementById('homeCampaigns') || document.getElementById('campaignDonationSelector');
      const payButton = document.getElementById('payButton');
      if (!hasCampaignArea && !payButton) return;

      injectStyles();
      setupAmountButtons();

      try {
        await loadCampaigns();
        renderHomeCampaigns();
        renderCampaignSelector();
      } catch (error) {
        const message = `Could not load active campaigns from the API. ${escapeHtml(error.message || '')}`;
        const home = document.getElementById('homeCampaigns');
        const selector = document.getElementById('campaignDonationSelector');
        if (home) home.innerHTML = `<div class="campaign-preview-inner"><div class="campaign-error">${message}</div></div>`;
        if (selector) selector.innerHTML = `<div class="campaign-error">${message}</div>`;
        console.error('Campaign loading failed:', error);
      }

      if (payButton && document.getElementById('donorName') && document.getElementById('donorEmail')) {
        // Remove old duplicate click handlers that may have been bound earlier in main.js.
        const cleanButton = payButton.cloneNode(true);
        payButton.parentNode.replaceChild(cleanButton, payButton);
        cleanButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          payNow(cleanButton);
        }, true);
      }
    }

<<<<<<< HEAD
  document.querySelectorAll('.faq-question').forEach(function (button) {
    button.addEventListener('click', function () {
      const item = button.closest('.faq-item');
      const isOpen = item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen);
    });
  });
})();

fetch('footer.html')
  .then(function (response) {
    return response.text();
  })
  .then(function (data) {
    const footer = document.getElementById('footer');
    if (footer) footer.innerHTML = data;
  });


/* ===== Moved from gallery.html inline script ===== */
(function () {
  const nav = document.getElementById('site-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
=======
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  })();

  /* ===== Amaanitvam Gallery Album Loader - merged into main.js =====
     Mirrors admin-created gallery folders on frontend/Website/gallery.html.
     Important: this page intentionally shows ONLY real admin-created albums.
     Unassigned/uncategorized media is NOT shown as a separate public album.
     Do not move this into a separate JS file unless project policy changes.
  */
  (function () {
    'use strict';

    const container = document.getElementById('gallery-album-container');
    const isGalleryPage = document.body?.dataset?.page === 'gallery' || /gallery\.html?$/i.test(window.location.pathname);
    if (!container || !isGalleryPage) return;

    let activeApiBase = cleanBase(
      container.dataset.galleryApiBase ||
      window.GALLERY_API_BASE ||
      (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL.replace(/\/api$/, '') : '') ||
      localStorage.getItem('GALLERY_API_BASE') ||
      localStorage.getItem('API_BASE_URL') ||
      localStorage.getItem('backendUrl') ||
      ''
    );
>>>>>>> upstream/main

    let currentFolders = [];
    const folderMediaCache = new Map();

    function cleanBase(value) {
      return String(value || '').trim().replace(/\/+$/, '');
    }

    function isLocalWebsiteHost() {
      return ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
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
          const timeout = window.setTimeout(() => controller.abort(), 10000);
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

      throw lastError || new Error('Gallery backend is not reachable. Start backend with npm run dev.');
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

      // Convert Live Server URLs like http://127.0.0.1:5500/api/gallery/media/id back to backend.
      try {
        const parsed = new URL(raw, window.location.origin);
        if (parsed.pathname.startsWith('/api/')) return `${base}${parsed.pathname}${parsed.search}`;
      } catch (_) {
        // Continue with string fallbacks below.
      }

      if (/^(data:|blob:)/i.test(raw)) return raw;
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

    function isImage(media) {
      if (!media) return false;
      if (media.mediaType === 'image') return true;
      if (String(media.contentType || '').startsWith('image/')) return true;
      return !isVideo(media);
    }

    function timestampValue(item) {
      const value = Date.parse(item?.createdAt || item?.uploadedAt || item?.updatedAt || '');
      return Number.isFinite(value) ? value : 0;
    }

    function sortByUploadOrder(mediaItems) {
      return [...(mediaItems || [])].sort((a, b) => {
        const byDate = timestampValue(a) - timestampValue(b);
        if (byDate !== 0) return byDate;
        return String(getId(a)).localeCompare(String(getId(b)));
      });
    }

    function pickFolderCover(folder) {
      return folder?.__coverMedia || folder?.coverMedia || folder?.coverImage || folder?.coverUrl || folder?.thumbnail || folder?.cover || null;
    }

    async function getFolderMedia(folderId) {
      if (folderMediaCache.has(folderId)) return folderMediaCache.get(folderId);

      const data = await fetchGalleryJson(`/api/gallery/folders/${encodeURIComponent(folderId)}/media`);
      const media = Array.isArray(data.images) ? data.images : Array.isArray(data.media) ? data.media : [];
      const ordered = sortByUploadOrder(media);
      folderMediaCache.set(folderId, ordered);
      return ordered;
    }

    async function hydrateFolderCovers() {
      const foldersToCheck = currentFolders.filter((folder) => {
        const id = getId(folder);
        return id && Number(folder.mediaCount || 0) > 0;
      });

      // Resolve every album cover from backend folder media.
      // Future admin-created albums automatically get the first valid uploaded photo as cover.
      const batchSize = 4;
      for (let index = 0; index < foldersToCheck.length; index += batchSize) {
        const batch = foldersToCheck.slice(index, index + batchSize);
        await Promise.all(batch.map(async (folder) => {
          try {
            const existingCover = pickFolderCover(folder);
            const media = await getFolderMedia(getId(folder));
            const photoCandidates = sortByUploadOrder(media).filter(isImage);
            folder.__coverCandidates = photoCandidates;
            folder.__coverMedia = existingCover || photoCandidates[0] || media[0] || null;
          } catch (error) {
            console.warn('Could not resolve gallery album cover:', folder?.name || folder?._id, error);
            folder.__coverMedia = pickFolderCover(folder);
            folder.__coverCandidates = folder.__coverMedia ? [folder.__coverMedia] : [];
          }
        }));
      }
    }

    function placeholderMarkup(extraClass = '') {
      return `<div class="gallery-album-placeholder ${extraClass}" aria-hidden="true">
      <span class="material-symbols-outlined">photo_library</span>
    </div>`;
    }

    function mediaThumb(media, extraClass = '') {
      const url = normalizeMediaUrl(media);
      const title = escapeHtml(media?.title || media?.originalName || media?.filename || media?.name || 'Gallery media');

      if (!url) return placeholderMarkup(extraClass);

      if (isVideo(media)) {
        return `<video class="${extraClass}" src="${escapeHtml(url)}" controls playsinline preload="metadata" aria-label="${title}"></video>`;
      }

      return `<img class="${extraClass}" src="${escapeHtml(url)}" alt="${title}" loading="lazy" decoding="async" />`;
    }

    function albumCoverMarkup(folder) {
      const id = getId(folder);
      const cover = pickFolderCover(folder);
      const url = normalizeMediaUrl(cover);
      const title = escapeHtml(cover?.title || cover?.originalName || folder?.name || 'Gallery album cover');

      if (!url) return placeholderMarkup('gallery-album-cover-media');

      if (isVideo(cover)) {
        return `<video class="gallery-album-cover-media" src="${escapeHtml(url)}" muted playsinline preload="metadata" aria-label="${title}"></video>`;
      }

      return `<img class="gallery-album-cover-media" src="${escapeHtml(url)}" alt="${title}" loading="lazy" decoding="async" data-folder-id="${escapeHtml(id)}" data-cover-index="0" />`;
    }

    function attachCoverFallbacks() {
      container.querySelectorAll('img.gallery-album-cover-media[data-folder-id]').forEach((img) => {
        img.addEventListener('error', () => {
          const folderId = img.dataset.folderId;
          const folder = currentFolders.find((item) => String(getId(item)) === String(folderId));
          const candidates = folder?.__coverCandidates || [];
          let nextIndex = Number(img.dataset.coverIndex || 0) + 1;

          while (nextIndex < candidates.length) {
            const nextUrl = normalizeMediaUrl(candidates[nextIndex]);
            if (nextUrl && nextUrl !== img.src) {
              img.dataset.coverIndex = String(nextIndex);
              img.src = nextUrl;
              img.alt = candidates[nextIndex]?.title || candidates[nextIndex]?.originalName || folder?.name || 'Gallery album cover';
              return;
            }
            nextIndex += 1;
          }

          img.replaceWith(document.createRange().createContextualFragment(placeholderMarkup('gallery-album-cover-media')));
        });
      });
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

    function renderMessage(message, tone = 'info') {
      container.className = 'gallery-album-shell';
      container.innerHTML = `<div class="gallery-state gallery-state-${tone}">${escapeHtml(message)}</div>`;
    }

    function renderAlbums() {
      setIntro('Browse Gallery Albums', 'Open an album to view images and videos grouped by the same folders');
      container.className = 'gallery-grid gallery-albums-grid';

      const albums = [...currentFolders];

      if (!albums.length) {
        renderMessage('No gallery albums are available yet. Albums uploaded from the admin portal will appear here automatically.');
        return;
      }

      container.innerHTML = albums.map((folder) => {
        const id = getId(folder);
        const name = folder.name || folder.title || 'Untitled Album';
        const description = folder.description || 'View photos and videos from this album.';

        return `<article class="gallery-album-card gallery-card reveal-card" data-folder-id="${escapeHtml(id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(name)} album">
        <div class="gallery-album-cover">
          ${albumCoverMarkup(folder)}
          <span class="gallery-album-count">${escapeHtml(albumCountLabel(folder.mediaCount))}</span>
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

      attachCoverFallbacks();
    }

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

      try {
        const media = await getFolderMedia(folderId);
        renderAlbumMedia(folder, media);
      } catch (error) {
        renderMessage(error.message || 'Failed to load this album.', 'error');
      }
    }

    function renderAlbumMedia(folder, media) {
      container.className = 'gallery-album-shell';

      const count = albumCountLabel(media.length);
      const grid = media.length
        ? `<div class="gallery-album-media-grid">
          ${media.map((item) => {
          const title = item.title || item.originalName || item.filename || 'Gallery media';
          return `<figure class="gallery-media-card gallery-card reveal-card">
              <div class="gallery-media-frame">${mediaThumb(item, 'gallery-media-file')}</div>
              <figcaption>${escapeHtml(title)}</figcaption>
            </figure>`;
        }).join('')}
        </div>`
        : `<div class="gallery-state">No media has been uploaded in this album yet.</div>`;

      container.innerHTML = `<div class="gallery-album-toolbar">
      <button class="gallery-back-button" type="button" id="galleryBackToAlbums">← Back to Albums</button>
      <div>
        <span class="gallery-album-kicker">${escapeHtml(count)}</span>
        <h3>${escapeHtml(folder.name || 'Gallery Album')}</h3>
      </div>
    </div>
    ${grid}`;

      document.getElementById('galleryBackToAlbums')?.addEventListener('click', renderAlbums);
    }

    async function initAlbumGallery() {
      renderMessage('Loading gallery albums...');

      try {
        const foldersData = await fetchGalleryJson('/api/gallery/folders');

        // Show ONLY albums/folders that exist in admin portal.
        // Do not call /api/gallery?uncategorized=true and do not create a fake Uncategorized album.
        currentFolders = Array.isArray(foldersData.folders) ? foldersData.folders : [];

        await hydrateFolderCovers();
        renderAlbums();
      } catch (error) {
        renderMessage(error.message || 'Failed to load gallery albums.', 'error');
      }
    }

       if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAlbumGallery, { once: true });
    } else {
      initAlbumGallery();
    }
  })();

})();

/* ===== Internship application form (internship.html) ===== */
document.getElementById('internshipForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = document.getElementById('int-submit-btn');
  const btnText = btn.querySelector('.submit-btn-text');
  const btnSpinner = btn.querySelector('.submit-btn-spinner');
  const btnSuccess = btn.querySelector('.submit-btn-success');
  const status = document.getElementById('int-status');

  // Reset states
  btn.classList.remove('is-success', 'is-error');
  status.textContent = '';
  status.className = '';
  status.style.color = '';

  // Show spinner
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline-flex';
  btnSuccess.style.display = 'none';
  btn.classList.add('is-loading');

  const formData = new FormData(this);

  try {
    const response = await fetch(API_BASE_URL + '/internship/apply', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (response.ok) {
      // Show success
      btnSpinner.style.display = 'none';
      btnSuccess.style.display = 'inline-flex';
      btn.classList.remove('is-loading');
      btn.classList.add('is-success');
      status.textContent = result.message || "Application submitted successfully!";
      status.style.color = "#22c55e";
      status.className = 'show';
      this.reset();
      // Reset button after 3 seconds
      setTimeout(() => {
        btnSuccess.style.display = 'none';
        btnText.style.display = 'inline';
        btn.classList.remove('is-success');
      }, 3000);
    } else {
      btnSpinner.style.display = 'none';
      btnText.style.display = 'inline';
      btn.classList.remove('is-loading');
      btn.classList.add('is-error');
      status.textContent = result.message || "Error submitting application.";
      status.style.color = "red";
      status.className = 'show';
      setTimeout(() => btn.classList.remove('is-error'), 600);
    }
  } catch (err) {
    btnSpinner.style.display = 'none';
    btnText.style.display = 'inline';
    btn.classList.remove('is-loading');
    btn.classList.add('is-error');
    status.textContent = "Failed to connect to the server.";
    status.style.color = "red";
    status.className = 'show';
    setTimeout(() => btn.classList.remove('is-error'), 600);
  }
});

/* ===== Volunteer application form (volunteer.html) ===== */
document.getElementById('volunteerForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const status = document.getElementById('vol-status');
  status.textContent = "Submitting...";
  status.style.color = "var(--navy)";

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(API_BASE_URL + '/volunteer/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
      status.textContent = result.message || "Application submitted successfully!";
      status.style.color = "green";
      this.reset();
    } else {
      status.textContent = result.message || "Error submitting application.";
      status.style.color = "red";
    }
  } catch (err) {
    status.textContent = "Failed to connect to the server.";
    status.style.color = "red";
  }
});

/* ===== Dynamic Departments / Domains Loader ===== */
(function() {
  async function loadDepartments() {
    const intTrack = document.getElementById('int-track');
    const volRole = document.getElementById('vol-role');
    
    if (!intTrack && !volRole) return;
    
    try {
      const base = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL.replace(/\/api$/, '') : '';
      const response = await fetch(`${base}/api/public/departments`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.departments)) {
        const optionsHTML = data.departments.map(dept => 
          `<option value="${escapeHtml(dept)}">${escapeHtml(dept)}</option>`
        ).join('');
        
        if (intTrack) {
          intTrack.innerHTML = '<option disabled="" selected="" value="">Select a domain</option>' + optionsHTML;
        }
        if (volRole) {
          volRole.innerHTML = '<option disabled="" selected="" value="">Select a role</option>' + optionsHTML;
        }
      }
    } catch (error) {
      console.error('Failed to load dynamic departments:', error);
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDepartments);
  } else {
    loadDepartments();
  }
})();

<<<<<<< HEAD
/* ===== Amaanitvam Gallery Album Loader - merged into main.js =====
   Mirrors admin-created gallery folders on frontend/Website/gallery.html.
   Important: this page intentionally shows ONLY real admin-created albums.
   Unassigned/uncategorized media is NOT shown as a separate public album.
   Do not move this into a separate JS file unless project policy changes.
*/
(function () {
  'use strict';

  const container = document.getElementById('gallery-album-container');
  const isGalleryPage = document.body?.dataset?.page === 'gallery' || /gallery\.html?$/i.test(window.location.pathname);
  if (!container || !isGalleryPage) return;

  let activeApiBase = cleanBase(
    container.dataset.galleryApiBase ||
    window.GALLERY_API_BASE ||
    window.API_BASE_URL ||
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

  function isLocalWebsiteHost() {
    return ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
  }

  function apiBaseCandidates() {
    const candidates = [];

    if (activeApiBase) candidates.push(activeApiBase);

    if (window.location.hostname.includes('github.dev')) {
      candidates.push(window.location.origin.replace(/-\d+\.github\.dev$/, '-5000.github.dev'));
    }

    if (isLocalWebsiteHost()) {
      candidates.push('http://localhost:5000');
      candidates.push('http://127.0.0.1:5000');
    }

    // Production/staging fallback: use same origin only when not running through Live Server.
    if (!['5500', '5501'].includes(window.location.port) && window.location.protocol !== 'file:') {
      candidates.push(window.location.origin);
    }

    return [...new Set(candidates.map(cleanBase).filter(Boolean))];
  }

  function backendBase() {
    const candidates = apiBaseCandidates();
    return cleanBase(activeApiBase || candidates[0] || 'http://localhost:5000');
  }

  async function fetchGalleryJson(path) {
    let lastError = null;

    for (const base of apiBaseCandidates()) {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
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

    throw lastError || new Error('Gallery backend is not reachable. Start backend with npm run dev.');
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

    // Convert Live Server URLs like http://127.0.0.1:5500/api/gallery/media/id back to backend.
    try {
      const parsed = new URL(raw, window.location.origin);
      if (parsed.pathname.startsWith('/api/')) return `${base}${parsed.pathname}${parsed.search}`;
    } catch (_) {
      // Continue with string fallbacks below.
    }

    if (/^(data:|blob:)/i.test(raw)) return raw;
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

  function isImage(media) {
    if (!media) return false;
    if (media.mediaType === 'image') return true;
    if (String(media.contentType || '').startsWith('image/')) return true;
    return !isVideo(media);
  }

  function timestampValue(item) {
    const value = Date.parse(item?.createdAt || item?.uploadedAt || item?.updatedAt || '');
    return Number.isFinite(value) ? value : 0;
  }

  function sortByUploadOrder(mediaItems) {
    return [...(mediaItems || [])].sort((a, b) => {
      const byDate = timestampValue(a) - timestampValue(b);
      if (byDate !== 0) return byDate;
      return String(getId(a)).localeCompare(String(getId(b)));
    });
  }

  function pickFolderCover(folder) {
    return folder?.__coverMedia || folder?.coverMedia || folder?.coverImage || folder?.coverUrl || folder?.thumbnail || folder?.cover || null;
  }

  async function getFolderMedia(folderId) {
    if (folderMediaCache.has(folderId)) return folderMediaCache.get(folderId);

    const data = await fetchGalleryJson(`/api/gallery/folders/${encodeURIComponent(folderId)}/media`);
    const media = Array.isArray(data.images) ? data.images : Array.isArray(data.media) ? data.media : [];
    const ordered = sortByUploadOrder(media);
    folderMediaCache.set(folderId, ordered);
    return ordered;
  }

  async function hydrateFolderCovers() {
    const foldersToCheck = currentFolders.filter((folder) => {
      const id = getId(folder);
      return id && Number(folder.mediaCount || 0) > 0;
    });

    // Resolve every album cover from backend folder media.
    // Future admin-created albums automatically get the first valid uploaded photo as cover.
    const batchSize = 4;
    for (let index = 0; index < foldersToCheck.length; index += batchSize) {
      const batch = foldersToCheck.slice(index, index + batchSize);
      await Promise.all(batch.map(async (folder) => {
        try {
          const existingCover = pickFolderCover(folder);
          const media = await getFolderMedia(getId(folder));
          const photoCandidates = sortByUploadOrder(media).filter(isImage);
          folder.__coverCandidates = photoCandidates;
          folder.__coverMedia = existingCover || photoCandidates[0] || media[0] || null;
        } catch (error) {
          console.warn('Could not resolve gallery album cover:', folder?.name || folder?._id, error);
          folder.__coverMedia = pickFolderCover(folder);
          folder.__coverCandidates = folder.__coverMedia ? [folder.__coverMedia] : [];
        }
      }));
    }
  }

  function placeholderMarkup(extraClass = '') {
    return `<div class="gallery-album-placeholder ${extraClass}" aria-hidden="true">
      <span class="material-symbols-outlined">photo_library</span>
    </div>`;
  }

  function mediaThumb(media, extraClass = '') {
    const url = normalizeMediaUrl(media);
    const title = escapeHtml(media?.title || media?.originalName || media?.filename || media?.name || 'Gallery media');

    if (!url) return placeholderMarkup(extraClass);

    if (isVideo(media)) {
      return `<video class="${extraClass}" src="${escapeHtml(url)}" controls playsinline preload="metadata" aria-label="${title}"></video>`;
    }

    return `<img class="${extraClass}" src="${escapeHtml(url)}" alt="${title}" loading="lazy" decoding="async" />`;
  }

  function albumCoverMarkup(folder) {
    const id = getId(folder);
    const cover = pickFolderCover(folder);
    const url = normalizeMediaUrl(cover);
    const title = escapeHtml(cover?.title || cover?.originalName || folder?.name || 'Gallery album cover');

    if (!url) return placeholderMarkup('gallery-album-cover-media');

    if (isVideo(cover)) {
      return `<video class="gallery-album-cover-media" src="${escapeHtml(url)}" muted playsinline preload="metadata" aria-label="${title}"></video>`;
    }

    return `<img class="gallery-album-cover-media" src="${escapeHtml(url)}" alt="${title}" loading="lazy" decoding="async" data-folder-id="${escapeHtml(id)}" data-cover-index="0" />`;
  }

  function attachCoverFallbacks() {
    container.querySelectorAll('img.gallery-album-cover-media[data-folder-id]').forEach((img) => {
      img.addEventListener('error', () => {
        const folderId = img.dataset.folderId;
        const folder = currentFolders.find((item) => String(getId(item)) === String(folderId));
        const candidates = folder?.__coverCandidates || [];
        let nextIndex = Number(img.dataset.coverIndex || 0) + 1;

        while (nextIndex < candidates.length) {
          const nextUrl = normalizeMediaUrl(candidates[nextIndex]);
          if (nextUrl && nextUrl !== img.src) {
            img.dataset.coverIndex = String(nextIndex);
            img.src = nextUrl;
            img.alt = candidates[nextIndex]?.title || candidates[nextIndex]?.originalName || folder?.name || 'Gallery album cover';
            return;
          }
          nextIndex += 1;
        }

        img.replaceWith(document.createRange().createContextualFragment(placeholderMarkup('gallery-album-cover-media')));
      });
    });
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

  function renderMessage(message, tone = 'info') {
    container.className = 'gallery-album-shell';
    container.innerHTML = `<div class="gallery-state gallery-state-${tone}">${escapeHtml(message)}</div>`;
  }

  function renderAlbums() {
    setIntro('Browse Gallery Albums', 'Open an album to view images and videos grouped by the same folders created in the admin portal.');
    container.className = 'gallery-grid gallery-albums-grid';

    const albums = [...currentFolders];

    if (!albums.length) {
      renderMessage('No gallery albums are available yet. Albums uploaded from the admin portal will appear here automatically.');
      return;
    }

    container.innerHTML = albums.map((folder) => {
      const id = getId(folder);
      const name = folder.name || folder.title || 'Untitled Album';
      const description = folder.description || 'View photos and videos from this album.';

      return `<article class="gallery-album-card gallery-card reveal-card" data-folder-id="${escapeHtml(id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(name)} album">
        <div class="gallery-album-cover">
          ${albumCoverMarkup(folder)}
          <span class="gallery-album-count">${escapeHtml(albumCountLabel(folder.mediaCount))}</span>
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

    attachCoverFallbacks();
  }

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

    try {
      const media = await getFolderMedia(folderId);
      renderAlbumMedia(folder, media);
    } catch (error) {
      renderMessage(error.message || 'Failed to load this album.', 'error');
    }
  }

  function renderAlbumMedia(folder, media) {
    container.className = 'gallery-album-shell';

    const count = albumCountLabel(media.length);
    const grid = media.length
      ? `<div class="gallery-album-media-grid">
          ${media.map((item) => {
            const title = item.title || item.originalName || item.filename || 'Gallery media';
            return `<figure class="gallery-media-card gallery-card reveal-card">
              <div class="gallery-media-frame">${mediaThumb(item, 'gallery-media-file')}</div>
              <figcaption>${escapeHtml(title)}</figcaption>
            </figure>`;
          }).join('')}
        </div>`
      : `<div class="gallery-state">No media has been uploaded in this album yet.</div>`;

    container.innerHTML = `<div class="gallery-album-toolbar">
      <button class="gallery-back-button" type="button" id="galleryBackToAlbums">← Back to Albums</button>
      <div>
        <span class="gallery-album-kicker">${escapeHtml(count)}</span>
        <h3>${escapeHtml(folder.name || 'Gallery Album')}</h3>
      </div>
    </div>
    ${grid}`;

    document.getElementById('galleryBackToAlbums')?.addEventListener('click', renderAlbums);
  }

  async function initAlbumGallery() {
    renderMessage('Loading gallery albums...');

    try {
      const foldersData = await fetchGalleryJson('/api/gallery/folders');

      // Show ONLY albums/folders that exist in admin portal.
      // Do not call /api/gallery?uncategorized=true and do not create a fake Uncategorized album.
      currentFolders = Array.isArray(foldersData.folders) ? foldersData.folders : [];

      await hydrateFolderCovers();
      renderAlbums();
    } catch (error) {
      renderMessage(error.message || 'Failed to load gallery albums.', 'error');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAlbumGallery, { once: true });
  } else {
    initAlbumGallery();
  }
})();
/* ===== End Amaanitvam Gallery Album Loader ===== */
=======
>>>>>>> upstream/main
