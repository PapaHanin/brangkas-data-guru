/**
 * Multi-Tenant School Detector
 * Deteksi sekolah berdasarkan subdomain dan load branding otomatis
 */
class SchoolManager {
    constructor() {
        this.currentSchool = this.detectSchool();
        this.schoolConfig = null;
        this.defaultConfig = {
            name: "Demo School",
            logo: "assets/images/logo.png",
            colors: {
                primary: "#3b82f6",
                secondary: "#10b981"
            }
        };
        this.init();
    }
    
    /**
     * Deteksi sekolah dari subdomain
     */
    detectSchool() {
        const hostname = window.location.hostname;
        
        // Jika localhost atau domain utama, gunakan demo
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.includes('github.io') ||
            hostname === 'yourdomain.com' ||
            hostname === 'www.yourdomain.com') {
            return 'demo';
        }
        
        // Ambil subdomain (contoh: sdn1.yourdomain.com → sdn1)
        const parts = hostname.split('.');
        if (parts.length >= 3) {
            return parts[0]; // subdomain
        }
        
        return 'demo';
    }
    
    /**
     * Inisialisasi sistem
     */
    async init() {
        console.log(`🏫 Detected school: ${this.currentSchool}`);
        
        try {
            await this.loadSchoolConfig();
            this.applyBranding();
            this.setupDataFilters();
            this.showSuccessMessage();
        } catch (error) {
            console.warn('School config not found, using default');
            this.schoolConfig = this.defaultConfig;
            this.applyBranding();
        }
    }
    
    /**
     * Load konfigurasi sekolah
     */
    async loadSchoolConfig() {
        try {
            const response = await fetch(`config/schools/${this.currentSchool}.json`);
            if (response.ok) {
                this.schoolConfig = await response.json();
            } else {
                throw new Error('School config not found');
            }
        } catch (error) {
            // Jika file tidak ada, redirect ke setup
            if (this.currentSchool !== 'demo') {
                this.redirectToSetup();
            }
            throw error;
        }
    }
    
    /**
     * Terapkan branding sekolah
     */
    applyBranding() {
        if (!this.schoolConfig) return;
        
        // Update title halaman
        document.title = `${this.schoolConfig.name} - Brangkas Data Guru`;
        
        // Update logo sekolah
        this.updateLogos();
        
        // Update nama sekolah
        this.updateSchoolNames();
        
        // Terapkan skema warna
        this.applyColorScheme();
        
        // Update kontak info
        this.updateContactInfo();
    }
    
    /**
     * Update semua logo
     */
    updateLogos() {
        const logoElements = document.querySelectorAll('.school-logo, #schoolLogo, .logo');
        logoElements.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = this.schoolConfig.logo;
                el.alt = this.schoolConfig.name;
            }
        });
    }
    
    /**
     * Update nama sekolah
     */
    updateSchoolNames() {
        const nameElements = document.querySelectorAll('.school-name, #schoolName, .nama-sekolah');
        nameElements.forEach(el => {
            el.textContent = this.schoolConfig.name;
        });
        
        // Update di header jika ada
        const headerTitle = document.querySelector('h1');
        if (headerTitle && headerTitle.textContent.includes('Brangkas Data Guru')) {
            headerTitle.innerHTML = `${this.schoolConfig.name}<br><small>Brangkas Data Guru Digital</small>`;
        }
    }
    
    /**
     * Terapkan skema warna
     */
    applyColorScheme() {
        const colors = this.schoolConfig.colors;
        const root = document.documentElement;
        
        // Set CSS variables
        root.style.setProperty('--primary-color', colors.primary);
        root.style.setProperty('--secondary-color', colors.secondary);
        
        // Buat style dinamis
        const existingStyle = document.getElementById('dynamic-school-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = 'dynamic-school-style';
        style.textContent = `
            /* Dynamic School Colors */
            .bg-primary, .btn-primary { 
                background-color: ${colors.primary} !important; 
            }
            .text-primary { 
                color: ${colors.primary} !important; 
            }
            .border-primary { 
                border-color: ${colors.primary} !important; 
            }
            .bg-secondary { 
                background-color: ${colors.secondary} !important; 
            }
            .text-secondary { 
                color: ${colors.secondary} !important; 
            }
            
            /* Button hover effects */
            .btn-primary:hover {
                background-color: ${this.darkenColor(colors.primary, 20)} !important;
            }
            
            /* Header styling */
            .header, .navbar {
                background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Update info kontak
     */
    updateContactInfo() {
        if (this.schoolConfig.contact) {
            const phoneElements = document.querySelectorAll('.school-phone');
            const emailElements = document.querySelectorAll('.school-email');
            
            phoneElements.forEach(el => {
                if (this.schoolConfig.contact.phone) {
                    el.textContent = this.schoolConfig.contact.phone;
                }
            });
            
            emailElements.forEach(el => {
                if (this.schoolConfig.contact.email) {
                    el.textContent = this.schoolConfig.contact.email;
                }
            });
        }
    }
    
    /**
     * Setup filter data per sekolah
     */
    setupDataFilters() {
        // Override localStorage untuk isolasi data
        this.setupStorageIsolation();
    }
    
    /**
     * Isolasi localStorage per sekolah
     */
    setupStorageIsolation() {
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        const originalRemoveItem = localStorage.removeItem;
        
        localStorage.setItem = (key, value) => {
            const schoolKey = `${this.currentSchool}_${key}`;
            return originalSetItem.call(localStorage, schoolKey, value);
        };
        
        localStorage.getItem = (key) => {
            const schoolKey = `${this.currentSchool}_${key}`;
            return originalGetItem.call(localStorage, schoolKey);
        };
        
        localStorage.removeItem = (key) => {
            const schoolKey = `${this.currentSchool}_${key}`;
            return originalRemoveItem.call(localStorage, schoolKey);
        };
    }
    
    /**
     * Redirect ke halaman setup
     */
    redirectToSetup() {
        const setupUrl = `setup.html?school=${this.currentSchool}`;
        console.log(`Redirecting to setup: ${setupUrl}`);
        
        // Tampilkan pesan sebelum redirect
        if (confirm(`Sekolah "${this.currentSchool}" belum dikonfigurasi. Lanjut ke halaman setup?`)) {
            window.location.href = setupUrl;
        }
    }
    
    /**
     * Tampilkan pesan sukses
     */
    showSuccessMessage() {
        if (this.currentSchool !== 'demo') {
            console.log(`✅ ${this.schoolConfig.name} loaded successfully!`);
            
            // Tampilkan notifikasi kecil (opsional)
            this.showNotification(`Selamat datang di ${this.schoolConfig.name}`, 'success');
        }
    }
    
    /**
     * Tampilkan notifikasi
     */
    showNotification(message, type = 'info') {
        // Buat elemen notifikasi
        const notification = document.createElement('div');
        notification.className = `school-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-size: 14px;
            max-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animasi masuk
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto hide setelah 3 detik
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Utility: Gelap-kan warna
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    /**
     * Get current school info
     */
    getCurrentSchool() {
        return {
            id: this.currentSchool,
            config: this.schoolConfig
        };
    }
}

// Auto-initialize ketika DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.schoolManager = new SchoolManager();
});

// Export untuk digunakan di script lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchoolManager;
}
