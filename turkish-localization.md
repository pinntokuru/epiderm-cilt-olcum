# Lab to ITA Converter - Turkish Localization

## Turkish Interface Text

### Main Application Headers
- **App Title**: "Lab'dan ITA Dönüştürücü"
- **Subtitle**: "Alexandrite Lazer Uygunluk Değerlendirmesi"

### Input Section
- **Section Title**: "Lab Değerlerini Girin"
- **Input Labels**:
  - L* (Parlaklık): "L* (Parlaklık)"
  - a* (Yeşil-Kırmızı): "a* (Yeşil-Kırmızı)"
  - b* (Mavi-Sarı): "b* (Mavi-Sarı)"
- **Button**: "ITA Hesapla"
- **Helper Text**:
  - "L* aralığı: 0-100"
  - "a* aralığı: -128 ile +127"
  - "b* aralığı: -128 ile +127"

### Results Section
- **Section Title**: "Sonuçlar"
- **Result Labels**:
  - "ITA Değeri": "ITA Değeri: {value}°"
  - "Cilt Tipi": "Cilt Tipi: Tip {type} ({description})"

### Skin Type Classifications (Turkish)
| ITA Aralığı | Cilt Tipi | Açıklama | Lazer Uygunluğu |
|-------------|-----------|----------|-----------------|
| > 55° | Tip I | Çok Açık | Mükemmel |
| 41-55° | Tip II | Açık | İyi |
| 28-41° | Tip III | Orta | Orta |
| 10-28° | Tip IV | Esmer | Dikkat |
| -30-10° | Tip V | Kahverengi | Yüksek Risk |
| < -30° | Tip VI | Koyu | Önerilmez |

### Laser Suitability Messages
#### Safe (Green - Güvenli)
```
✅ LAZER İÇİN UYGUN
Alexandrite lazer güvenli
Bu cilt tipi için uygun
```

#### Caution (Orange - Dikkat)
```
⚠️ DİKKAT GEREKİR
Düşük enerji ayarları kullanın
Test yaması önerilir
```

#### Not Suitable (Red - Uygun Değil)
```
❌ ÖNERİLMEZ
Alexandrite lazer güvenli değil
Alternatif lazer düşünün
```

### Measurement History
- **Section Title**: "Ölçüm Geçmişi"
- **History Item Format**: "{index}. L:{L} a:{a} b:{b} → ITA:{ita}°"
- **Action Buttons**:
  - "Temizle": Clear history
  - "Yeni": New measurement

### Error Messages
#### Input Validation Errors
- **Invalid L* Value**: "Geçersiz L* değeri - 0 ile 100 arasında bir sayı girin"
- **Invalid a* Value**: "Geçersiz a* değeri - -128 ile 127 arasında bir sayı girin"
- **Invalid b* Value**: "Geçersiz b* değeri - -128 ile 127 arasında bir sayı girin"
- **Zero b* Value**: "b* değeri sıfır olamaz (sıfıra bölme hatası)"
- **Empty Field**: "Bu alan zorunludur"
- **Invalid Number**: "Lütfen geçerli bir sayı girin"

#### Calculation Errors
- **Division by Zero**: "Hesaplama yapılamıyor - b* değeri sıfır olamaz"
- **General Error**: "Hesaplama hatası - değerlerinizi kontrol edin"

### Loading States
- **Calculating**: "ITA hesaplanıyor..."
- **Loading**: "Yükleniyor..."

### Accessibility Labels (Turkish)
- **L* Input**: "L yıldız parlaklık değeri"
- **a* Input**: "a yıldız yeşil kırmızı değeri"
- **b* Input**: "b yıldız mavi sarı değeri"
- **Calculate Button**: "ITA değerini hesapla"
- **Clear Button**: "Geçmişi temizle"
- **New Measurement Button**: "Yeni ölçüm ekle"

### Professional Medical Terms
- **Colorimeter**: "Kolorimetre"
- **Laser Hair Removal**: "Lazer Epilasyon"
- **Skin Assessment**: "Cilt Değerlendirmesi"
- **Treatment Suitability**: "Tedavi Uygunluğu"
- **Energy Settings**: "Enerji Ayarları"
- **Test Patch**: "Test Yaması"
- **Technician**: "Teknisyen"

## Updated User Interface Wireframe (Turkish)

### Main Screen Layout
```
┌─────────────────────────────────┐
│  🔬 Lab'dan ITA Dönüştürücü     │ ← Header
│     Alexandrite Lazer Uygunluk  │
├─────────────────────────────────┤
│                                 │
│  📊 Lab Değerlerini Girin       │ ← Section Title
│                                 │
│  ┌─────────┬─────────┬─────────┐│
│  │L*(Parlak│a*(Y-K)  │b*(M-S)  ││ ← Input Labels
│  │  [___]  │  [___]  │  [___]  ││
│  └─────────┴─────────┴─────────┘│
│                                 │
│     [🧮 ITA Hesapla]            │ ← Calculate Button
│                                 │
├─────────────────────────────────┤
│  📋 Sonuçlar                    │ ← Results Section
│                                 │
│  ITA Değeri: 45.2°              │
│  Cilt Tipi: Tip II (Açık)      │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ✅ LAZER İÇİN UYGUN         ││ ← Status
│  │    Alexandrite Güvenli      ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  📝 Ölçüm Geçmişi              │ ← History
│                                 │
│  1. L:65 a:12 b:18 → ITA:45.2°  │
│  2. L:58 a:15 b:22 → ITA:21.8°  │
│                                 │
│     [🗑️ Temizle] [➕ Yeni]      │ ← Action Buttons
│                                 │
└─────────────────────────────────┘
```

## Implementation Notes for Turkish Support

### Character Encoding
- Use UTF-8 encoding for proper Turkish character support
- Include Turkish characters: ç, ğ, ı, ö, ş, ü, Ç, Ğ, İ, Ö, Ş, Ü

### Font Considerations
- Ensure fonts support Turkish characters
- Use system fonts that include Turkish glyphs
- Fallback fonts: "Segoe UI", "Roboto", "Arial", sans-serif

### Text Length Considerations
- Turkish text may be longer than English equivalents
- Adjust button and container widths accordingly
- Ensure responsive design accommodates longer text

### Cultural Considerations
- Use formal language appropriate for medical settings
- Follow Turkish medical terminology standards
- Maintain professional tone throughout interface

### Number Formatting
- Use Turkish decimal separator (comma) if needed
- Consider Turkish number formatting conventions
- Maintain consistency with scientific notation

## Updated Todo List for Turkish Implementation

### Additional Tasks for Turkish Support
- [ ] Implement Turkish language strings
- [ ] Update all UI text to Turkish
- [ ] Test Turkish character rendering
- [ ] Verify text length in mobile layout
- [ ] Update error messages in Turkish
- [ ] Localize number formatting if needed
- [ ] Review medical terminology accuracy
- [ ] Test with Turkish-speaking medical staff

### JavaScript Localization Structure
```javascript
const turkishStrings = {
    app: {
        title: "Lab'dan ITA Dönüştürücü",
        subtitle: "Alexandrite Lazer Uygunluk Değerlendirmesi"
    },
    inputs: {
        lStar: "L* (Parlaklık)",
        aStar: "a* (Yeşil-Kırmızı)",
        bStar: "b* (Mavi-Sarı)",
        calculate: "ITA Hesapla"
    },
    results: {
        title: "Sonuçlar",
        itaValue: "ITA Değeri",
        skinType: "Cilt Tipi"
    },
    // ... more strings
};
```

This comprehensive Turkish localization ensures your application will be fully accessible and professional for Turkish-speaking medical technicians in your laser hair removal clinic.