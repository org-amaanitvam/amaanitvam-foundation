document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. FETCH & POPULATE DEPARTMENTS/TRACKS
  // ==========================================
  async function fetchDepartments() {
    // Select the dropdown by name or ID for the internship track
    const trackDropdown = document.querySelector('select[name="track"]') || document.getElementById('track');
    if (!trackDropdown) return;

    try {
      // Dynamic URL for fetching departments (Port 5500 will ask Port 5000)
      const DEPT_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/api/public/departments' 
        : 'https://amaanitvam-foundation.onrender.com/api/public/departments';

      const response = await fetch(DEPT_API_URL);
      const result = await response.json();

      if (response.ok) {
        // Clear existing hardcoded HTML options and set the default placeholder
        trackDropdown.innerHTML = '<option value="" disabled selected>Select a domain/track</option>';
        
        const departments = result.departments || result.data || result; 
        
        if (Array.isArray(departments)) {
          departments.forEach(dept => {
            const option = document.createElement('option');
            const deptName = dept.departmentName || dept; 
            option.value = deptName;
            option.textContent = deptName;
            trackDropdown.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  }

  // Trigger the fetch immediately when the page loads
  fetchDepartments();


  // ==========================================
  // 2. FORM SUBMISSION LOGIC
  // ==========================================
  const form = document.getElementById('internshipForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('int-submit-btn');
    const btnText = btn?.querySelector('.submit-btn-text');
    const btnSpinner = btn?.querySelector('.submit-btn-spinner');
    const btnSuccess = btn?.querySelector('.submit-btn-success');
    const status = document.getElementById('int-status');

    // Reset UI States
    if (btn) btn.classList.remove('is-success', 'is-error');
    if (status) {
      status.textContent = '';
      status.className = '';
      status.style.display = 'none';
    }

    // Set Loading State
    if (btn) btn.classList.add('is-loading');
    if (btnText) btnText.style.display = 'none';
    if (btnSpinner) btnSpinner.style.display = 'inline-flex';
    if (btnSuccess) btnSuccess.style.display = 'none';
    
    if (status) {
      status.textContent = "Submitting application...";
      status.style.color = "var(--navy)";
      status.style.display = 'block';
    }

    // NATIVE FORMDATA 
    const formData = new FormData(this);

    try {
      const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/api/internship/apply' 
        : 'https://amaanitvam-foundation.onrender.com/api/internship/apply';

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData 
      });

      const result = await response.json();

      if (response.ok) {
        // Success State
        if (btnSpinner) btnSpinner.style.display = 'none';
        if (btnSuccess) btnSuccess.style.display = 'inline-flex';
        if (btn) {
          btn.classList.remove('is-loading');
          btn.classList.add('is-success');
        }
        if (status) {
          status.textContent = result.message || "Application submitted successfully!";
          status.style.color = "#22c55e";
        }
        
        alert("Success! Your internship application has been submitted.");
        this.reset();
        
        setTimeout(() => {
          if (btnSuccess) btnSuccess.style.display = 'none';
          if (btnText) btnText.style.display = 'inline';
          if (btn) btn.classList.remove('is-success');
        }, 3000);

      } else {
        throw new Error(result.message || "Submission failed.");
      }
    } catch (err) {
      // Error State
      if (btnSpinner) btnSpinner.style.display = 'none';
      if (btnText) btnText.style.display = 'inline';
      if (btn) {
        btn.classList.remove('is-loading');
        btn.classList.add('is-error');
      }
      if (status) {
        status.textContent = "Error: " + err.message;
        status.style.color = "red";
      }
      alert("Error: " + err.message);
      setTimeout(() => btn?.classList.remove('is-error'), 600);
    }
  });
});