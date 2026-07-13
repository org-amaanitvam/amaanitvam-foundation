document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. FETCH & POPULATE DEPARTMENTS (NEW)
  // ==========================================
  async function fetchDepartments() {
    // Select the dropdown by name or ID (Update this selector if your HTML is different)
    const roleDropdown = document.querySelector('select[name="role"]') || document.getElementById('role');
    if (!roleDropdown) return;

    try {
      // Dynamic URL for fetching departments (Port 5500 will ask Port 5000)
      const DEPT_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/api/public/departments' // Replace with your exact GET route if different
        : 'https://amaanitvam-foundation.onrender.com/api/public/departments';

      const response = await fetch(DEPT_API_URL);
      const result = await response.json();

      if (response.ok) {
        // Clear existing hardcoded HTML options and set the default placeholder
        roleDropdown.innerHTML = '<option value="" disabled selected>Select a role</option>';
        
        // Extract the array depending on how your backend sends it
        // (Adjust this if your backend wraps it in result.data or result.departments)
        const departments = result.departments || result.data || result; 
        
        if (Array.isArray(departments)) {
          departments.forEach(dept => {
            const option = document.createElement('option');
            // Assuming your department object has a 'departmentName' property
            const deptName = dept.departmentName || dept; 
            option.value = deptName;
            option.textContent = deptName;
            roleDropdown.appendChild(option);
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
  // 2. FORM SUBMISSION LOGIC (YOUR EXACT CODE)
  // ==========================================
  const form = document.getElementById('volunteerForm');
  if (!form) return; //[cite: 5]

  form.addEventListener('submit', async function (e) {
    e.preventDefault(); //[cite: 5]
    
    const status = document.getElementById('vol-status'); //[cite: 5]
    const submitBtn = this.querySelector('button[type="submit"]'); //[cite: 5]
    const originalText = submitBtn ? submitBtn.textContent : 'Submit Application'; //[cite: 5]

    // Loading State
    if (status) {
      status.textContent = "Submitting application..."; //[cite: 5]
      status.style.color = "var(--navy)"; //[cite: 5]
      status.style.display = 'block'; //[cite: 5]
    }

    if (submitBtn) {
      submitBtn.disabled = true; //[cite: 5]
      submitBtn.textContent = "Submitting..."; //[cite: 5]
    }

    // NATIVE FORMDATA - Crucial for catching the PDF file!
    const formData = new FormData(this); //[cite: 5]

    try {
      const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/api/volunteer/apply'  //[cite: 5]
        : 'https://amaanitvam-foundation.onrender.com/api/volunteer/apply'; //[cite: 5]

      const response = await fetch(API_URL, {
        method: 'POST', //[cite: 5]
        body: formData //[cite: 5]
      });

      const result = await response.json(); //[cite: 5]

      if (response.ok) { //[cite: 5]
        // Success State
        alert("Success! Your volunteer application has been submitted successfully. We will review your application and get back to you soon!"); //[cite: 5]
        if (status) {
          status.textContent = result.message || "Application submitted successfully!"; //[cite: 5]
          status.style.color = "green"; //[cite: 5]
        }
        this.reset(); //[cite: 5]
      } else {
        throw new Error(result.message || "Failed to submit application."); //[cite: 5]
      }
    } catch (err) {
      // Error State
      alert("Error: " + err.message); //[cite: 5]
      if (status) {
        status.textContent = err.message || "Failed to connect to the server."; //[cite: 5]
        status.style.color = "red"; //[cite: 5]
      }
    } finally {
      // Restore button
      if (submitBtn) {
        submitBtn.disabled = false; //[cite: 5]
        submitBtn.textContent = originalText; //[cite: 5]
      }
    }
  });
});