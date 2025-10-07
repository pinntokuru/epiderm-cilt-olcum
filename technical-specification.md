# Lab to ITA Converter - Technical Specification

## Project Overview
A mobile-friendly web application for converting Lab color values to ITA (Individual Typology Angle) values to assess skin suitability for Alexandrite laser hair removal treatment.

## Core Requirements

### Functional Requirements
1. **Lab Value Input**: Accept L*, a*, b* color values from colorimeter
2. **ITA Calculation**: Convert Lab values to ITA using standard dermatological formula
3. **Skin Type Classification**: Display Fitzpatrick skin type based on ITA value
4. **Multiple Measurements**: Allow entry of multiple Lab value sets
5. **Mobile Optimization**: Fully responsive design for tablet/smartphone use

### Technical Requirements
1. **Platform**: Web-based application (HTML, CSS, JavaScript)
2. **Compatibility**: Modern mobile browsers (iOS Safari, Chrome, Firefox)
3. **Offline Capability**: No internet connection required after initial load
4. **No Data Storage**: Session-based only, no persistent storage

## ITA Calculation Formula
```
ITA° = [Arc Tangent ((L* - 50) / b*)] × (180 / π)
```

Where:
- L* = Lightness value (0-100)
- b* = Blue-Yellow axis value (-128 to +127)
- Result in degrees

## Fitzpatrick Skin Type Classification

| ITA Range (°) | Skin Type | Description | Laser Suitability |
|---------------|-----------|-------------|-------------------|
| > 55° | Type I | Very Light | Excellent |
| 41° to 55° | Type II | Light | Good |
| 28° to 41° | Type III | Intermediate | Moderate |
| 10° to 28° | Type IV | Tan | Caution |
| -30° to 10° | Type V | Brown | High Risk |
| < -30° | Type VI | Dark | Not Recommended |

## User Interface Design

### Layout Structure
```
┌─────────────────────────┐
│       App Header        │
├─────────────────────────┤
│    Lab Input Section    │
│  ┌─────┬─────┬─────┐   │
│  │ L*  │ a*  │ b*  │   │
│  └─────┴─────┴─────┘   │
│    [Calculate Button]   │
├─────────────────────────┤
│    Results Section      │
│  ITA Value: XX.X°       │
│  Skin Type: Type X      │
│  Status: [Color Coded]  │
├─────────────────────────┤
│  Multiple Measurements  │
│    [Previous Results]   │
└─────────────────────────┘
```

### Mobile Considerations
- Touch-friendly input fields (minimum 44px height)
- Large, accessible buttons
- Clear visual hierarchy
- Portrait orientation optimized
- Swipe gestures for multiple measurements

## Technical Architecture

### File Structure
```
/
├── index.html          # Main application file
├── styles/
│   └── main.css       # Responsive styling
├── scripts/
│   ├── calculator.js  # ITA calculation logic
│   ├── ui.js         # User interface handling
│   └── validation.js # Input validation
└── assets/
    └── icons/        # UI icons and graphics
```

### Core Functions

#### Calculator Module
```javascript
// Main calculation function
function calculateITA(L, a, b)

// Skin type classification
function classifySkinType(itaValue)

// Validation functions
function validateLabValues(L, a, b)
```

#### UI Module
```javascript
// Input handling
function handleLabInput()

// Results display
function displayResults(itaValue, skinType)

// Multiple measurements
function addMeasurement()
function clearMeasurements()
```

## Input Validation Rules

### Lab Value Ranges
- **L* (Lightness)**: 0 to 100
- **a* (Green-Red)**: -128 to +127
- **b* (Blue-Yellow)**: -128 to +127

### Error Handling
- Invalid number format
- Out of range values
- Missing required fields
- Division by zero (b* = 0)

## Visual Design Guidelines

### Color Scheme
- Primary: Medical blue (#2E86AB)
- Secondary: Clean white (#FFFFFF)
- Accent: Warning orange (#F24236) for high-risk results
- Success: Safe green (#18A558) for suitable results

### Typography
- Primary font: System fonts (San Francisco, Roboto, Segoe UI)
- Sizes: Responsive scaling based on viewport
- Accessibility: WCAG 2.1 AA compliance

### Visual Feedback
- Color-coded results based on laser suitability
- Clear icons for different skin types
- Progress indicators for calculations
- Error states with helpful messages

## Performance Requirements
- Initial load time: < 2 seconds
- Calculation response: < 100ms
- Smooth animations: 60fps
- Memory usage: < 50MB

## Browser Support
- iOS Safari 12+
- Chrome Mobile 70+
- Firefox Mobile 68+
- Samsung Internet 10+

## Security Considerations
- No sensitive data storage
- Client-side only processing
- No external API dependencies
- HTTPS deployment recommended

## Testing Strategy
- Unit tests for calculation functions
- Cross-browser compatibility testing
- Mobile device testing (various screen sizes)
- Accessibility testing
- Performance testing

## Deployment
- Static file hosting (GitHub Pages, Netlify, etc.)
- CDN distribution for global access
- Progressive Web App (PWA) capabilities
- Offline functionality