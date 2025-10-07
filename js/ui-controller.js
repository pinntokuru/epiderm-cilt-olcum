/**
 * Lab to ITA Converter - UI Controller Module
 * Turkish Localized User Interface Management
 */

class UIController {
    constructor(calculator, validator) {
        this.calculator = calculator;
        this.validator = validator;
        this.measurementHistory = [];
        this.maxHistoryItems = 10;
        
        // DOM elements
        this.elements = {};
        this.isCalculating = false;
        
        // Turkish UI text
        this.uiText = {
            calculating: 'ITA hesaplanıyor...',
            noMeasurements: 'Henüz ölçüm yapılmadı',
            confirmClear: 'Tüm ölçüm geçmişini silmek istediğinizden emin misiniz?',
            measurementAdded: 'Ölçüm eklendi',
            historyCleared: 'Geçmiş temizlendi',
            calculationError: 'Hesaplama hatası oluştu',
            invalidInput: 'Geçersiz giriş değerleri',
            copySuccess: 'Sonuç panoya kopyalandı',
            copyError: 'Kopyalama başarısız'
        };
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the UI controller
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupAccessibility();
        this.loadFromLocalStorage();
        console.log('UI Controller initialized');
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            // Form elements
            form: document.getElementById('lab-form'),
            lValue: document.getElementById('l-value'),
            aValue: document.getElementById('a-value'),
            bValue: document.getElementById('b-value'),
            calculateBtn: document.getElementById('calculate-btn'),
            
            // Error elements
            lError: document.getElementById('l-error'),
            aError: document.getElementById('a-error'),
            bError: document.getElementById('b-error'),
            
            // Results elements
            resultsContainer: document.getElementById('results-container'),
            loadingState: document.getElementById('loading-state'),
            itaResult: document.getElementById('ita-result'),
            skinTypeResult: document.getElementById('skin-type-result'),
            suitabilityIndicator: document.getElementById('suitability-indicator'),
            
            // History elements
            historyContainer: document.getElementById('history-container'),
            clearHistoryBtn: document.getElementById('clear-history-btn'),
            newMeasurementBtn: document.getElementById('new-measurement-btn'),
            
            // Modal elements
            errorModal: document.getElementById('error-modal'),
            errorMessage: document.getElementById('error-message'),
            closeErrorModal: document.getElementById('close-error-modal'),
            errorOkBtn: document.getElementById('error-ok-btn')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form submission
        this.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Real-time input validation
        this.elements.lValue.addEventListener('input', (e) => this.handleInputChange(e, 'lValue'));
        this.elements.aValue.addEventListener('input', (e) => this.handleInputChange(e, 'aValue'));
        this.elements.bValue.addEventListener('input', (e) => this.handleInputChange(e, 'bValue'));
        
        // Input sanitization
        this.elements.lValue.addEventListener('blur', (e) => this.handleInputBlur(e, 'lValue'));
        this.elements.aValue.addEventListener('blur', (e) => this.handleInputBlur(e, 'aValue'));
        this.elements.bValue.addEventListener('blur', (e) => this.handleInputBlur(e, 'bValue'));
        
        // History actions
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.elements.newMeasurementBtn.addEventListener('click', () => this.newMeasurement());
        
        // Modal events
        this.elements.closeErrorModal.addEventListener('click', () => this.hideErrorModal());
        this.elements.errorOkBtn.addEventListener('click', () => this.hideErrorModal());
        this.elements.errorModal.addEventListener('click', (e) => {
            if (e.target === this.elements.errorModal) {
                this.hideErrorModal();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Results click to copy
        this.elements.resultsContainer.addEventListener('click', () => this.copyResults());
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA live regions for screen readers
        this.elements.resultsContainer.setAttribute('aria-live', 'polite');
        this.elements.historyContainer.setAttribute('aria-live', 'polite');
        
        // Set up focus management
        this.setupFocusManagement();
    }

    /**
     * Setup focus management for accessibility
     */
    setupFocusManagement() {
        // Focus trap for modal
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        this.elements.errorModal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = this.elements.errorModal.querySelectorAll(focusableElements);
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.isCalculating) return;
        
        const formData = this.getFormData();
        const validation = this.validator.validateForm(formData);
        
        if (!validation.isValid) {
            this.displayValidationErrors(validation);
            return;
        }
        
        await this.calculateITA(formData);
    }

    /**
     * Handle input change with real-time validation
     * @param {Event} e - Input event
     * @param {string} fieldName - Field name
     */
    handleInputChange(e, fieldName) {
        const value = e.target.value;
        const sanitized = this.validator.sanitizeInput(value, fieldName);
        
        if (sanitized !== value) {
            e.target.value = sanitized;
        }
        
        // Real-time validation with debouncing
        this.validator.validateFieldRealTime(fieldName, sanitized, (field, result) => {
            this.displayFieldValidation(field, result);
        });
    }

    /**
     * Handle input blur for formatting
     * @param {Event} e - Blur event
     * @param {string} fieldName - Field name
     */
    handleInputBlur(e, fieldName) {
        const value = e.target.value;
        if (value) {
            const formatted = this.validator.formatValue(value, fieldName);
            e.target.value = formatted;
        }
    }

    /**
     * Handle keyboard navigation
     * @param {Event} e - Keydown event
     */
    handleKeyDown(e) {
        // Escape key to close modal
        if (e.key === 'Escape' && this.elements.errorModal.style.display !== 'none') {
            this.hideErrorModal();
        }
        
        // Enter key on calculate button
        if (e.key === 'Enter' && document.activeElement === this.elements.calculateBtn) {
            this.elements.form.dispatchEvent(new Event('submit'));
        }
    }

    /**
     * Get form data
     * @returns {Object} Form data object
     */
    getFormData() {
        return {
            lValue: this.elements.lValue.value,
            aValue: this.elements.aValue.value,
            bValue: this.elements.bValue.value
        };
    }

    /**
     * Calculate ITA value
     * @param {Object} formData - Form data
     */
    async calculateITA(formData) {
        this.isCalculating = true;
        this.showLoadingState();
        this.setCalculateButtonState(true);
        
        try {
            // Simulate calculation delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = this.calculator.calculateITA(
                formData.lValue,
                formData.aValue,
                formData.bValue
            );
            
            if (result.success) {
                this.displayResults(result);
                this.addToHistory(result);
                this.saveToLocalStorage();
            } else {
                this.showErrorModal(result.errors.join('\n'));
            }
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showErrorModal(this.uiText.calculationError);
        } finally {
            this.isCalculating = false;
            this.hideLoadingState();
            this.setCalculateButtonState(false);
        }
    }

    /**
     * Display calculation results
     * @param {Object} result - Calculation result
     */
    displayResults(result) {
        const { ita, skinType } = result;
        
        // Update ITA value
        this.elements.itaResult.textContent = this.calculator.formatITAValue(ita);
        
        // Update skin type
        this.elements.skinTypeResult.textContent = skinType.fullDescription;
        
        // Update suitability indicator
        this.updateSuitabilityIndicator(skinType);
        
        // Show results with animation
        this.elements.resultsContainer.style.display = 'block';
        this.elements.resultsContainer.classList.add('slide-up');
        
        // Announce to screen readers
        this.announceResults(result);
    }

    /**
     * Update suitability indicator
     * @param {Object} skinType - Skin type information
     */
    updateSuitabilityIndicator(skinType) {
        const indicator = this.elements.suitabilityIndicator;
        const message = skinType.suitabilityMessage;
        
        // Clear existing classes
        indicator.className = 'suitability-indicator';
        indicator.classList.add(message.className);
        
        // Update content
        const content = indicator.querySelector('.indicator-content');
        content.innerHTML = `
            <span class="indicator-icon">${message.icon}</span>
            <span class="indicator-title">${message.title}</span>
            <span class="indicator-description">${message.description.replace('\n', '<br>')}</span>
        `;
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.resultsContainer.style.display = 'none';
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        this.elements.loadingState.style.display = 'none';
    }

    /**
     * Set calculate button state
     * @param {boolean} disabled - Whether button should be disabled
     */
    setCalculateButtonState(disabled) {
        this.elements.calculateBtn.disabled = disabled;
        
        if (disabled) {
            this.elements.calculateBtn.querySelector('.btn-text').textContent = this.uiText.calculating;
        } else {
            this.elements.calculateBtn.querySelector('.btn-text').textContent = 'ITA Hesapla';
        }
    }

    /**
     * Display field validation result
     * @param {string} fieldName - Field name
     * @param {Object} result - Validation result
     */
    displayFieldValidation(fieldName, result) {
        const errorElement = this.elements[`${fieldName.charAt(0)}Error`];
        const inputElement = this.elements[fieldName];
        
        if (result.isValid) {
            errorElement.textContent = '';
            inputElement.classList.remove('invalid');
            inputElement.classList.add('valid');
        } else {
            errorElement.textContent = result.errors[0] || '';
            inputElement.classList.remove('valid');
            inputElement.classList.add('invalid');
        }
    }

    /**
     * Display validation errors
     * @param {Object} validation - Validation result
     */
    displayValidationErrors(validation) {
        Object.entries(validation.fields).forEach(([fieldName, result]) => {
            this.displayFieldValidation(fieldName, result);
        });
        
        // Focus first invalid field
        const firstInvalidField = Object.entries(validation.fields)
            .find(([, result]) => !result.isValid);
        
        if (firstInvalidField) {
            const fieldName = firstInvalidField[0];
            this.elements[fieldName].focus();
        }
    }

    /**
     * Add measurement to history
     * @param {Object} result - Calculation result
     */
    addToHistory(result) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date(),
            ...result
        };
        
        this.measurementHistory.unshift(historyItem);
        
        // Limit history size
        if (this.measurementHistory.length > this.maxHistoryItems) {
            this.measurementHistory = this.measurementHistory.slice(0, this.maxHistoryItems);
        }
        
        this.updateHistoryDisplay();
        this.elements.clearHistoryBtn.disabled = false;
    }

    /**
     * Update history display
     */
    updateHistoryDisplay() {
        const container = this.elements.historyContainer;
        
        if (this.measurementHistory.length === 0) {
            container.innerHTML = `
                <div class="history-empty">
                    <p class="empty-message">${this.uiText.noMeasurements}</p>
                </div>
            `;
            return;
        }
        
        const historyHTML = `
            <div class="history-list">
                ${this.measurementHistory.map((item, index) => this.createHistoryItemHTML(item, index + 1)).join('')}
            </div>
        `;
        
        container.innerHTML = historyHTML;
    }

    /**
     * Create history item HTML
     * @param {Object} item - History item
     * @param {number} index - Item index
     * @returns {string} HTML string
     */
    createHistoryItemHTML(item, index) {
        const summary = this.calculator.generateSummary(item);
        const timeString = item.timestamp.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-content">
                    <div class="history-item-values">${index}. ${summary}</div>
                    <div class="history-item-result">
                        ${item.skinType.fullDescription} - ${item.skinType.recommendation}
                    </div>
                </div>
                <div class="history-item-timestamp">${timeString}</div>
                <div class="history-item-status ${item.skinType.suitability}"></div>
            </div>
        `;
    }

    /**
     * Clear measurement history
     */
    clearHistory() {
        if (this.measurementHistory.length === 0) return;
        
        if (confirm(this.uiText.confirmClear)) {
            this.measurementHistory = [];
            this.updateHistoryDisplay();
            this.elements.clearHistoryBtn.disabled = true;
            this.saveToLocalStorage();
            this.showToast(this.uiText.historyCleared, 'success');
        }
    }

    /**
     * Start new measurement
     */
    newMeasurement() {
        // Clear form
        this.elements.form.reset();
        
        // Clear validation states
        ['lValue', 'aValue', 'bValue'].forEach(fieldName => {
            const inputElement = this.elements[fieldName];
            const errorElement = this.elements[`${fieldName.charAt(0)}Error`];
            
            inputElement.classList.remove('valid', 'invalid');
            errorElement.textContent = '';
        });
        
        // Hide results
        this.elements.resultsContainer.style.display = 'none';
        
        // Focus first input
        this.elements.lValue.focus();
    }

    /**
     * Copy results to clipboard
     */
    async copyResults() {
        if (this.elements.resultsContainer.style.display === 'none') return;
        
        const itaValue = this.elements.itaResult.textContent;
        const skinType = this.elements.skinTypeResult.textContent;
        const formData = this.getFormData();
        
        const textToCopy = `Lab Değerleri: L*:${formData.lValue} a*:${formData.aValue} b*:${formData.bValue}\nITA: ${itaValue}\nCilt Tipi: ${skinType}`;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showToast(this.uiText.copySuccess, 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showToast(this.uiText.copyError, 'error');
        }
    }

    /**
     * Show error modal
     * @param {string} message - Error message
     */
    showErrorModal(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorModal.style.display = 'flex';
        this.elements.closeErrorModal.focus();
        document.body.classList.add('modal-open');
    }

    /**
     * Hide error modal
     */
    hideErrorModal() {
        this.elements.errorModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        this.elements.calculateBtn.focus();
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, warning, error)
     */
    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        // Add to container
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
        
        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    /**
     * Get toast icon for type
     * @param {string} type - Toast type
     * @returns {string} Icon emoji
     */
    getToastIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    }

    /**
     * Announce results to screen readers
     * @param {Object} result - Calculation result
     */
    announceResults(result) {
        const announcement = `ITA değeri ${this.calculator.formatITAValue(result.ita)}, ${result.skinType.fullDescription}, ${result.skinType.suitabilityMessage.title}`;
        
        // Create temporary element for screen reader announcement
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        announcer.textContent = announcement;
        
        document.body.appendChild(announcer);
        
        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    }

    /**
     * Save data to localStorage
     */
    saveToLocalStorage() {
        try {
            const data = {
                history: this.measurementHistory.slice(0, 5), // Save only last 5
                timestamp: Date.now()
            };
            localStorage.setItem('labItaConverter', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load data from localStorage
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('labItaConverter');
            if (data) {
                const parsed = JSON.parse(data);
                
                // Check if data is not too old (7 days)
                const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                if (parsed.timestamp > weekAgo && parsed.history) {
                    this.measurementHistory = parsed.history.map(item => ({
                        ...item,
                        timestamp: new Date(item.timestamp)
                    }));
                    this.updateHistoryDisplay();
                    this.elements.clearHistoryBtn.disabled = this.measurementHistory.length === 0;
                }
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
} else if (typeof window !== 'undefined') {
    window.UIController = UIController;
}