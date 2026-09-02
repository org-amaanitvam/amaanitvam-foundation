const LOCAL_API_BASE = 'http://localhost:5000/api';
const PRODUCTION_API_BASE =
  'https://amaanitvam-foundation.onrender.com/api';

const API_BASE_URL =
  ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
    window.location.protocol === 'file:'
    ? LOCAL_API_BASE
    : PRODUCTION_API_BASE;

const FORM_CONFIG = {
  volunteerForm: {
    endpoint: '/volunteers/apply',
    statusId: 'vol-status',
    pending: 'Submitting your volunteer application...',
    success:
      'Thank you for applying to volunteer with Amaanitvam Foundation. Your application has been received successfully and will be reviewed by our team.',
    multipart: true,
    validate(form) {
      const role = form.elements.namedItem('role')?.value?.trim();
      const availability =
        form.elements.namedItem('availability')?.value?.trim();
      const motivation =
        form.elements.namedItem('motivation')?.value?.trim();

      if (!role) {
        return 'Please select your preferred volunteer role.';
      }

      if (!availability) {
        return 'Please provide your availability.';
      }

      if (!motivation || motivation.length < 10) {
        return 'Please provide a motivation statement of at least 10 characters.';
      }

      return null;
    },
  },
  internshipForm: {
    endpoint: '/internships/apply',
    statusId: 'int-status',
    pending: 'Submitting your internship application...',
    success:
      'Thank you for applying for an internship with Amaanitvam Foundation. Your application has been received successfully and will be reviewed by our team.',
    multipart: true,
    validate(form) {
      const track =
        form.elements.namedItem('track')?.value?.trim();
      const motivation =
        form.elements.namedItem('motivation')?.value?.trim();

      if (!track) {
        return 'Please select an internship domain.';
      }

      if (!motivation || motivation.length < 10) {
        return 'Please provide a motivation statement of at least 10 characters.';
      }

      return null;
    },
  },
    contactForm: {
    endpoint: '/contact',
    statusId: 'contact-status',
    pending: 'Sending your message...',
    success:
      'Thank you for contacting Amaanitvam Foundation. Your message has been delivered successfully, and our team will respond as soon as possible.',
    multipart: false,
    validate(form) {
      const name = form.elements.namedItem('name')?.value?.trim();
      const email = form.elements.namedItem('email')?.value?.trim();
      const subject = form.elements.namedItem('subject')?.value?.trim();
      const message = form.elements.namedItem('message')?.value?.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || name.length < 2) {
        return 'Please enter your full name.';
      }
      if (!email || !emailPattern.test(email)) {
        return 'Please enter a valid email address.';
      }
      if (!subject || subject.length < 3) {
        return 'Please provide a brief subject.';
      }
      if (!message || message.length < 10) {
        return 'Please provide a message of at least 10 characters.';
      }
      return null;
    },
  },
  registrationForm: {
    endpoint: '/learning-hub/register',
    statusId: 'reg-status',
    pending: 'Completing your registration...',
    success:
      'Your webinar or competition registration has been completed successfully. Event details will be shared with you through the contact information provided.',
    multipart: false,
  },
};

const professionalMessage = (value, fallback) => {
  if (
    typeof value === 'string' &&
    value.trim() &&
    !['Created successfully', 'Success'].includes(value.trim())
  ) {
    return value.trim();
  }

  return fallback;
};

const setStatus = (element, message, type = 'info') => {
  if (!element) return;

  const symbol =
    type === 'success'
      ? '✓'
      : type === 'error'
        ? '!'
        : '…';

  element.hidden = false;
  element.style.display = 'block';
  element.textContent = `${symbol} ${message}`;
  element.setAttribute(
    'role',
    type === 'error' ? 'alert' : 'status',
  );
  element.style.marginTop = '14px';
  element.style.padding = '12px 14px';
  element.style.borderRadius = '10px';
  element.style.fontWeight = '600';
  element.style.fontSize = '0.92rem';
  element.style.lineHeight = '1.5';
  element.style.textAlign = 'left';

  if (type === 'success') {
    element.style.color = '#12633f';
    element.style.background = '#ecfdf3';
    element.style.border = '1px solid #abefc6';
  } else if (type === 'error') {
    element.style.color = '#912018';
    element.style.background = '#fef3f2';
    element.style.border = '1px solid #fecdca';
  } else {
    element.style.color = '#5d0f2d';
    element.style.background = '#fff7ed';
    element.style.border = '1px solid #fed7aa';
  }
};

const readResponse = async (response) => {
  const contentType =
    response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  return {
    message: await response.text(),
  };
};

const validateResume = (form) => {
  const input = form.querySelector(
    'input[type="file"][name="resume"]',
  );

  if (!input) return null;

  const file = input.files?.[0];

  if (!file) {
    return 'Please attach your resume before submitting.';
  }

  const extension =
    file.name.split('.').pop()?.toLowerCase();

  if (!['pdf', 'doc', 'docx'].includes(extension)) {
    return 'Your resume must be a PDF, DOC or DOCX file.';
  }

  if (file.size > 5 * 1024 * 1024) {
    return 'Your resume must be smaller than 5 MB.';
  }

  return null;
};

const nextPaint = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

const submitPublicForm = async (form, config) => {
  if (form.dataset.submitting === 'true') return;

  const statusElement =
    document.getElementById(config.statusId);
  const submitButton = form.querySelector(
    'button[type="submit"], input[type="submit"]',
  );

  if (!form.reportValidity()) {
    setStatus(
      statusElement,
      'Please complete all required fields correctly.',
      'error',
    );
    return;
  }

  await nextPaint();

  const customError = config.validate?.(form);
  const resumeError = config.multipart
    ? validateResume(form)
    : null;

  if (customError || resumeError) {
    setStatus(
      statusElement,
      customError || resumeError,
      'error',
    );
    return;
  }

  const originalButtonHtml =
    submitButton?.tagName === 'INPUT'
      ? submitButton.value
      : submitButton?.innerHTML;

  form.dataset.submitting = 'true';

  if (submitButton) {
    submitButton.disabled = true;

    if (submitButton.tagName === 'INPUT') {
      submitButton.value = 'Submitting...';
    } else {
      submitButton.textContent = 'Submitting...';
    }
  }

  setStatus(statusElement, config.pending, 'info');

  try {
    const formData = new FormData(form);
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    };

    if (config.multipart) {
      options.body = formData;
    } else {
      options.headers['Content-Type'] =
        'application/json';
      options.body = JSON.stringify(
        Object.fromEntries(formData.entries()),
      );
    }

    const response = await fetch(
      `${API_BASE_URL}${config.endpoint}`,
      options,
    );

    const result = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        professionalMessage(
          result?.message,
          'The form could not be submitted. Please review your information and try again.',
        ),
      );
    }

    setStatus(
      statusElement,
      professionalMessage(
        result?.message,
        config.success,
      ),
      'success',
    );

    form.reset();

    statusElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  } catch (error) {
    console.error(
      '[public-form] submission failed:',
      error,
    );

    setStatus(
      statusElement,
      error?.message ||
      'The form could not be submitted. Please try again.',
      'error',
    );
  } finally {
    form.dataset.submitting = 'false';

    if (submitButton) {
      submitButton.disabled = false;

      if (submitButton.tagName === 'INPUT') {
        submitButton.value =
          originalButtonHtml || 'Submit';
      } else {
        submitButton.innerHTML =
          originalButtonHtml || 'Submit';
      }
    }
  }
};

document.addEventListener(
  'submit',
  (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) return;

    const config = FORM_CONFIG[form.id];
    if (!config) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    submitPublicForm(form, config);
  },
  true,
);

const clearAccidentalQueryString = () => {
  const path = window.location.pathname.toLowerCase();

  if (
    (
      path.endsWith('/volunteer.html') ||
      path.endsWith('/internship.html') ||
      path.endsWith('/webinars-competitions.html')
    ) &&
    window.location.search
  ) {
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}${window.location.hash}`,
    );
  }
};

clearAccidentalQueryString();
window.addEventListener(
  'pageshow',
  clearAccidentalQueryString,
);
