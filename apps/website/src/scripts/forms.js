import { API_BASE_URL } from './api-client.js';

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function initFaq() {
    document.querySelectorAll('.faq-question').forEach((button) => {
        if (button.dataset.faqBound === 'true') return;
        button.dataset.faqBound = 'true';

        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            if (!item) return;
            const expanded = item.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(expanded));
        });
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

          <p><strong>Name:</strong> ${escapeHtml(cert.issuedTo)}</p>
          <p><strong>Certificate ID:</strong> ${escapeHtml(cert.certificateId)}</p>
          <p><strong>Type:</strong> ${escapeHtml(cert.type)}</p>
          <p><strong>Domain:</strong> ${escapeHtml(cert.domain)}</p>
          <p><strong>Issued By:</strong> ${escapeHtml(cert.issuedBy)}</p>
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
          <p>${escapeHtml(err.message)}</p>
        </div>
      </div>
    `;
        }
    });
}

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
            const cleanButton = payButton.cloneNode(true);
            payButton.parentNode.replaceChild(cleanButton, payButton);
            cleanButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                payNow(cleanButton);
            }, true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();


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


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq, { once: true });
} else {
    initFaq();
}
