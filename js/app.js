/**
 * Lab to ITA Converter - Main Application
 * Turkish Localized Alexandrite Laser Suitability Assessment Tool
 * 
 * This application helps medical technicians assess skin suitability
 * for Alexandrite laser hair removal treatment using Lab color values.
 */

class LabITAConverterApp {
    constructor() {
        this.version = '1.0.0';
        this.calculator = null;
        this.validator = null;
        this.uiController = null;
        this.isInitialized = false;
        
        // Application configuration
        this.config = {
            appName: "Lab'dan ITA Dönüştürücü",
            language: 'tr',
            maxHistoryItems: 10,
            autoSaveInterval: 30000, // 30 seconds
            debugMode: false
        };
        
        // Performance monitoring
        this.performanceMetrics = {
            initTime: null,
            calculationTimes: [],
            errorCount: 0
        };
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        const startTime = performance.now();
        
        try {
            console.log(`🔬 ${this.config.appName} v${this.version} başlatılıyor...`);
            
            // Check browser compatibility
            if (!this.checkBrowserCompatibility()) {
                this.showBrowserCompatibilityError();
                return;
            }
            
            // Initialize core modules
            await this.initializeModules();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup PWA features
            this.setupPWAFeatures();
            
            // Setup accessibility features
            this.setupAccessibilityFeatures();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Record initialization time
            this.performanceMetrics.initTime = performance.now() - startTime;
            
            console.log(`✅ Uygulama başarıyla başlatıldı (${this.performanceMetrics.initTime.toFixed(2)}ms)`);
            
            // Show welcome message in debug mode
            if (this.config.debugMode) {
                this.showDebugInfo();
            }
            
            // Announce to screen readers
            this.announceAppReady();
            
        } catch (error) {
            console.error('❌ Uygulama başlatma hatası:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize core application modules
     */
    async initializeModules() {
        // Initialize calculator
        this.calculator = new ITACalculator();
        console.log('📊 ITA hesaplayıcı hazır');
        
        // Initialize validator
        this.validator = new InputValidator();
        console.log('✅ Giriş doğrulayıcı hazır');
        
        // Initialize UI controller
        this.uiController = new UIController(this.calculator, this.validator);
        console.log('🎨 UI kontrolcüsü hazır');
        
        // Wait for UI to be fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Check browser compatibility
     * @returns {boolean} True if browser is compatible
     */
    checkBrowserCompatibility() {
        // Check for essential features only
        const essentialFeatures = [
            'localStorage',
            'JSON'
        ];
        
        for (const feature of essentialFeatures) {
            if (typeof window[feature] === 'undefined') {
                console.warn('⚠️ Eksik kritik özellik:', feature);
                return false;
            }
        }
        
        // Check for basic DOM methods
        if (!document.querySelector || !document.addEventListener) {
            console.warn('⚠️ Temel DOM desteği eksik');
            return false;
        }
        
        // Check for basic JavaScript features
        try {
            // Test basic modern features
            const test = function() { return true; };
            if (typeof test !== 'function') {
                return false;
            }
            return true;
        } catch (error) {
            console.warn('⚠️ JavaScript desteği eksik');
            return false;
        }
    }

    /**
     * Show browser compatibility error
     */
    showBrowserCompatibilityError() {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #f8f9fa;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    max-width: 500px;
                    padding: 2rem;
                    text-align: center;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <h2 style="color: #e74c3c; margin-bottom: 1rem;">
                        ⚠️ Tarayıcı Uyumluluğu Sorunu
                    </h2>
                    <p style="margin-bottom: 1rem; line-height: 1.5;">
                        Bu uygulama modern bir tarayıcı gerektirir. 
                        Lütfen tarayıcınızı güncelleyin veya desteklenen bir tarayıcı kullanın:
                    </p>
                    <ul style="text-align: left; margin-bottom: 1rem;">
                        <li>Chrome 70+</li>
                        <li>Firefox 68+</li>
                        <li>Safari 12+</li>
                        <li>Edge 79+</li>
                    </ul>
                    <button onclick="location.reload()" style="
                        background: #2e86ab;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">
                        Yeniden Dene
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorHTML;
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, 'JavaScript Error');
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason, 'Promise Rejection');
        });
        
        // Handle network errors
        window.addEventListener('offline', () => {
            this.showNetworkStatus(false);
        });
        
        window.addEventListener('online', () => {
            this.showNetworkStatus(true);
        });
    }

    /**
     * Handle global errors
     * @param {Error} error - Error object
     * @param {string} type - Error type
     */
    handleGlobalError(error, type) {
        this.performanceMetrics.errorCount++;
        
        console.error(`🚨 ${type}:`, error);
        
        // Don't show error modal for minor errors in production
        if (this.config.debugMode) {
            const errorMessage = `${type}: ${error.message || error}`;
            if (this.uiController) {
                this.uiController.showErrorModal(errorMessage);
            }
        }
        
        // Log error for analytics (in real app, send to error tracking service)
        this.logError(error, type);
    }

    /**
     * Handle initialization errors
     * @param {Error} error - Initialization error
     */
    handleInitializationError(error) {
        const errorHTML = `
            <div class="init-error" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-width: 400px;
                text-align: center;
                z-index: 9999;
            ">
                <h3 style="color: #e74c3c; margin-bottom: 1rem;">
                    ❌ Başlatma Hatası
                </h3>
                <p style="margin-bottom: 1rem;">
                    Uygulama başlatılırken bir hata oluştu. 
                    Lütfen sayfayı yenileyin.
                </p>
                <button onclick="location.reload()" style="
                    background: #2e86ab;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                ">
                    Sayfayı Yenile
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor calculation performance
        const originalCalculate = this.calculator.calculateITA.bind(this.calculator);
        this.calculator.calculateITA = (...args) => {
            const startTime = performance.now();
            const result = originalCalculate(...args);
            const endTime = performance.now();
            
            this.performanceMetrics.calculationTimes.push(endTime - startTime);
            
            // Keep only last 100 measurements
            if (this.performanceMetrics.calculationTimes.length > 100) {
                this.performanceMetrics.calculationTimes.shift();
            }
            
            return result;
        };
        
        // Log performance metrics periodically
        if (this.config.debugMode) {
            setInterval(() => {
                this.logPerformanceMetrics();
            }, 60000); // Every minute
        }
    }

    /**
     * Setup PWA features
     */
    setupPWAFeatures() {
        // Register service worker for offline functionality
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        
        // Handle app installation
        this.setupAppInstallation();
        
        // Handle app updates
        this.setupAppUpdates();
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            // Note: Service worker file would need to be created separately
            // const registration = await navigator.serviceWorker.register('/sw.js');
            // console.log('✅ Service Worker kayıtlı:', registration);
        } catch (error) {
            console.warn('⚠️ Service Worker kaydı başarısız:', error);
        }
    }

    /**
     * Setup app installation prompt
     */
    setupAppInstallation() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button (could be added to UI)
            console.log('📱 Uygulama yüklenebilir');
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('✅ Uygulama yüklendi');
            deferredPrompt = null;
        });
    }

    /**
     * Setup app updates
     */
    setupAppUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Uygulama güncellendi');
                // Could show update notification
            });
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibilityFeatures() {
        // Add skip link for keyboard navigation
        this.addSkipLink();
        
        // Setup focus management
        this.setupFocusManagement();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Announce app capabilities to screen readers
        this.setupScreenReaderSupport();
    }

    /**
     * Add skip link for accessibility
     */
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Ana içeriğe geç';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #2e86ab;
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Ensure focus is visible
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to calculate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const form = document.getElementById('lab-form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
            
            // Ctrl/Cmd + R to reset form
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                if (this.uiController) {
                    this.uiController.newMeasurement();
                }
            }
        });
    }

    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Add main landmark
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.setAttribute('role', 'main');
            mainContent.setAttribute('id', 'main-content');
        }
        
        // Add application role to container
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.setAttribute('role', 'application');
            appContainer.setAttribute('aria-label', this.config.appName);
        }
    }

    /**
     * Show network status
     * @param {boolean} isOnline - Whether app is online
     */
    showNetworkStatus(isOnline) {
        const message = isOnline ? 
            'İnternet bağlantısı geri geldi' : 
            'İnternet bağlantısı yok - Çevrimdışı modda çalışıyor';
        
        if (this.uiController) {
            this.uiController.showToast(message, isOnline ? 'success' : 'warning');
        }
    }

    /**
     * Log error for analytics
     * @param {Error} error - Error object
     * @param {string} type - Error type
     */
    logError(error, type) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            type: type,
            message: error.message || error,
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            version: this.version
        };
        
        // In a real application, send to error tracking service
        console.log('📊 Error logged:', errorLog);
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        const metrics = {
            initTime: this.performanceMetrics.initTime,
            avgCalculationTime: this.getAverageCalculationTime(),
            errorCount: this.performanceMetrics.errorCount,
            memoryUsage: this.getMemoryUsage(),
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 Performance metrics:', metrics);
    }

    /**
     * Get average calculation time
     * @returns {number} Average time in milliseconds
     */
    getAverageCalculationTime() {
        const times = this.performanceMetrics.calculationTimes;
        if (times.length === 0) return 0;
        
        const sum = times.reduce((a, b) => a + b, 0);
        return sum / times.length;
    }

    /**
     * Get memory usage information
     * @returns {Object} Memory usage data
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    /**
     * Show debug information
     */
    showDebugInfo() {
        console.group('🔧 Debug Bilgileri');
        console.log('Versiyon:', this.version);
        console.log('Başlatma süresi:', `${this.performanceMetrics.initTime.toFixed(2)}ms`);
        console.log('Tarayıcı:', navigator.userAgent);
        console.log('Ekran boyutu:', `${window.innerWidth}x${window.innerHeight}`);
        console.log('Dil:', navigator.language);
        console.log('Çevrimiçi:', navigator.onLine);
        console.groupEnd();
    }

    /**
     * Announce app ready to screen readers
     */
    announceAppReady() {
        const announcement = `${this.config.appName} hazır. Lab değerlerini girerek ITA hesaplaması yapabilirsiniz.`;
        
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        announcer.textContent = announcement;
        
        document.body.appendChild(announcer);
        
        setTimeout(() => {
            if (announcer.parentNode) {
                document.body.removeChild(announcer);
            }
        }, 2000);
    }

    /**
     * Get application status
     * @returns {Object} Application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            version: this.version,
            performance: this.performanceMetrics,
            config: this.config
        };
    }
}

// Initialize the application
const app = new LabITAConverterApp();

// Make app globally available for debugging
if (typeof window !== 'undefined') {
    window.LabITAApp = app;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LabITAConverterApp;
}