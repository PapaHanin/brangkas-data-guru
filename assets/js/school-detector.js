class SchoolManager {
    constructor() {
        this.currentSchool = this.detectSchool();
        this.schoolConfig = null;
        this.init();
    }
    
    detectSchool() {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        // Handle different scenarios
        if (hostname === 'brangkas.id' || hostname === 'www.brangkas.id') {
            return 'demo'; // Default demo school
        }
        
        return subdomain;
    }
    
    async init() {
        await this.loadSchoolConfig();
        this.applyBranding();
        this.setupDataFilters();
    }
    
    async loadSchoolConfig() {
        try {
            const response = await fetch(`config/schools.json`);
            const allSchools = await response.json();
            this.schoolConfig = allSchools[this.currentSchool];
            
            if (!this.schoolConfig) {
                this.redirectToSetup();
            }
        } catch (error) {
            console.error('Failed to load school config:', error);
        }
    }
    
    applyBranding() {
        if (!this.schoolConfig) return;
        
        // Update title and logo
        document.title = `${this.schoolConfig.name} - Data Guru`;
        
        // Update logo
        const logoElements = document.querySelectorAll('.school-logo');
        logoElements.forEach(el => {
            el.src = this.schoolConfig.logo;
            el.alt = this.schoolConfig.name;
        });
        
        // Update school name
        const nameElements = document.querySelectorAll('.school-name');
        nameElements.forEach(el => {
            el.textContent = this.schoolConfig.name;
        });
        
        // Apply color scheme
        this.applyColorScheme();
    }
    
    applyColorScheme() {
        const colors = this.schoolConfig.colors;
        const root = document.documentElement;
        
        root.style.setProperty('--primary-color', colors.primary);
        root.style.setProperty('--secondary-color', colors.secondary);
        
        // Update CSS classes dynamically
        const style = document.createElement('style');
        style.textContent = `
            .bg-primary { background-color: ${colors.primary} !important; }
            .text-primary { color: ${colors.primary} !important; }
            .border-primary { border-color: ${colors.primary} !important; }
            .bg-secondary { background-color: ${colors.secondary} !important; }
        `;
        document.head.appendChild(style);
    }
    
    setupDataFilters() {
        // Filter all data queries to only show current school's data
        this.originalFetch = window.fetch;
        window.fetch = this.wrappedFetch.bind(this);
    }
    
    wrappedFetch(url, options = {}) {
        // Add school filter to all data requests
        if (url.includes('data/') || url.includes('api/')) {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}school_id=${this.currentSchool}`;
        }
        
        return this.originalFetch(url, options);
    }
    
    redirectToSetup() {
        window.location.href = `/setup.html?school=${this.currentSchool}`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.schoolManager = new SchoolManager();
});