/**
 * Lab to ITA Converter - Calculator Module
 * Turkish Localized ITA Calculation and Skin Type Classification
 * 
 * Formula: ITA° = [Arc Tangent ((L* - 50) / b*)] × (180 / π)
 */

class ITACalculator {
    constructor() {
        // Simplified Turkish skin type classifications
        this.skinTypes = {
            1: {
                type: 'Mükemmel',
                description: 'Çok Güvenli',
                fullDescription: 'Mükemmel (>55°)',
                range: { min: 55.1, max: Infinity },
                suitability: 'safe',
                recommendation: 'Mükemmel'
            },
            2: {
                type: 'İyi',
                description: 'Güvenli',
                fullDescription: 'İyi (40-55°)',
                range: { min: 40, max: 55 },
                suitability: 'safe',
                recommendation: 'İyi'
            },
            3: {
                type: 'Dikkat',
                description: 'Dikkatli Olun',
                fullDescription: 'Dikkat (30-40°)',
                range: { min: 30, max: 39.9 },
                suitability: 'caution',
                recommendation: 'Dikkat'
            },
            4: {
                type: 'Riskli',
                description: 'Yüksek Risk',
                fullDescription: 'Riskli (<30°)',
                range: { min: -Infinity, max: 29.9 },
                suitability: 'danger',
                recommendation: 'Riskli'
            }
        };

        // Simplified Turkish suitability messages
        this.suitabilityMessages = {
            safe: {
                icon: '✅',
                title: 'LAZER İÇİN UYGUN',
                description: 'Alexandrite lazer güvenli\nNormal ayarlarla tedavi yapılabilir',
                className: 'safe'
            },
            caution: {
                icon: '⚠️',
                title: 'DİKKAT GEREKİR',
                description: 'Düşük enerji ayarları kullanın\nTest yaması zorunludur',
                className: 'caution'
            },
            danger: {
                icon: '❌',
                title: 'RİSKLİ',
                description: 'Alexandrite lazer önerilmez\nAlternatif yöntem düşünün',
                className: 'danger'
            }
        };

        // Turkish error messages
        this.errorMessages = {
            invalidL: 'Geçersiz L* değeri - 0 ile 100 arasında bir sayı girin',
            invalidB: 'Geçersiz b* değeri - -128 ile 127 arasında bir sayı girin',
            emptyField: 'Bu alan zorunludur',
            invalidNumber: 'Lütfen geçerli bir sayı girin',
            calculationError: 'Hesaplama hatası - değerlerinizi kontrol edin'
        };
    }

    /**
     * Calculate ITA value from Lab color values
     * @param {number} L - Lightness value (0-100)
     * @param {number} b - Blue-Yellow axis value (-128 to +127)
     * @returns {Object} Calculation result with ITA value and validation
     */
    calculateITA(L, b) {
        try {
            // Validate input values
            const validation = this.validateLabValues(L, b);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors,
                    ita: null,
                    skinType: null
                };
            }

            // Convert to numbers
            const lValue = parseFloat(L);
            const bValue = parseFloat(b);

            // Calculate ITA using the robust atan2 formula
            // ITA° = [Arc Tangent2 ((L* - 50), b*)] × (180 / π)
            //
            // Using atan2 instead of atan provides several advantages:
            // 1. Handles b* = 0 case gracefully (no division by zero)
            // 2. Maintains correct quadrant information
            // 3. More mathematically robust for all edge cases
            // 4. Returns values in the full range [-180°, +180°]
            //
            // atan2(y, x) where y = (L* - 50) and x = b*
            const y = lValue - 50;  // Lightness deviation from neutral (50)
            const x = bValue;       // Blue-Yellow axis value
            
            const radians = Math.atan2(y, x);
            let itaValue = radians * (180 / Math.PI);

            // Round to 1 decimal place
            const roundedITA = Math.round(itaValue * 10) / 10;

            // Classify skin type
            const skinType = this.classifySkinType(roundedITA);

            return {
                success: true,
                errors: [],
                ita: roundedITA,
                skinType: skinType,
                labValues: { L: lValue, b: bValue },
                timestamp: new Date()
            };

        } catch (error) {
            console.error('ITA Calculation Error:', error);
            return {
                success: false,
                errors: [this.errorMessages.calculationError],
                ita: null,
                skinType: null
            };
        }
    }

    /**
     * Calculate ITA values for multiple measurements and return individual results plus average
     * @param {Array} measurements - Array of measurement objects with L and b values
     * @returns {Object} Calculation result with individual ITAs and average
     */
    calculateMultipleITA(measurements) {
        try {
            if (!Array.isArray(measurements) || measurements.length === 0) {
                return {
                    success: false,
                    errors: ['En az bir ölçüm gereklidir'],
                    individualResults: [],
                    averageITA: null,
                    measurementCount: 0
                };
            }

            const individualResults = [];
            const validITAs = [];
            const allErrors = [];

            // Calculate ITA for each measurement
            measurements.forEach((measurement, index) => {
                const { L, b } = measurement;
                const result = this.calculateITA(L, b);
                
                const individualResult = {
                    measurementNumber: index + 1,
                    labValues: { L, b },
                    ...result
                };
                
                individualResults.push(individualResult);
                
                if (result.success) {
                    validITAs.push(result.ita);
                } else {
                    allErrors.push(`Ölçüm ${index + 1}: ${result.errors.join(', ')}`);
                }
            });

            // Check if we have at least one valid measurement
            if (validITAs.length === 0) {
                return {
                    success: false,
                    errors: ['Geçerli ölçüm bulunamadı'].concat(allErrors),
                    individualResults: individualResults,
                    averageITA: null,
                    measurementCount: measurements.length
                };
            }

            // Calculate average ITA
            const averageITA = validITAs.reduce((sum, ita) => sum + ita, 0) / validITAs.length;
            const roundedAverageITA = Math.round(averageITA * 10) / 10;

            // Classify skin type based on average
            const averageSkinType = this.classifySkinType(roundedAverageITA);

            return {
                success: true,
                errors: allErrors, // Include any individual measurement errors as warnings
                individualResults: individualResults,
                averageITA: roundedAverageITA,
                averageSkinType: averageSkinType,
                measurementCount: measurements.length,
                validMeasurementCount: validITAs.length,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('Multiple ITA Calculation Error:', error);
            return {
                success: false,
                errors: [this.errorMessages.calculationError],
                individualResults: [],
                averageITA: null,
                measurementCount: 0
            };
        }
    }

    /**
     * Classify skin type based on ITA value
     * @param {number} itaValue - Calculated ITA value in degrees
     * @returns {Object} Skin type classification with Turkish descriptions
     */
    classifySkinType(itaValue) {
        // Find the appropriate skin type based on ITA range
        for (const [key, skinType] of Object.entries(this.skinTypes)) {
            if (itaValue >= skinType.range.min && itaValue <= skinType.range.max) {
                const suitability = this.suitabilityMessages[skinType.suitability];
                
                return {
                    type: skinType.type,
                    description: skinType.description,
                    fullDescription: skinType.fullDescription,
                    recommendation: skinType.recommendation,
                    suitability: skinType.suitability,
                    suitabilityMessage: suitability,
                    range: skinType.range
                };
            }
        }

        // Fallback for edge cases
        return {
            type: 'Unknown',
            description: 'Bilinmeyen',
            fullDescription: 'Bilinmeyen Cilt Tipi',
            recommendation: 'Değerlendirme Gerekli',
            suitability: 'caution',
            suitabilityMessage: this.suitabilityMessages.caution,
            range: { min: -Infinity, max: Infinity }
        };
    }

    /**
     * Validate Lab color values
     * @param {*} L - Lightness value
     * @param {*} b - Blue-Yellow axis value
     * @returns {Object} Validation result with errors
     */
    validateLabValues(L, b) {
        const errors = [];

        // Check if values are provided
        if (L === null || L === undefined || L === '') {
            errors.push(this.errorMessages.emptyField + ' (L*)');
        }
        if (b === null || b === undefined || b === '') {
            errors.push(this.errorMessages.emptyField + ' (b*)');
        }

        // If any field is empty, return early
        if (errors.length > 0) {
            return { isValid: false, errors };
        }

        // Convert to numbers and validate
        const lValue = parseFloat(L);
        const bValue = parseFloat(b);

        // Check if values are valid numbers
        if (isNaN(lValue)) {
            errors.push(this.errorMessages.invalidNumber + ' (L*)');
        }
        if (isNaN(bValue)) {
            errors.push(this.errorMessages.invalidNumber + ' (b*)');
        }

        // If any value is not a number, return early
        if (errors.length > 0) {
            return { isValid: false, errors };
        }

        // Validate ranges
        if (lValue < 0 || lValue > 100) {
            errors.push(this.errorMessages.invalidL);
        }
        if (bValue < -128 || bValue > 127) {
            errors.push(this.errorMessages.invalidB);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get skin type information by ITA value
     * @param {number} itaValue - ITA value in degrees
     * @returns {Object} Detailed skin type information
     */
    getSkinTypeInfo(itaValue) {
        const skinType = this.classifySkinType(itaValue);
        return {
            ...skinType,
            itaValue: itaValue,
            formattedITA: `${itaValue}°`,
            isLaserSuitable: skinType.suitability === 'safe',
            requiresCaution: skinType.suitability === 'caution',
            isNotRecommended: skinType.suitability === 'danger'
        };
    }

    /**
     * Get all skin type classifications for reference
     * @returns {Object} All skin type classifications
     */
    getAllSkinTypes() {
        return this.skinTypes;
    }

    /**
     * Get suitability messages for reference
     * @returns {Object} All suitability messages
     */
    getSuitabilityMessages() {
        return this.suitabilityMessages;
    }

    /**
     * Format ITA value for display
     * @param {number} itaValue - ITA value in degrees
     * @returns {string} Formatted ITA value
     */
    formatITAValue(itaValue) {
        if (itaValue === null || itaValue === undefined || isNaN(itaValue)) {
            return '--';
        }
        return `${itaValue.toFixed(1)}°`;
    }

    /**
     * Get color-coded CSS class for ITA value
     * @param {number} itaValue - ITA value in degrees
     * @returns {string} CSS class name
     */
    getITAColorClass(itaValue) {
        const skinType = this.classifySkinType(itaValue);
        return skinType.suitability;
    }

    /**
     * Generate summary text for measurement
     * @param {Object} result - Calculation result
     * @returns {string} Summary text in Turkish
     */
    generateSummary(result) {
        if (!result.success) {
            return 'Hesaplama başarısız';
        }

        const { ita, skinType, labValues } = result;
        return `L:${labValues.L} b:${labValues.b} → ITA:${this.formatITAValue(ita)} (${skinType.fullDescription})`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITACalculator;
} else if (typeof window !== 'undefined') {
    window.ITACalculator = ITACalculator;
}