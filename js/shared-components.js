/**
 * Shared Components - Common CTA and Footer for all pages
 * Loads settings from API
 */

// Get API base URL
function getApiBaseUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:5001/api';
    }
    return 'https://onetimephotographyweb.pythonanywhere.com/api';
}

// Fetch settings from API
async function fetchSettings() {
    try {
        const response = await fetch(`${getApiBaseUrl()}/settings`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
}

// Render CTA with settings
function renderCTA(settings) {
    const ctaContainer = document.querySelector('.final-cta');
    if (!ctaContainer) return;

    const whatsappNumber = settings?.whatsapp || '919876543210';
    ctaContainer.innerHTML = `
        <div class="container">
            <h2>Let's create something timeless.</h2>
            <p class="cta-subtitle">Your wedding happens once. Let's make sure the memories last forever.</p>
            <div class="cta-buttons">
                <a href="contact.html" class="btn btn-primary">Enquire Now</a>
                <a href="https://wa.me/${whatsappNumber}" class="btn btn-secondary" target="_blank" rel="noopener">WhatsApp Us</a>
            </div>
        </div>
    `;
}

// Render Footer with settings
function renderFooter(settings) {
    const footerContainer = document.querySelector('footer');
    if (!footerContainer) return;

    footerContainer.className = 'footer-redesigned';
    const social = settings?.social || {};

    footerContainer.innerHTML = `
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <img src="images/logo.png" alt="One Time Photography" class="footer-logo">
                    <p class="footer-tagline">Moments happen once. They deserve to be preserved with intention, calm, and timeless elegance.</p>
                </div>
                <div class="footer-col">
                    <h4>Navigate</h4>
                    <nav class="footer-nav">
                        <a href="index.html">Home</a>
                        <a href="about.html">About</a>
                        <a href="portfolio.html">Portfolio</a>
                        <a href="wedding-films.html">Wedding Film</a>
                        <a href="contact.html">Contact Us</a>
                    </nav>
                </div>
                <div class="footer-col">
                    <h4>Connect</h4>
                    <nav class="footer-social">
                        ${social.instagram ? `<a href="${social.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
                        ${social.facebook ? `<a href="${social.facebook}" target="_blank" rel="noopener">Facebook</a>` : ''}
                        ${social.pinterest ? `<a href="${social.pinterest}" target="_blank" rel="noopener">Pinterest</a>` : ''}
                        ${social.youtube ? `<a href="${social.youtube}" target="_blank" rel="noopener">YouTube</a>` : ''}
                    </nav>
                </div>
                <div class="footer-col">
                    <h4>Contact</h4>
                    <div class="footer-contact">
                        <p>${settings?.email || 'hello@onetimephotography.in'}</p>
                        <p>${settings?.phone || '+91 98765 43210'}</p>
                        <p>${settings?.location || 'Mumbai, Maharashtra, India'}</p>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} One Time Photography. All rights reserved.</p>
            </div>
        </div>
    `;
}

// Update WhatsApp button
function updateWhatsAppButton(settings) {
    const btn = document.querySelector('.whatsapp-float');
    if (btn && settings?.whatsapp) {
        btn.href = `https://wa.me/${settings.whatsapp}`;
    }
}

// Main initialization
async function initSharedComponents() {
    const settings = await fetchSettings();
    if (settings) {
        renderCTA(settings);
        renderFooter(settings);
        updateWhatsAppButton(settings);
    }
}

// Load when DOM is ready
document.addEventListener('DOMContentLoaded', initSharedComponents);
