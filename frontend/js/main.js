/* =====================================================
   COMPLETE WEBSITE JS + DASHBOARD JS
   Website interactions first, dashboard module logic second.
   ===================================================== */

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

/* =====================================================
   DASHBOARD MODULE LOGIC
   Runs only when dashboard elements exist.
   ===================================================== */

const modules = [
  {
    id: "dashboard-overview",
    label: "Dashboard Overview",
    count: "15 KPIs",
    description: "Total members, interns, volunteers, departments, authorities, applications, projects, and growth statistics.",
    actions: ["Add Member", "Approve Application", "Generate Report"],
    stats: [
      ["Total Members", "1,248", "+12.4% this month"],
      ["Active Interns", "186", "+24 joined"],
      ["Total Volunteers", "724", "+38 active"],
      ["Departments", "12", "4 high growth"],
      ["Authorities", "28", "All verified"],
      ["Pending Applications", "64", "18 urgent"],
      ["Approved Applications", "312", "+42 this month"],
      ["Ongoing Projects", "19", "3 near deadline"],
      ["Completed Projects", "84", "+6 this quarter"],
      ["NGO Growth", "18.6%", "Monthly average"]
    ]
  },
  {
    id: "members",
    label: "Members",
    count: "1.2k",
    description: "Manage members, authorities, interns, volunteers, attendance, and department assignment.",
    actions: ["Add New Member", "Assign Department", "Export Members"],
    stats: [["Active Members", "1,034", "+52"], ["Interns", "186", "92% active"], ["Volunteers", "724", "61 new"], ["Authorities", "28", "Role based"]]
  },
  {
    id: "recruitment",
    label: "Candidate & Recruitment",
    count: "86",
    description: "Track new applications, internship and volunteer candidates, interviews, shortlists, selections, rejections, and joining status.",
    actions: ["Schedule Interview", "Send Offer Letter", "Approve Candidate"],
    stats: [["New Applications", "86", "+15 today"], ["Interviews Today", "12", "4 pending"], ["Shortlisted", "31", "+7"], ["Joining Pending", "18", "Need follow-up"]]
  },
  {
    id: "performance",
    label: "Team Performance",
    count: "94%",
    description: "Review department-wise performance, individual output, attendance summary, assigned tasks, completed tasks, and analytics.",
    actions: ["Review Team", "Assign Score", "View Best Performer"],
    stats: [["Department Score", "94%", "+4%"], ["Completed Tasks", "812", "This month"], ["Attendance", "91%", "Stable"], ["Best Performer", "Aarav", "Education"]]
  },
  {
    id: "tasks",
    label: "Task Management",
    count: "128",
    description: "Organize my tasks, team tasks, assigned work, deadlines, priorities, in-progress items, and recently completed tasks.",
    actions: ["Add Task", "Set Deadline", "Mark Completed"],
    stats: [["My Tasks", "18", "5 due soon"], ["Team Tasks", "128", "36 pending"], ["In Progress", "42", "On track"], ["Completed", "812", "This month"]]
  },
  {
    id: "meetings",
    label: "Meetings & Calendar",
    count: "12",
    description: "See upcoming meetings, today's meetings, events, workshops, NGO activities, interview schedules, and meeting minutes.",
    actions: ["Schedule Meeting", "Add Event", "Upload Minutes"],
    stats: [["Today's Meetings", "5", "2 completed"], ["Upcoming", "12", "This week"], ["Workshops", "4", "Planned"], ["Interviews", "9", "Scheduled"]]
  },
  {
    id: "announcements",
    label: "Announcements",
    count: "24",
    description: "Publish authority announcements, HR updates, important notices, circulars, internal notifications, and emergency alerts.",
    actions: ["Create Announcement", "Post Circular", "Send Alert"],
    stats: [["Authority Posts", "8", "Active"], ["HR Updates", "6", "This month"], ["Notices", "24", "4 pinned"], ["Alerts", "2", "High priority"]]
  },
  {
    id: "donations",
    label: "Donations Overview",
    count: "Rs 8.4L",
    description: "Monitor total, monthly, and yearly donations, recent donors, fundraising progress, top donors, and campaign status.",
    actions: ["Add Donation", "Update Campaign", "Export Donors"],
    stats: [["Total Donations", "Rs 42.8L", "+9.1%"], ["Monthly", "Rs 8.4L", "Target 82%"], ["Top Donors", "16", "Recurring"], ["Campaigns", "7", "3 active"]]
  },
  {
    id: "website",
    label: "Website Overview",
    count: "42",
    description: "Handle contact queries, volunteer and internship forms, partnership requests, donation requests, gallery uploads, and content updates.",
    actions: ["Add Website Content", "Upload Gallery", "Review Query"],
    stats: [["Contact Queries", "42", "8 new"], ["Volunteer Forms", "31", "Pending review"], ["Gallery Uploads", "18", "This week"], ["Content Updates", "12", "Published"]]
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    count: "PDF",
    description: "Analyze member, candidate, volunteer, department, donation, monthly, yearly, and project reports with PDF and Excel downloads.",
    actions: ["Generate Report", "Download PDF", "Download Excel"],
    stats: [["Monthly Reports", "12", "Ready"], ["Yearly Reports", "4", "Archived"], ["Project Reports", "19", "Active"], ["Analytics", "8", "Live dashboards"]]
  },
  {
    id: "certificates",
    label: "Certificates",
    count: "71",
    description: "Issue certificates, manage pending certificates, verification requests, recent generations, and expired or revoked certificates.",
    actions: ["Generate Certificate", "Verify Request", "Revoke Certificate"],
    stats: [["Issued", "416", "+31"], ["Pending", "71", "Needs review"], ["Verification", "9", "Open"], ["Revoked", "3", "This year"]]
  },
  {
    id: "activity",
    label: "Recent Activity Feed",
    count: "Live",
    description: "Audit new members, candidate updates, interview schedules, donations, gallery updates, task completions, certificates, and announcements.",
    actions: ["Filter Feed", "Export Activity", "Open Audit Log"],
    stats: [["Activities Today", "143", "+28"], ["Tasks Completed", "47", "Today"], ["Candidates", "21", "Updated"], ["Donations", "14", "Received"]]
  },
  {
    id: "quick-actions",
    label: "Quick Actions",
    count: "10",
    description: "Jump into common actions like adding tasks, announcements, meetings, interviews, gallery photos, members, certificates, reports, and approvals.",
    actions: ["Add Task", "Schedule Interview", "Generate Certificate"],
    stats: [["Available Actions", "10", "Role based"], ["Most Used", "Add Task", "Today"], ["Approvals", "18", "Pending"], ["Reports", "6", "Queued"]]
  },
  {
    id: "notifications",
    label: "Notifications Panel",
    count: "58",
    description: "Review new applications, donations, deadlines, meeting reminders, interview reminders, certificate requests, website alerts, and system notifications.",
    actions: ["Mark All Read", "Open Deadline", "Review Request"],
    stats: [["New Applications", "18", "Unread"], ["Deadlines", "7", "Soon"], ["Certificate Requests", "9", "Open"], ["System Alerts", "4", "Info"]]
  },
  {
    id: "search",
    label: "Search & Filters",
    count: "Global",
    description: "Use global search, department, role, date, and status filters, then export filtered data for offline review.",
    actions: ["Run Search", "Save Filter", "Export Results"],
    stats: [["Saved Filters", "9", "Shared"], ["Exports", "23", "This month"], ["Departments", "12", "Indexed"], ["Statuses", "6", "Available"]]
  }
];

const activityItems = [
  "New member joined the Education department",
  "Candidate shortlisted for Volunteer Program",
  "Interview scheduled for 3:30 PM",
  "Donation received for Health Camp campaign",
  "Gallery updated with workshop photos",
  "Certificate generated for completed internship"
];

const rows = [
  ["Aarav Sharma", "Education", "Approved", "2026-06-29", "HR Team"],
  ["Meera Iyer", "Health", "Pending", "2026-06-29", "Authority"],
  ["Kabir Khan", "Fundraising", "Selected", "2026-06-28", "Project Lead"],
  ["Nisha Rao", "Operations", "Review", "2026-06-27", "Department Head"],
  ["Dev Patel", "Website", "Completed", "2026-06-26", "Content Team"],
  ["Sana Ali", "Certificates", "Rejected", "2026-06-25", "Verification Desk"]
];

const featureMap = {
  "dashboard-overview": [
    "Total Members", "Active Interns", "Total Volunteers", "Total Departments", "Total Authorities",
    "Pending Applications", "Approved Applications", "Ongoing Projects", "Completed Projects",
    "NGO Growth Statistics", "Monthly Growth Chart"
  ],
  members: [
    "Member Directory", "Active Interns", "Volunteer Directory", "Department Assignment",
    "Authority Management", "Attendance", "Assigned Projects", "Activity History"
  ],
  recruitment: [
    "New Applications", "Internship Applications", "Volunteer Applications", "Interviews Today",
    "Upcoming Interviews", "Interview Results", "Shortlisted Candidates", "Selected Candidates",
    "Rejected Candidates", "Joining Pending", "Offer Letters Sent"
  ],
  performance: [
    "Department-wise Performance", "Individual Performance", "Assigned Tasks", "Completed Tasks",
    "Pending Tasks", "Attendance Summary", "Work Progress", "Best Performer", "Performance Analytics"
  ],
  tasks: [
    "My Tasks", "Team Tasks", "Assigned Tasks", "Pending Tasks", "In Progress Tasks",
    "Completed Tasks", "Deadlines", "Priority-wise Tasks", "Recently Completed Tasks"
  ],
  meetings: [
    "Upcoming Meetings", "Today's Meetings", "Events", "Workshops", "NGO Activities",
    "Interview Schedule", "Calendar View", "Meeting Minutes"
  ],
  announcements: [
    "Authority Announcements", "HR Updates", "Important Notices", "Recent Circulars",
    "Internal Notifications", "Emergency Alerts"
  ],
  donations: [
    "Total Donations", "Monthly Donations", "Yearly Donations", "Recent Donations",
    "Fundraising Progress", "Top Donors", "Campaign Status"
  ],
  website: [
    "Contact Form Queries", "Volunteer Form Submissions", "Internship Form Submissions",
    "Partnership Requests", "Donation Requests", "Recent Gallery Uploads",
    "Website Content Updates", "Announcement Updates"
  ],
  reports: [
    "Member Growth", "Candidate Growth", "Volunteer Growth", "Department Performance",
    "Donation Analytics", "Monthly Reports", "Yearly Reports", "Project Reports",
    "Download Reports PDF", "Download Reports Excel"
  ],
  certificates: [
    "Certificates Issued", "Pending Certificates", "Verification Requests",
    "Recently Generated Certificates", "Expired Certificates", "Revoked Certificates"
  ],
  activity: [
    "New Member Joined", "Candidate Applied", "Candidate Shortlisted", "Interview Scheduled",
    "Donation Received", "Gallery Updated", "Website Updated", "Task Completed",
    "Certificate Generated", "Announcement Posted"
  ],
  "quick-actions": [
    "Add Task", "Create Announcement", "Schedule Meeting", "Schedule Interview",
    "Upload Gallery Photos", "Add New Member", "Generate Certificate", "Generate Report",
    "Approve Candidate", "Add Website Content"
  ],
  notifications: [
    "New Applications", "New Donations", "Upcoming Deadlines", "Meeting Reminders",
    "Interview Reminders", "Certificate Requests", "Website Update Alerts", "System Notifications"
  ],
  search: [
    "Global Search", "Filter by Department", "Filter by Role", "Filter by Date",
    "Filter by Status", "Export Filtered Data"
  ]
};

function $(selector) {
  return document.querySelector(selector);
}

function showToast(message) {
  let toast = $(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function getModule(id) {
  return modules.find((item) => item.id === id) || modules[0];
}

function createStatCard([label, value, trend]) {
  return `<a class="stat-card" href="section.html?view=${moduleIdFromLabel(label)}">
    <small>${label}</small>
    <strong>${value}</strong>
    <span>${trend}</span>
  </a>`;
}

function moduleIdFromLabel(label) {
  const lower = label.toLowerCase();
  if (lower.includes("member") || lower.includes("intern") || lower.includes("volunteer") || lower.includes("authority")) return "members";
  if (lower.includes("application") || lower.includes("candidate") || lower.includes("interview") || lower.includes("joining")) return "recruitment";
  if (lower.includes("task") || lower.includes("deadline")) return "tasks";
  if (lower.includes("project")) return "reports";
  if (lower.includes("donation") || lower.includes("campaign")) return "donations";
  if (lower.includes("certificate")) return "certificates";
  return "dashboard-overview";
}

function drawLineChart(canvas, values, labels, accent = "#5d0f2d") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight || Number(canvas.getAttribute("height")) || 130;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  const pad = 28;
  const max = Math.max(...values) + 12;
  const min = Math.min(...values) - 8;
  const plotWidth = width - pad * 2;
  const plotHeight = height - pad * 2;

  ctx.strokeStyle = "#ead8c7";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = pad + (plotHeight / 3) * i;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  const points = values.map((value, index) => ({
    x: pad + (plotWidth / (values.length - 1)) * index,
    y: pad + plotHeight - ((value - min) / (max - min)) * plotHeight
  }));

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.lineTo(points[points.length - 1].x, height - pad);
  ctx.lineTo(points[0].x, height - pad);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, pad, 0, height - pad);
  gradient.addColorStop(0, "rgba(93, 15, 45, .18)");
  gradient.addColorStop(1, "rgba(216, 161, 95, .03)");
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.fillStyle = "#6b5b55";
  ctx.font = "12px Inter, system-ui";
  labels.forEach((label, index) => {
    const x = pad + (plotWidth / (labels.length - 1)) * index;
    ctx.fillText(label, x - 10, height - 8);
  });

  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#d8a15f";
    ctx.fill();
    ctx.strokeStyle = "#fffaf3";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function renderHome() {
  const statsGrid = $("#statsGrid");
  const moduleGrid = $("#moduleGrid");
  const activityFeed = $("#activityFeed");
  const quickActions = $("#quickActions");
  const miniCalendar = $("#miniCalendar");

  if (!statsGrid) return;

  statsGrid.innerHTML = modules[0].stats.map(createStatCard).join("");
  moduleGrid.innerHTML = modules.map((module) => `<a class="module-card" href="section.html?view=${module.id}">
    <small>${module.count}</small>
    <h3>${module.label}</h3>
    <p>${module.description}</p>
  </a>`).join("");

  activityFeed.innerHTML = activityItems.map((item) => `<li>${item}</li>`).join("");
  quickActions.innerHTML = [
    ["Add Task", "tasks"],
    ["Create Announcement", "announcements"],
    ["Schedule Meeting", "meetings"],
    ["Upload Gallery", "website"],
    ["Generate Certificate", "certificates"],
    ["Generate Report", "reports"]
  ].map(([label, id]) => `<a href="section.html?view=${id}">${label}</a>`).join("");

  miniCalendar.innerHTML = Array.from({ length: 35 }, (_, index) => {
    const day = index + 1;
    const label = day <= 30 ? day : "";
    return `<span class="${day === 29 ? "active-day" : ""}">${label}</span>`;
  }).join("");

  drawLineChart($("#growthChart"), [24, 31, 38, 44, 52, 61, 69, 82, 91, 104, 119, 132], ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function featureStats(module, feature, index) {
  const seed = module.id.length + feature.length + index;
  const labels = {
    performance: ["Performance Score", "Completed Work", "Attendance", "Improvement"],
    recruitment: ["Applications", "Interviews", "Shortlisted", "Conversion"],
    tasks: ["Total Tasks", "Due Soon", "In Progress", "Completion"],
    meetings: ["Scheduled", "Today", "Minutes Filed", "Attendance"],
    donations: ["Total Amount", "This Month", "Donor Count", "Target"],
    website: ["Submissions", "Pending Replies", "Published", "Updates"],
    reports: ["Reports Ready", "Downloads", "Insights", "Exports"],
    certificates: ["Issued", "Pending", "Verified", "Revoked"],
    announcements: ["Published", "Pinned", "Read Rate", "Urgent"],
    notifications: ["Unread", "High Priority", "Resolved", "System"]
  }[module.id] || ["Total Items", "Pending", "Completed", "Growth"];

  return [
    [labels[0], module.id === "donations" ? `Rs ${seed}.4L` : `${seed * 3}`, `${feature} total`],
    [labels[1], `${Math.max(4, seed % 31)}`, "Needs attention"],
    [labels[2], `${Math.max(8, (seed * 2) % 97)}%`, "Current cycle"],
    [labels[3], `+${Math.max(3, seed % 19)}%`, "Monthly change"]
  ];
}

function featureRows(module, feature, index) {
  const departments = ["Education", "Health", "Fundraising", "Operations", "Website", "Certificates"];
  const owners = ["HR Team", "Authority", "Department Head", "Project Lead", "Content Team", "Verification Desk"];
  const statuses = module.id === "recruitment"
    ? ["New", "Shortlisted", "Selected", "Rejected", "Joining", "Offer Sent"]
    : module.id === "tasks"
      ? ["Assigned", "In Progress", "Pending", "Completed", "Review", "Deadline"]
      : module.id === "donations"
        ? ["Received", "Recurring", "Campaign", "Verified", "Pending", "Completed"]
        : ["Approved", "Pending", "Review", "Completed", "Selected", "Alert"];

  return rows.map((row, rowIndex) => [
    `${feature} ${rowIndex + 1}`,
    departments[(rowIndex + index) % departments.length],
    statuses[(rowIndex + index) % statuses.length],
    `2026-06-${String(29 - rowIndex).padStart(2, "0")}`,
    owners[(rowIndex + module.id.length) % owners.length]
  ]);
}

function workspaceButton(action, feature) {
  return `<button type="button" data-work-action="${action}" data-work-feature="${feature}">${action}</button>`;
}

function renderModuleWorkspace(module, feature, index) {
  const workspace = $("#moduleWorkspace");
  if (!workspace) return;

  const templates = {
    "dashboard-overview": `<div class="workspace-grid">
      <article class="workspace-card"><h3>Organization Pulse</h3><p>Members, interns, volunteers, authorities, projects, and applications summarized as one operating snapshot.</p>${workspaceButton("Refresh Overview", feature)}</article>
      <article class="workspace-card"><h3>Growth Lens</h3><div class="donation-meter"><p>Monthly growth target</p><span style="--fill:74%"></span></div>${workspaceButton("Open Growth Chart", feature)}</article>
      <article class="workspace-card"><h3>Approval Dock</h3><p>Pending applications, certificates, and project updates queued for team review.</p>${workspaceButton("Review Pending", feature)}</article>
    </div>`,
    members: `<div class="people-list">
      ${["Aarav Sharma - Education Lead", "Meera Iyer - Health Volunteer", "Kabir Khan - Fundraising Intern", "Nisha Rao - Operations"].map((person) => `<div class="people-row"><span class="avatar">${person[0]}</span><p>${person}</p><span class="status approved">Active</span></div>`).join("")}
      <article class="workspace-card"><h3>Department Assignment Desk</h3><p>Move members between teams, update authority roles, and review attendance in one member-focused workspace.</p>${workspaceButton("Assign Department", feature)}</article>
    </div>`,
    performance: `<div class="workspace-grid">
      <article class="workspace-card"><h3>Department Score Matrix</h3><p>Education 96%, Health 91%, Fundraising 88%. Compare teams without opening the records table.</p>${workspaceButton("Review Score", feature)}</article>
      <article class="workspace-card"><h3>Best Performer Spotlight</h3><div class="people-row"><span class="avatar">A</span><p><strong>Aarav Sharma</strong><br>32 tasks completed, 98% attendance</p><span class="status approved">Top</span></div>${workspaceButton("View Best Performer", feature)}</article>
      <article class="workspace-card"><h3>Work Progress Pulse</h3><div class="donation-meter"><p>Team delivery progress</p><span style="--fill:78%"></span></div>${workspaceButton("Assign Score", feature)}</article>
    </div>`,
    recruitment: `<div class="pipeline">
      ${["Applied", "Screened", "Interview", "Selected", "Joining"].map((step, stepIndex) => `<div class="pipeline-step"><span>${step}</span><b>${[86, 54, 28, 16, 9][stepIndex]}</b>${workspaceButton(`Open ${step}`, feature)}</div>`).join("")}
    </div>`,
    tasks: `<div class="workspace-board">
      ${["Pending", "In Progress", "Review", "Completed"].map((column, colIndex) => `<div class="board-column"><strong>${column}</strong><div class="board-item">${feature} item ${colIndex + 1}</div><div class="board-item">Department follow-up</div>${workspaceButton(`Move ${column}`, feature)}</div>`).join("")}
    </div>`,
    meetings: `<div class="workspace-grid">
      <article class="workspace-card"><h3>Today Agenda</h3><div class="agenda-list"><button type="button" data-work-action="Open 10 AM Meeting" data-work-feature="${feature}">10:00 Team sync</button><button type="button" data-work-action="Open 3 PM Workshop" data-work-feature="${feature}">3:00 Workshop</button></div></article>
      <article class="workspace-card"><h3>Minutes Desk</h3><p>Upload decisions, owners, and next actions from the latest meeting.</p>${workspaceButton("Upload Minutes", feature)}</article>
      <article class="workspace-card"><h3>Interview Calendar</h3><p>9 candidate interviews are attached to this calendar view.</p>${workspaceButton("Schedule Interview", feature)}</article>
    </div>`,
    donations: `<div class="workspace-grid">
      <article class="workspace-card"><h3>Fundraising Meter</h3><div class="donation-meter"><p>Health Camp: Rs 6.8L of Rs 8L</p><span style="--fill:85%"></span></div>${workspaceButton("Update Campaign", feature)}</article>
      <article class="workspace-card"><h3>Top Donors</h3><div class="people-list"><div class="people-row"><span class="avatar">R</span><p>R. Mehta Foundation</p><span>Rs 1.2L</span></div><div class="people-row"><span class="avatar">S</span><p>Seva Trust</p><span>Rs 90k</span></div></div>${workspaceButton("Export Donors", feature)}</article>
      <article class="workspace-card"><h3>Recent Donation</h3><p>12 verified donations are ready for acknowledgement.</p>${workspaceButton("Add Donation", feature)}</article>
    </div>`,
    reports: `<div class="report-shelf">
      ${["Member Growth", "Donation Analytics", "Project Reports", "Yearly Report"].map((name) => `<article class="report-file"><h3>${name}</h3><p>Ready for PDF and Excel export.</p>${workspaceButton(`Download ${name}`, feature)}</article>`).join("")}
    </div>`,
    certificates: `<div class="certificate-strip">
      <article class="workspace-card"><h3>Issue Queue</h3><p>71 certificates need generation or approval.</p>${workspaceButton("Generate Certificate", feature)}</article>
      <article class="workspace-card"><h3>Verification Desk</h3><p>9 public verification requests are open.</p>${workspaceButton("Verify Request", feature)}</article>
      <article class="workspace-card"><h3>Revoked List</h3><p>Expired and revoked certificates are separated for audit.</p>${workspaceButton("Revoke Certificate", feature)}</article>
    </div>`,
    website: `<div class="workspace-grid">
      <article class="workspace-card"><h3>Inbox Wall</h3><p>Contact forms, partnership requests, volunteer forms, and donation requests grouped by source.</p>${workspaceButton("Review Query", feature)}</article>
      <article class="workspace-card"><h3>Gallery Studio</h3><p>Recent gallery uploads and media publishing status.</p>${workspaceButton("Upload Gallery", feature)}</article>
      <article class="workspace-card"><h3>Content Queue</h3><p>Website pages and announcement updates waiting to publish.</p>${workspaceButton("Add Website Content", feature)}</article>
    </div>`,
    announcements: `<div class="workspace-board">
      ${["Draft", "Scheduled", "Published", "Emergency"].map((column) => `<div class="board-column"><strong>${column}</strong><div class="board-item">${feature}</div><div class="board-item">Audience: Team</div>${workspaceButton(`Post ${column}`, feature)}</div>`).join("")}
    </div>`,
    activity: `<div class="people-list">
      ${activityItems.map((item, itemIndex) => `<div class="people-row"><span class="avatar">${itemIndex + 1}</span><p>${item}</p><span class="status">Live</span></div>`).join("")}
    </div>`,
    notifications: `<div class="workspace-grid">
      <article class="workspace-card"><h3>Unread Stack</h3><p>Applications, donations, deadline reminders, and system alerts.</p>${workspaceButton("Mark All Read", feature)}</article>
      <article class="workspace-card"><h3>Deadline Radar</h3><p>7 upcoming deadlines are sorted by urgency.</p>${workspaceButton("Open Deadline", feature)}</article>
      <article class="workspace-card"><h3>Request Queue</h3><p>Certificate and website update requests need review.</p>${workspaceButton("Review Request", feature)}</article>
    </div>`,
    "quick-actions": `<div class="workspace-board">
      ${["Create", "Schedule", "Upload", "Approve"].map((column) => `<div class="board-column"><strong>${column}</strong><div class="board-item">${column} shortcut for ${feature}</div><div class="board-item">One-click team action</div>${workspaceButton(column, feature)}</div>`).join("")}
    </div>`,
    search: `<div class="workspace-grid">
      <article class="workspace-card"><h3>Global Search Console</h3><p>Search members, candidates, tasks, certificates, reports, and website requests from one place.</p>${workspaceButton("Run Search", feature)}</article>
      <article class="workspace-card"><h3>Filter Builder</h3><p>Combine department, role, date, and status filters before exporting.</p>${workspaceButton("Save Filter", feature)}</article>
      <article class="workspace-card"><h3>Export Basket</h3><p>Preview the filtered result count before downloading data.</p>${workspaceButton("Export Results", feature)}</article>
    </div>`
  };

  const fallback = `<div class="workspace-grid">
    <article class="workspace-card"><h3>${feature} Directory</h3><p>Browse, filter, and update records for this exact dashboard tool.</p>${workspaceButton(module.actions[0] || "Open", feature)}</article>
    <article class="workspace-card"><h3>Quick Review</h3><p>See pending, approved, completed, and rejected items at a glance.</p>${workspaceButton(module.actions[1] || "Review", feature)}</article>
    <article class="workspace-card"><h3>Export Center</h3><p>Download filtered data after applying department, role, date, or status filters.</p>${workspaceButton(module.actions[2] || "Export", feature)}</article>
  </div>`;

  workspace.innerHTML = templates[module.id] || fallback;
  workspace.querySelectorAll("[data-work-action]").forEach((button) => {
    button.addEventListener("click", () => runSectionAction(module, button.dataset.workFeature, button.dataset.workAction));
  });
}

function renderFeature(module, feature, index) {
  $("#featureTitle").textContent = feature;
  $("#featureDetail").innerHTML = `<div>
    <h3>${feature}</h3>
    <p>${feature} is active inside ${module.label}. Use this view to review records, update status, check progress, and export filtered data for this exact requirement.</p>
  </div>
  <button class="primary-btn" type="button" id="featureAction">${module.actions[index % module.actions.length] || "Open Action"}</button>`;

  $("#sectionStats").innerHTML = featureStats(module, feature, index).map(createStatCard).join("");
  $("#sectionNotifications").innerHTML = [
    `${feature}: ${Math.max(2, index + 3)} records updated today`,
    `${module.label}: approval queue refreshed`,
    `${feature}: filtered export available`,
    `${module.label}: role permissions applied`
  ].map((item) => `<li><strong>!</strong><span>${item}</span></li>`).join("");

  $("#sectionRows").innerHTML = featureRows(module, feature, index).map((row) => `<tr>
    <td>${row[0]}</td>
    <td>${row[1]}</td>
    <td><span class="status ${row[2].toLowerCase().replace(/\s+/g, "-")}">${row[2]}</span></td>
    <td>${row[3]}</td>
    <td>${row[4]}</td>
  </tr>`).join("");

  $("#chartTitle").textContent = `${feature} Trend`;
  const base = module.id.length * 3 + index * 4;
  drawLineChart($("#sectionChart"), [22 + base, 34 + base, 29 + base, 44 + base, 58 + base, 70 + base, 86 + base], ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], "#6f1235");

  $("#featureAction").onclick = () => runSectionAction(module, feature, $("#featureAction").textContent);
  renderModuleWorkspace(module, feature, index);
  wireSectionSearch();
}

function runSectionAction(module, feature, action) {
  const tbody = $("#sectionRows");
  const noticeList = $("#sectionNotifications");
  const now = new Date().toISOString().slice(0, 10);
  const status = action.toLowerCase().includes("approve") ? "Approved" : action.toLowerCase().includes("schedule") ? "Scheduled" : "Completed";

  tbody.insertAdjacentHTML("afterbegin", `<tr>
    <td>${action}: ${feature}</td>
    <td>${module.label}</td>
    <td><span class="status ${status.toLowerCase()}">${status}</span></td>
    <td>${now}</td>
    <td>Current User</td>
  </tr>`);

  noticeList.insertAdjacentHTML("afterbegin", `<li><strong>!</strong><span>${action} completed for ${feature}</span></li>`);
  showToast(`${action} completed for ${feature}`);
}

function wireSectionSearch() {
  const input = $("#sectionSearch");
  const tbody = $("#sectionRows");
  if (!input || !tbody) return;

  input.oninput = () => {
    const query = input.value.trim().toLowerCase();
    tbody.querySelectorAll("tr").forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  };
}

function renderSection() {
  const title = $("#sectionTitle");
  if (!title) return;

  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "dashboard-overview";
  const module = getModule(view);
  const features = featureMap[module.id] || module.stats.map(([label]) => label);
  const currentSlug = window.location.hash.replace("#", "");
  const activeIndex = Math.max(0, features.findIndex((feature) => slugify(feature) === currentSlug));
  const activeFeature = features[activeIndex];
  const nav = $("#sectionNav");

  document.title = `${module.label} | NGO Dashboard`;
  $("#sectionEyebrow").textContent = "Dashboard Module";
  title.textContent = module.label;
  $("#sectionKicker").textContent = module.count;
  $("#sectionSummaryTitle").textContent = `${module.label} Workspace`;
  $("#sectionDescription").textContent = module.description;
  $("#sectionPrimaryAction").textContent = module.actions[0] || "Add New";
  $("#tableTitle").textContent = `${module.label} Records`;
  $("#featureCount").textContent = `${features.length} tools`;

  nav.innerHTML = modules.map((item) => `<a class="${item.id === module.id ? "active" : ""}" href="section.html?view=${item.id}">
    <span>${item.label}</span><b>${item.count}</b>
  </a>`).join("");

  $("#sectionActions").innerHTML = module.actions.map((action) => `<button type="button">${action}</button>`).join("");
  $("#sectionActions").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => runSectionAction(module, $("#featureTitle").textContent, button.textContent));
  });
  $("#sectionPrimaryAction").onclick = () => runSectionAction(module, $("#featureTitle").textContent, $("#sectionPrimaryAction").textContent);
  $("#featureTabs").innerHTML = features.map((feature, index) => `<button class="${index === activeIndex ? "active" : ""}" type="button" data-feature="${slugify(feature)}">${feature}</button>`).join("");

  $("#featureTabs").querySelectorAll("button").forEach((button, index) => {
    button.addEventListener("click", () => {
      window.location.hash = button.dataset.feature;
      $("#featureTabs").querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderFeature(module, features[index], index);
    });
  });

  if (!window.location.hash) {
    window.location.hash = slugify(activeFeature);
  }

  renderFeature(module, activeFeature, activeIndex);
}

function wireMenu() {
  const menuToggle = $("#menuToggle");
  if (!menuToggle) return;
  menuToggle.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (event.target.closest(".sidebar") || event.target.closest("#menuToggle")) return;
    document.body.classList.remove("nav-open");
  });
}

function wireGlobalControls() {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[type='search']");
      showToast(input?.value ? `Search applied: ${input.value}` : "Search is ready");
    });
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.closest("#sectionActions") || button.closest("#featureDetail") || button.closest("#moduleWorkspace")) return;
    if (button.id === "menuToggle" || button.id === "sectionPrimaryAction") return;
    const label = button.textContent.trim() || "Action";
    showToast(`${label} completed`);
  });
}

window.addEventListener("resize", () => {
  renderHome();
  renderSection();
});

wireMenu();
wireGlobalControls();
renderHome();
renderSection();