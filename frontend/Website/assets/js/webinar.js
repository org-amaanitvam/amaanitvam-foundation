document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById('reg-status');
    const originalText = submitBtn.textContent;

    // 1. Loading State
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    if (statusDiv) {
      statusDiv.textContent = "Sending registration...";
      statusDiv.style.color = "var(--navy)";
    }

    // 2. Gather Data & Convert to JSON
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
      // 3. Dynamic API URL
      const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/learning-hub/register'
        : 'https://amaanitvam-foundation.onrender.com/api/learning-hub/register';

      // 4. Send the Request
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        // 5. Success State
        alert("Registration successful! We look forward to seeing you.");
        if (statusDiv) {
          statusDiv.textContent = "Successfully registered!";
          statusDiv.style.color = "green";
        }
        this.reset();
      } else {
        throw new Error(result.message || "Failed to register.");
      }
    } catch (error) {
      // 6. Error State
      console.error(error);
      alert("Error: " + error.message);
      if (statusDiv) {
        statusDiv.textContent = "Error: " + error.message;
        statusDiv.style.color = "red";
      }
    } finally {
      // Restore the button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});