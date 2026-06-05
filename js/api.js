/**
 * One Time Photography - API Service
 * Handles all API calls to the Python backend
 */

const API = {
    // Auto-detect environment and set API URL
    baseURL: (function() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://127.0.0.1:5001/api';
        }
        // Production - PythonAnywhere
        return 'https://onetimephotographyweb.pythonanywhere.com/api';
    })(),

    cachePrefix: 'otp_cache_v1_',
    cacheTTL: 24 * 60 * 60 * 1000,

    _readCache(endpoint) {
        try {
            const raw = localStorage.getItem(this.cachePrefix + endpoint);
            if (!raw) return null;
            const entry = JSON.parse(raw);
            if (Date.now() - entry.ts > this.cacheTTL) return null;
            return entry.data;
        } catch (e) { return null; }
    },

    _writeCache(endpoint, data) {
        try {
            localStorage.setItem(this.cachePrefix + endpoint, JSON.stringify({ data, ts: Date.now() }));
        } catch (e) {}
    },

    async _rawFetch(endpoint, options = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    },

    /**
     * Generic fetch wrapper with error handling + stale-while-revalidate cache for GETs.
     */
    async fetch(endpoint, options = {}) {
        const method = (options.method || 'GET').toUpperCase();

        if (method !== 'GET') {
            try { return await this._rawFetch(endpoint, options); }
            catch (error) {
                console.error(`API fetch error for ${endpoint}:`, error);
                return null;
            }
        }

        const cached = this._readCache(endpoint);
        const refresh = this._rawFetch(endpoint)
            .then(data => { this._writeCache(endpoint, data); return data; })
            .catch(error => {
                console.error(`API fetch error for ${endpoint}:`, error);
                return null;
            });

        if (cached !== null) {
            refresh.catch(() => {});
            return cached;
        }
        return await refresh;
    },

    /**
     * Get site settings (branding, contact info, social links)
     */
    async getSettings() {
        return await this.fetch('/settings');
    },

    /**
     * Get homepage content
     */
    async getHomepage() {
        return await this.fetch('/homepage');
    },

    /**
     * Get about page content
     */
    async getAbout() {
        return await this.fetch('/about');
    },

    /**
     * Get all stories
     */
    async getStories() {
        return await this.fetch('/stories');
    },

    /**
     * Get single story by ID or slug
     */
    async getStory(id) {
        return await this.fetch(`/stories/${id}`);
    },

    /**
     * Get featured stories for homepage
     */
    async getFeaturedStories() {
        return await this.fetch('/stories/featured');
    },

    /**
     * Get moments/portfolio images
     */
    async getMoments() {
        return await this.fetch('/moments');
    },

    /**
     * Get packages information
     */
    async getPackages() {
        return await this.fetch('/packages');
    },

    /**
     * Get FAQs
     */
    async getFAQs() {
        return await this.fetch('/faqs');
    },

    /**
     * Get testimonials
     */
    async getTestimonials() {
        return await this.fetch('/testimonials');
    },

    /**
     * Get contact page content
     */
    async getContact() {
        return await this.fetch('/contact');
    },

    /**
     * Get page headers (background images for inner pages)
     */
    async getPageHeaders() {
        return await this.fetch('/page-headers');
    },

    /**
     * Submit contact form
     */
    async submitContactForm(formData) {
        return await this.fetch('/contact/submit', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }
};

// Export for use in other modules
window.API = API;
