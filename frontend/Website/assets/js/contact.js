console.log("Contact JS file is loaded and ready!");

document.addEventListener('DOMContentLoaded', () => {
  // Make sure your form tag in contact.html has id="contactForm"
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById('contact-status'); // Create this div if you don't have it
    const originalText = submitBtn.textContent;

    // 1. Loading State
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    if (statusDiv) {
      statusDiv.textContent = "Sending your message...";
      statusDiv.style.color = "var(--navy)";
    }

    // 2. Gather Data & Convert to JSON
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
      // 3. Dynamic API URL (Matches your server.js setup)
      const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/contact' // Adjust if your route adds '/submit'
        : 'https://amaanitvam-foundation.onrender.com/api/contact';

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
        alert("Message sent successfully! We will get back to you soon.");
        if (statusDiv) {
          statusDiv.textContent = "Message sent successfully!";
          statusDiv.style.color = "green";
        }
        this.reset();
      } else {
        throw new Error(result.message || "Failed to send message.");
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