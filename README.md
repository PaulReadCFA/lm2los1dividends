# Dividend Discount Model Calculator

A fully accessible vanilla JavaScript implementation of the Dividend Discount Model calculator for the CFA Institute. This calculator demonstrates three equity valuation models:

1. **Constant Dividend Model** - Assumes dividends remain constant forever (P = D₀ ÷ r)
2. **Constant Growth Model** (Gordon Growth Model) - Assumes constant dividend growth rate (P = D₁ ÷ (r - g))
3. **Changing Growth Model** (Two-stage) - High growth initially, then sustainable growth (PV high growth + Terminal value)

## Features

- ✅ Three dividend discount models with real-time calculations
- ✅ Interactive visualization with Chart.js (chart and table views)
- ✅ Full WCAG 2.1 AA accessibility compliance
- ✅ Responsive design (mobile and desktop layouts)
- ✅ Real-time input validation
- ✅ Model comparison view
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ Zero dependencies (except Chart.js for visualization)

## Quick Start

### Option 1: Simple HTTP Server (Recommended)

```bash
# Navigate to the calculator directory
cd dividend-calculator

# Start a local server (Python 3)
python3 -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js
npx http-server -p 8000
```

Then open http://localhost:8000 in your browser.

### Option 2: Direct File Opening

Simply open `index.html` in a modern web browser. Note: Some browsers may have CORS restrictions with ES6 modules when opening files directly.

## File Structure

```
dividend-calculator/
├── index.html              # Main HTML structure
├── styles.css              # Complete styling
├── calculator.js           # Main orchestration
└── modules/
    ├── state.js           # State management
    ├── calculations.js    # Dividend discount model logic
    ├── utils.js           # Utility functions
    ├── results.js         # Results display
    └── chart.js           # Chart and table rendering
```

## Usage

### Input Parameters

**Required:**
- **Current Dividend (D₀)**: Most recent dividend payment ($)
- **Required Return**: Investor's required rate of return (%)

**Model-Specific:**
- **Constant Growth**: Dividend growth rate for Gordon Growth Model (%)
- **Short-term Growth**: Initial high growth rate for Changing Growth Model (%)
- **Long-term Growth**: Sustainable growth rate for Changing Growth Model (%)
- **High Growth Years**: Number of years of high growth

### Model Selection

Use the model selector buttons to view:
- **All**: Compare all three models side-by-side
- **Constant**: Constant dividend model only
- **Growth**: Constant growth model only (Gordon)
- **Changing**: Two-stage growth model only

### View Toggle

Switch between:
- **Chart View**: Visual bar chart of cash flows over 10 years
- **Table View**: Accessible data table with all values

## Accessibility Features

This calculator meets WCAG 2.1 Level AA standards:

### Keyboard Navigation
- **Tab**: Navigate through all interactive elements
- **Enter/Space**: Activate buttons
- **Arrow keys**: Navigate within button groups
- All interactive elements have visible focus indicators

### Screen Reader Support
- Semantic HTML structure (`<main>`, `<section>`, headings)
- ARIA labels and descriptions for all interactive elements
- Live regions announce dynamic content changes
- Chart has text alternative (data table)
- All form inputs properly labeled

### Visual Accessibility
- Color contrast ratios meet WCAG AA (4.5:1 minimum)
- Information conveyed beyond color alone (borders, text)
- Supports 200% zoom without horizontal scrolling
- Reduced motion support

### Input Validation
- Real-time validation with helpful error messages
- `aria-invalid` attributes update dynamically
- Error summary for screen readers
- Required fields clearly marked

## Validation Rules

The calculator validates:
- Growth rates must be less than required return
- Dividend must be positive
- Required return must be positive
- All numeric inputs must be valid numbers

Invalid inputs are highlighted with error messages explaining the issue.

## Browser Support

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- ES6 module support
- CSS Grid and Flexbox
- Chart.js 4.4.0 (loaded from CDN)

## Technical Details

### Architecture

**State Management**: Observable pattern with subscription system
- Single source of truth for all application state
- Reactive updates when state changes
- Clean separation of concerns

**Calculations**: Pure functions with no side effects
- Dividend discount model implementations
- Independent calculation modules
- Easy to test and verify

**Rendering**: Declarative updates
- State changes trigger UI updates
- No direct DOM manipulation in business logic
- Uses Chart.js for visualization

### Performance

- Debounced input handlers (300ms)
- Single chart instance (destroyed/recreated on updates)
- Minimal DOM updates
- No memory leaks

## Customization

### Changing Horizon Years

Edit `modules/calculations.js`:

```javascript
const horizonYears = 10; // Change to desired number
```

### Modifying Colors

Edit `styles.css` CSS variables:

```css
:root {
  --color-constant: #2563eb;  /* Blue */
  --color-growth: #16a34a;    /* Green */
  --color-changing: #9333ea;  /* Purple */
}
```

### Adjusting Validation Rules

Edit validation logic in `modules/calculations.js`:

```javascript
if (gConst >= required) {
  errors.gConst = 'Growth rate must be less than required return';
}
```

## Troubleshooting

**Calculator doesn't load:**
- Check browser console for errors
- Ensure you're using a local server (not file://)
- Verify Chart.js CDN is accessible

**Chart not displaying:**
- Check that Chart.js loaded successfully
- Verify no console errors
- Try refreshing the page

**Inputs not updating:**
- Check browser console for JavaScript errors
- Ensure all module files are present
- Verify correct file paths

## Development

### Adding New Features

1. Create new module in `modules/` directory
2. Import into `calculator.js`
3. Add to state management if needed
4. Update UI rendering functions
5. Test accessibility with keyboard and screen reader

### Testing Accessibility

```bash
# Automated testing
- Run axe DevTools browser extension
- Check WAVE accessibility tool
- Validate HTML (https://validator.w3.org/)

# Manual testing
- Tab through all controls
- Test with NVDA/JAWS (Windows) or VoiceOver (Mac)
- Zoom to 200% and verify layout
- Test with keyboard only
```

## License

Copyright © 2025 CFA Institute. All rights reserved.

This calculator is for educational purposes as part of the CFA Program curriculum.

## Support

For issues or questions:
- Review the documentation above
- Check browser console for errors
- Verify all files are present and accessible
- Ensure using a modern browser with ES6 support

## Version History

**v1.0.0** - Initial vanilla JavaScript implementation
- Converted from React
- Full accessibility compliance
- Three dividend discount models
- Chart and table views
- Responsive design

---

**Built with ❤️ for the CFA Institute**
**Accessibility-first, education-focused**
