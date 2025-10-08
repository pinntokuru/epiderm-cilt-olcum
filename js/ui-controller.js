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
            calculateBtn: document.getElementById('calculate-btn'),
            
            // Multiple measurement input elements
            lValue1: document.getElementById('l-value-1'),
            bValue1: document.getElementById('b-value-1'),
            lValue2: document.getElementById('l-value-2'),
            bValue2: document.getElementById('b-value-2'),
            lValue3: document.getElementById('l-value-3'),
            bValue3: document.getElementById('b-value-3'),
            
            // Error elements for multiple measurements
            lError1: document.getElementById('l-error-1'),
            bError1: document.getElementById('b-error-1'),
            lError2: document.getElementById('l-error-2'),
            bError2: document.getElementById('b-error-2'),
            lError3: document.getElementById('l-error-3'),
            bError3: document.getElementById('b-error-3'),
            
            // Results elements
            resultsContainer: document.getElementById('results-container'),
            loadingState: document.getElementById('loading-state'),
            individualMeasurements: document.getElementById('individual-measurements'),
            itaAverage: document.getElementById('ita-average'),
            measurementCount: document.getElementById('measurement-count'),
            
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
        
        // Real-time input validation for all measurements
        for (let i = 1; i <= 3; i++) {
            const lFieldName = `lValue${i}`;
            const bFieldName = `bValue${i}`;
            
            this.elements[lFieldName].addEventListener('input', (e) => this.handleInputChange(e, lFieldName));
            this.elements[bFieldName].addEventListener('input', (e) => this.handleInputChange(e, bFieldName));
            
            // Input sanitization
            this.elements[lFieldName].addEventListener('blur', (e) => this.handleInputBlur(e, lFieldName));
            this.elements[bFieldName].addEventListener('blur', (e) => this.handleInputBlur(e, bFieldName));
        }
        
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
        const validation = this.validator.validateMultipleMeasurements(formData);
        
        if (!validation.isValid) {
            this.displayValidationErrors(validation);
            return;
        }
        
        await this.calculateMultipleITA(validation.validMeasurements);
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
            lValue1: this.elements.lValue1.value,
            bValue1: this.elements.bValue1.value,
            lValue2: this.elements.lValue2.value,
            bValue2: this.elements.bValue2.value,
            lValue3: this.elements.lValue3.value,
            bValue3: this.elements.bValue3.value
        };
    }

    /**
     * Calculate ITA value
     * @param {Object} formData - Form data
     */
    async calculateMultipleITA(measurements) {
        this.isCalculating = true;
        this.showLoadingState();
        this.setCalculateButtonState(true);
        
        try {
            // Simulate calculation delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = this.calculator.calculateMultipleITA(measurements);
            
            if (result.success) {
                this.displayMultipleResults(result);
                this.addToHistory(result);
                this.saveToLocalStorage();
            } else {
                this.showErrorModal(result.errors.join('\n'));
            }
            
        } catch (error) {
            console.error('Multiple calculation error:', error);
            this.showErrorModal(this.uiText.calculationError);
        } finally {
            this.isCalculating = false;
            this.hideLoadingState();
            this.setCalculateButtonState(false);
        }
    }

    /**
     * Display multiple measurement results
     * @param {Object} result - Multiple calculation result
     */
    displayMultipleResults(result) {
        const { individualResults, averageITA, measurementCount } = result;
        
        // Display individual measurements
        this.displayIndividualMeasurements(individualResults);
        
        // Update average ITA value
        this.elements.itaAverage.textContent = this.calculator.formatITAValue(averageITA);
        
        // Update measurement count
        this.elements.measurementCount.textContent = measurementCount;
        
        // Show results with animation
        this.elements.resultsContainer.style.display = 'block';
        this.elements.resultsContainer.classList.add('slide-up');
        
        // Announce to screen readers
        this.announceMultipleResults(result);
    }

    /**
     * Display individual measurement results
     * @param {Array} individualResults - Array of individual measurement results
     */
    displayIndividualMeasurements(individualResults) {
        const container = this.elements.individualMeasurements;
        
        const measurementsHTML = individualResults.map(result => {
            const { measurementNumber, ita, labValues, success } = result;
            const itaFormatted = success ? this.calculator.formatITAValue(ita) : 'Hata';
            const statusClass = success ? 'success' : 'error';
            
            return `
                <div class="individual-measurement ${statusClass}">
                    <div class="measurement-header">
                        <span class="measurement-number">${measurementNumber}.</span>
                        <span class="measurement-values">L:${labValues.L} b:${labValues.b}</span>
                    </div>
                    <div class="measurement-result">
                        <span class="ita-label">ITA:</span>
                        <span class="ita-value">${itaFormatted}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = measurementsHTML;
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
        // Handle both old and new field naming conventions
        let errorElementId;
        if (fieldName.includes('Value')) {
            // New naming: lValue1 -> lError1, bValue2 -> bError2, etc.
            errorElementId = fieldName.replace('Value', 'Error');
        } else {
            // Legacy naming: lValue -> lError, bValue -> bError
            errorElementId = `${fieldName.charAt(0)}Error`;
        }
        
        const errorElement = this.elements[errorElementId];
        const inputElement = this.elements[fieldName];
        
        if (errorElement && inputElement) {
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
        const timeString = item.timestamp.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const itaFormatted = this.calculator.formatITAValue(item.ita);
        
        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-content">
                    <div class="history-item-values">${index}. L:${item.labValues.L} b:${item.labValues.b} → ITA:${itaFormatted}</div>
                </div>
                <div class="history-item-timestamp">${timeString}</div>
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
        
        // Clear validation states for all measurement fields
        for (let i = 1; i <= 3; i++) {
            const lFieldName = `lValue${i}`;
            const bFieldName = `bValue${i}`;
            const lErrorName = `lError${i}`;
            const bErrorName = `bError${i}`;
            
            const lInputElement = this.elements[lFieldName];
            const bInputElement = this.elements[bFieldName];
            const lErrorElement = this.elements[lErrorName];
            const bErrorElement = this.elements[bErrorName];
            
            if (lInputElement) {
                lInputElement.classList.remove('valid', 'invalid');
            }
            if (bInputElement) {
                bInputElement.classList.remove('valid', 'invalid');
            }
            if (lErrorElement) {
                lErrorElement.textContent = '';
            }
            if (bErrorElement) {
                bErrorElement.textContent = '';
            }
        }
        
        // Hide results
        this.elements.resultsContainer.style.display = 'none';
        
        // Focus first input
        this.elements.lValue1.focus();
    }

    /**
     * Copy results to clipboard
     */
    async copyResults() {
        if (this.elements.resultsContainer.style.display === 'none') return;
        
        const averageITA = this.elements.itaAverage.textContent;
        const measurementCount = this.elements.measurementCount.textContent;
        const formData = this.getFormData();
        
        let textToCopy = `Çoklu Ölçüm Sonuçları:\n`;
        textToCopy += `Ölçüm Sayısı: ${measurementCount}\n`;
        textToCopy += `Ortalama ITA: ${averageITA}\n\n`;
        textToCopy += `Bireysel Ölçümler:\n`;
        
        // Add individual measurements
        for (let i = 1; i <= 3; i++) {
            const lValue = formData[`lValue${i}`];
            const bValue = formData[`bValue${i}`];
            if (lValue && bValue) {
                textToCopy += `${i}. L*:${lValue} b*:${bValue}\n`;
            }
        }
        
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
        const announcement = `ITA değeri ${this.calculator.formatITAValue(result.ita)}`;
        
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

    /**
     * Announce multiple results to screen readers
     * @param {Object} result - Multiple calculation result
     */
    announceMultipleResults(result) {
        const { averageITA, measurementCount } = result;
        const announcement = `${measurementCount} ölçüm tamamlandı. Ortalama ITA değeri ${this.calculator.formatITAValue(averageITA)}`;
        
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
} else if (typeof window !== 'undefined') {
    window.UIController = UIController;
}