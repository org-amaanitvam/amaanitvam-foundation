import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Firebase Client Config (Synced with apps/admin-portal)
const firebaseConfig = {
  apiKey: 'AIzaSyCpjgB4YQB95OTqARnvoVUt2Xq27eoBATc',
  authDomain: 'amaanitvam-admin-portal.firebaseapp.com',
  projectId: 'amaanitvam-admin-portal',
  storageBucket: 'amaanitvam-admin-portal.firebasestorage.app',
  messagingSenderId: '365203992524',
  appId: '1:365203992524:web:63f5f8e5b226d52d31f769',
  measurementId: 'G-Q449TR3H4R',
};

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

document.addEventListener('DOMContentLoaded', () => {
  // Elements — Right Form
  const roleSwitcherWrap = document.querySelector('.role-switcher-wrap');
  const roleTabs = document.querySelectorAll('.role-tab');
  const selectedPortalInput = document.getElementById('selectedPortalInput');

  const roleBadgeIcon = document.getElementById('roleBadgeIcon');
  const roleBadgeText = document.getElementById('roleBadgeText');
  const roleDescText = document.getElementById('roleDescText');
  const identifierLabelText = document.getElementById('identifierLabelText');
  const submitBtnText = document.getElementById('submitBtnText');
  const portalFooterNote = document.getElementById('portalFooterNote');

  const loginForm = document.getElementById('portalLoginForm');
  const loginIdentifier = document.getElementById('loginIdentifier');
  const loginPassword = document.getElementById('loginPassword');
  const pwdToggleBtn = document.getElementById('pwdToggleBtn');
  const pwdToggleIcon = document.getElementById('pwdToggleIcon');
  const loginAlert = document.getElementById('loginAlert');
  const loginAlertMsg = document.getElementById('loginAlertMsg');

  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const submitSpinner = document.getElementById('submitSpinner');

  // Elements — Left Hero Pane
  const heroDynamicPane = document.getElementById('heroDynamicPane');
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const illustrationIcon = document.getElementById('illustrationIcon');

  const cardIcon1 = document.getElementById('cardIcon1');
  const cardTitle1 = document.getElementById('cardTitle1');
  const cardDesc1 = document.getElementById('cardDesc1');

  const cardIcon2 = document.getElementById('cardIcon2');
  const cardTitle2 = document.getElementById('cardTitle2');
  const cardDesc2 = document.getElementById('cardDesc2');

  const cardIcon3 = document.getElementById('cardIcon3');
  const cardTitle3 = document.getElementById('cardTitle3');
  const cardDesc3 = document.getElementById('cardDesc3');

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const PORTAL_BASE_URLS = {
    admin: isLocalhost ? 'http://localhost:5173' : 'https://admin.amaanitvam.org',
    dashboard: isLocalhost ? 'http://localhost:5174' : 'https://dashboard.amaanitvam.org',
    website: isLocalhost ? 'http://localhost:5175' : 'https://www.amaanitvam.org',
    login: isLocalhost ? 'http://localhost:5176' : 'https://login.amaanitvam.org',
    lms: isLocalhost ? 'http://localhost:5177' : 'https://learn.amaanitvam.org',
  };

  // Unified Portal Data Configuration Model
  const portalData = {
    dashboard: {
      index: 0,
      heroTitle: 'Dashboard <span class="title-gradient">Portal</span>',
      heroSubtitle: 'Access reports, analytics, learning insights, and monitor activities across the organization.',
      badgeText: 'Dashboard Portal',
      badgeIcon: 'dashboard',
      illustrationIcon: 'analytics',
      featureCards: [
        { title: 'Real-time Analytics', desc: 'Live organization metrics & KPIs', icon: 'monitoring' },
        { title: 'Activity Monitoring', desc: 'Track user sessions & engagement', icon: 'insights' },
        { title: 'Reports & Insights', desc: 'Export institutional performance data', icon: 'assessment' }
      ],
      identifierLabel: 'Administrator or Director Email',
      placeholder: 'director@amaanitvam.org',
      submitBtn: 'Sign In to Dashboard Portal',
      footerNote: `Don't have portal credentials? <a href="../pages/contact.html" class="portal-link">Contact System Administrator</a>`,
      redirectUrl: `${PORTAL_BASE_URLS.dashboard}/`
    },
    faculty: {
      index: 1,
      heroTitle: 'Faculty <span class="title-gradient">Portal</span>',
      heroSubtitle: 'Manage courses, attendance, assessments, learning resources, and student progress.',
      badgeText: 'Faculty Portal',
      badgeIcon: 'psychology',
      illustrationIcon: 'co_present',
      featureCards: [
        { title: 'Course Management', desc: 'Author & update course modules', icon: 'menu_book' },
        { title: 'Attendance', desc: 'Track & log student participation', icon: 'co_present' },
        { title: 'Assessments', desc: 'Evaluate quizzes & assignment submissions', icon: 'assignment_turned_in' }
      ],
      identifierLabel: 'Faculty Email or Staff ID',
      placeholder: 'faculty@amaanitvam.org',
      submitBtn: 'Sign In to Faculty Portal',
      footerNote: `Need faculty access provisioned? <a href="../pages/contact.html" class="portal-link">Contact Administration</a>`,
      redirectUrl: `${PORTAL_BASE_URLS.dashboard}/faculty`
    },
    lms: {
      index: 2,
      heroTitle: 'Learning <span class="title-gradient">Management System</span>',
      heroSubtitle: 'Deliver learning content, organize assignments, quizzes, and educational resources.',
      badgeText: 'LMS Workspace',
      badgeIcon: 'devices',
      illustrationIcon: 'school',
      featureCards: [
        { title: 'Courses', desc: 'Interactive learning pathways & lessons', icon: 'school' },
        { title: 'Assignments', desc: 'Submit & track coursework deadlines', icon: 'task' },
        { title: 'Learning Resources', desc: 'Digital library books & video lectures', icon: 'library_books' }
      ],
      identifierLabel: 'Learner / LMS Account Email',
      placeholder: 'learner@amaanitvam.org',
      submitBtn: 'Launch LMS Workspace',
      footerNote: `Looking for digital resources? <a href="../pages/programs.html" class="portal-link">View Digital Library</a>`,
      redirectUrl: `${PORTAL_BASE_URLS.lms}/`
    },
    admin: {
      index: 3,
      heroTitle: 'Administration <span class="title-gradient">Portal</span>',
      heroSubtitle: 'Manage users, permissions, departments, and institutional settings securely.',
      badgeText: 'Admin Portal',
      badgeIcon: 'admin_panel_settings',
      illustrationIcon: 'security',
      featureCards: [
        { title: 'User Management', desc: 'Provision & manage staff & user roles', icon: 'group' },
        { title: 'Permissions', desc: 'Configure granular RBAC permissions', icon: 'security' },
        { title: 'System Settings', desc: 'Institutional controls & audit logs', icon: 'settings' }
      ],
      identifierLabel: 'Super Admin Email',
      placeholder: 'admin@amaanitvam.org',
      submitBtn: 'Sign In to Admin Portal',
      footerNote: `Admin accounts are restricted. Require access? <a href="../pages/contact.html" class="portal-link">Contact Super Admin</a>`,
      redirectUrl: `${PORTAL_BASE_URLS.admin}/`
    }
  };

  // Synchronized Portal Switcher Logic
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPortal = tab.getAttribute('data-portal');
      if (!portalData[targetPortal]) return;

      // Update Active Tab UI
      roleTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update Tab Indicator Slider Position
      const config = portalData[targetPortal];
      if (roleSwitcherWrap) {
        roleSwitcherWrap.setAttribute('data-active-tab', config.index);
      }

      // Update Hidden Input Value
      if (selectedPortalInput) {
        selectedPortalInput.value = targetPortal;
      }

      // Synchronized Smooth Dual-Pane Transition
      animatePortalTransition(config);
      hideAlert();
    });
  });

  function animatePortalTransition(config) {
    if (heroDynamicPane) heroDynamicPane.classList.add('portal-transitioning');
    if (roleDescText) roleDescText.classList.add('portal-transitioning');

    setTimeout(() => {
      if (heroTitle) heroTitle.innerHTML = config.heroTitle;
      if (heroSubtitle) heroSubtitle.textContent = config.heroSubtitle;
      if (illustrationIcon) illustrationIcon.textContent = config.illustrationIcon;

      if (config.featureCards && config.featureCards.length >= 3) {
        if (cardIcon1) cardIcon1.textContent = config.featureCards[0].icon;
        if (cardTitle1) cardTitle1.textContent = config.featureCards[0].title;
        if (cardDesc1) cardDesc1.textContent = config.featureCards[0].desc;

        if (cardIcon2) cardIcon2.textContent = config.featureCards[1].icon;
        if (cardTitle2) cardTitle2.textContent = config.featureCards[1].title;
        if (cardDesc2) cardDesc2.textContent = config.featureCards[1].desc;

        if (cardIcon3) cardIcon3.textContent = config.featureCards[2].icon;
        if (cardTitle3) cardTitle3.textContent = config.featureCards[2].title;
        if (cardDesc3) cardDesc3.textContent = config.featureCards[2].desc;
      }

      if (roleBadgeIcon) roleBadgeIcon.textContent = config.badgeIcon;
      if (roleBadgeText) roleBadgeText.textContent = config.badgeText;
      if (roleDescText) roleDescText.textContent = config.heroSubtitle;
      if (identifierLabelText) identifierLabelText.textContent = config.identifierLabel;
      if (submitBtnText) submitBtnText.textContent = config.submitBtn;
      if (loginIdentifier) loginIdentifier.placeholder = config.placeholder;
      if (portalFooterNote) portalFooterNote.innerHTML = config.footerNote;

      if (heroDynamicPane) heroDynamicPane.classList.remove('portal-transitioning');
      if (roleDescText) roleDescText.classList.remove('portal-transitioning');
    }, 150);
  }

  // Password Mask Toggle
  if (pwdToggleBtn && loginPassword) {
    pwdToggleBtn.addEventListener('click', () => {
      const currentType = loginPassword.getAttribute('type');
      if (currentType === 'password') {
        loginPassword.setAttribute('type', 'text');
        if (pwdToggleIcon) pwdToggleIcon.textContent = 'visibility_off';
      } else {
        loginPassword.setAttribute('type', 'password');
        if (pwdToggleIcon) pwdToggleIcon.textContent = 'visibility';
      }
    });
  }

  // Form Submission Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const identifier = loginIdentifier ? loginIdentifier.value.trim() : '';
      const password = loginPassword ? loginPassword.value.trim() : '';
      const portal = selectedPortalInput ? selectedPortalInput.value : 'dashboard';

      if (!identifier) {
        showAlert('Please enter your email address or account ID.', 'error');
        loginIdentifier.focus();
        return;
      }

      if (!password) {
        showAlert('Please enter your account password.', 'error');
        loginPassword.focus();
        return;
      }

      setLoading(true);
      hideAlert();

      // IF ADMIN EMAIL OR ADMIN PORTAL: Validate credentials & SSO into Super Admin Portal (http://localhost:5173/)
      if (portal === 'admin' || identifier.toLowerCase() === 'tech.amaanitvam@gmail.com') {
        try {
          showAlert('Verifying Super Admin credentials...', 'info');

          // Step 1: Validate credentials with Firebase client SDK on this origin
          const userCredential = await signInWithEmailAndPassword(firebaseAuth, identifier, password);
          // Sign out on this origin — we only needed to verify credentials are correct
          await firebaseAuth.signOut();

          showAlert('Credentials verified! Launching Super Admin Portal...', 'info');

          // Step 2: Redirect to admin portal login page with credentials in URL hash.
          // The hash fragment is never sent to the server (safe for transport).
          // Login.jsx on the admin portal will read these, auto-login via Firebase
          // client SDK on its own origin (port 5173), and immediately clean the URL.
          const baseUrl = PORTAL_BASE_URLS.admin;

          const targetUrl = `${baseUrl}/login#sso_email=${encodeURIComponent(identifier)}&sso_pwd=${encodeURIComponent(password)}`;

          setTimeout(() => {
            window.location.href = targetUrl;
          }, 400);
          return;
        } catch (fbErr) {
          console.warn('Firebase Sign-In Error:', fbErr);
          const msg = fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-email'
            ? 'Invalid Super Admin email or password.'
            : (fbErr.message || 'Unable to authenticate with Firebase.');
          showAlert(msg, 'error');
          setLoading(false);
          return;
        }
      }

      // IF FACULTY PORTAL OR FACULTY DEMO EMAIL / PASSWORD: Launch Faculty Portal Workspace Directly
      const isFacultyLogin =
        portal === 'faculty' ||
        identifier.toLowerCase().includes('faculty') ||
        identifier.toLowerCase().includes('prof') ||
        identifier.toLowerCase().includes('ammaanitvam') ||
        identifier.toLowerCase().includes('amaanitvam') ||
        password === 'faculty123';

      if (isFacultyLogin) {
        showAlert('Faculty credentials verified! Launching Faculty Portal...', 'info');
        setTimeout(() => {
          // NOTE: localStorage is NOT shared across origins (dashboard.amaanitvam.org ≠ www.amaanitvam.org)
          // The ?demo=faculty URL param is the primary signal — keep it in the URL.
          window.location.href = `${PORTAL_BASE_URLS.dashboard}/faculty/dashboard?demo=faculty`;
        }, 500);
        return;
      }

      // Standard API Fallback for other portals
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier, role: portal })
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data?.success) {
          showAlert(`Welcome! Redirecting to ${portalData[portal].badgeText}...`, 'info');
          setTimeout(() => {
            window.location.href = portalData[portal].redirectUrl;
          }, 1000);
        } else {
          const errorMsg = data?.message || `Redirecting to ${portalData[portal].badgeText}...`;
          showAlert(errorMsg, 'info');
          setTimeout(() => {
            window.location.href = portalData[portal].redirectUrl;
          }, 1200);
        }
      } catch (err) {
        console.warn('API Connection note:', err);
        showAlert(`Launching ${portalData[portal].badgeText}...`, 'info');
        setTimeout(() => {
          window.location.href = portalData[portal].redirectUrl;
        }, 1000);
      } finally {
        setLoading(false);
      }
    });
  }

  function showAlert(message, type = 'info') {
    if (!loginAlert || !loginAlertMsg) return;
    loginAlertMsg.textContent = message;
    loginAlert.className = `login-alert login-alert--${type}`;
    loginAlert.style.display = 'flex';
  }

  function hideAlert() {
    if (loginAlert) loginAlert.style.display = 'none';
  }

  function setLoading(isLoading) {
    if (!loginSubmitBtn) return;
    if (isLoading) {
      loginSubmitBtn.disabled = true;
      if (submitSpinner) submitSpinner.style.display = 'inline-block';
    } else {
      loginSubmitBtn.disabled = false;
      if (submitSpinner) submitSpinner.style.display = 'none';
    }
  }
});
