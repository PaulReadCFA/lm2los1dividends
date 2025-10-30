# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                        (index.html)                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Global     │  │   Results    │  │   Visualization     │  │
│  │   Errors     │  │   Section    │  │   Section           │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │               Calculator Inputs                            ││
│  │   (Model Selector + Input Fields + Validation)             ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ DOM Events
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    calculator.js (Orchestration)                │
│                                                                 │
│  • Initialize app                                              │
│  • Set up event listeners                                      │
│  • Coordinate modules                                          │
│  • Handle state changes                                        │
│  • Manage view toggling                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     State Management      │   │   Event Handling          │
│     (modules/state.js)    │   │   (calculator.js)         │
│                           │   │                           │
│  • Observable pattern     │   │  • Input changes          │
│  • Single source of truth │   │  • Model selection        │
│  • Notify listeners       │   │  • View toggle            │
└───────────────────────────┘   │  • Tooltips               │
                ▲               └───────────────────────────┘
                │                           │
                │ setState()                │ trigger
                │                           │
                └───────────┬───────────────┘
                            │
                ┌───────────┴────────────┐
                │                        │
                ▼                        ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   Business Logic        │   │   Rendering             │
│   (modules/            │   │   (modules/             │
│    calculations.js)     │   │    results.js,          │
│                         │   │    chart.js)            │
│  • Dividend models      │   │                         │
│  • Pure functions       │   │  • Results display      │
│  • Validation rules     │   │  • Chart rendering      │
│  • Price calculations   │   │  • Table generation     │
└─────────────────────────┘   └─────────────────────────┘
                ▲                        ▲
                │                        │
                └────────┬───────────────┘
                         │
                         │ uses
                         │
                ┌────────▼─────────┐
                │  Utilities       │
                │  (modules/       │
                │   utils.js)      │
                │                  │
                │  • formatCurrency│
                │  • DOM helpers   │
                │  • createElement │
                │  • debounce      │
                └──────────────────┘
```

## Data Flow

```
User Input
    │
    ├─→ Input Handler (debounced)
    │       │
    │       ├─→ setState({ field: value })
    │       │
    │       └─→ updateCalculations()
    │               │
    │               ├─→ buildDividendSeries()
    │               │       │
    │               │       ├─→ Calculate Constant Model
    │               │       ├─→ Calculate Growth Model
    │               │       └─→ Calculate Changing Model
    │               │
    │               └─→ setState({ results: {...} })
    │
    └─→ State Change Notification
            │
            └─→ handleStateChange()
                    │
                    ├─→ Check for errors
                    │   │
                    │   ├─→ If errors:
                    │   │       └─→ Show error summary
                    │   │
                    │   └─→ If no errors:
                    │           ├─→ renderResults()
                    │           ├─→ renderChartSection()
                    │           └─→ renderChart()
                    │
                    └─→ Update UI
```

## Module Dependencies

```
calculator.js
    │
    ├─→ state.js (no dependencies)
    │
    ├─→ calculations.js (no dependencies)
    │       └─→ Pure calculation functions
    │
    ├─→ utils.js (no dependencies)
    │       └─→ Helper functions
    │
    ├─→ results.js
    │       ├─→ utils.js
    │       └─→ calculations.js
    │
    └─→ chart.js
            ├─→ utils.js
            ├─→ calculations.js
            └─→ Chart.js (external CDN)
```

## File Responsibilities

### index.html
- Semantic HTML structure
- Accessibility markup (ARIA, skip links)
- Input fields with labels
- Container elements for dynamic content

### styles.css
- CFA brand colors (CSS variables)
- Responsive layouts (mobile/desktop)
- Accessibility styles (focus indicators, sr-only)
- Component styling (cards, buttons, inputs)

### calculator.js
- Application initialization
- Event listener setup
- State subscription
- View coordination
- User interaction handling

### modules/state.js
- Observable state pattern
- State updates (setState)
- Listener notifications
- Single source of truth

### modules/calculations.js
- Dividend discount models
- Price calculations
- Validation logic
- Data series generation
- Pure functions (no side effects)

### modules/utils.js
- Currency formatting
- DOM manipulation helpers
- Element creation
- Event handling
- Debouncing

### modules/results.js
- Results display rendering
- All models view
- Single model view
- Result box creation

### modules/chart.js
- Chart.js integration
- Chart rendering
- Table generation
- Legend creation
- View toggle setup

## Component Lifecycle

```
1. Page Load
   └─→ DOMContentLoaded event
       └─→ init()
           ├─→ setupInputListeners()
           ├─→ setupModelSelector()
           ├─→ setupTooltips()
           ├─→ subscribe(handleStateChange)
           └─→ updateCalculations() (initial)

2. User Input
   └─→ Input change (debounced 300ms)
       └─→ setState({ field: value })
           └─→ updateCalculations()
               └─→ buildDividendSeries()
                   └─→ setState({ results: {...} })
                       └─→ notifyListeners()
                           └─→ handleStateChange()
                               ├─→ renderResults()
                               ├─→ renderChartSection()
                               └─→ renderChart()

3. Model Selection
   └─→ Button click
       └─→ setState({ selectedModel: model })
           └─→ notifyListeners()
               └─→ handleStateChange()
                   └─→ Re-render with new model

4. View Toggle
   └─→ Button click
       └─→ switchView(view)
           ├─→ Update button states
           ├─→ Show/hide containers
           ├─→ Announce to screen reader
           └─→ Move focus to new content

5. Cleanup
   └─→ beforeunload event
       └─→ cleanup()
           └─→ destroyChart()
```

## Key Design Patterns

### 1. Observable State Pattern
```javascript
const state = { /* data */ };
const listeners = [];

function setState(updates) {
  Object.assign(state, updates);
  notifyListeners();
}
```

### 2. Pure Functions (Calculations)
```javascript
// No side effects, always same output for same input
export function buildDividendSeries({ D0, required, ... }) {
  // ... calculations
  return { data, prices, errors };
}
```

### 3. Composition (Utils)
```javascript
// Small, reusable functions
export function formatCurrency(amount) { /* ... */ }
export function createElement(tag, attrs, ...children) { /* ... */ }
```

### 4. Separation of Concerns
- **State**: What data exists
- **Calculations**: How data is computed
- **Rendering**: How data is displayed
- **Events**: How user interacts

## Accessibility Architecture

```
Keyboard Navigation
    │
    ├─→ Skip Links (bypass navigation)
    │       ├─→ Skip to calculator
    │       ├─→ Skip to results
    │       └─→ Skip to visualization
    │
    ├─→ Tab Order
    │       ├─→ Model selector buttons
    │       ├─→ Input fields
    │       ├─→ Info icons (tooltips)
    │       └─→ View toggle buttons
    │
    └─→ Focus Management
            ├─→ Visible focus indicators
            ├─→ Focus moves to revealed content
            └─→ No focus traps

Screen Reader Support
    │
    ├─→ Semantic HTML
    │       ├─→ <main>, <section>
    │       ├─→ Proper heading hierarchy
    │       └─→ Semantic tables
    │
    ├─→ ARIA Attributes
    │       ├─→ aria-live (dynamic content)
    │       ├─→ aria-pressed (toggles)
    │       ├─→ aria-invalid (validation)
    │       ├─→ aria-describedby (associations)
    │       └─→ role="img" (chart)
    │
    └─→ Hidden Descriptions
            ├─→ Chart descriptions
            ├─→ Table captions
            └─→ Tooltip text
```

## Performance Considerations

1. **Debouncing**: Input handlers delayed 300ms
2. **Single Chart Instance**: Destroyed and recreated (not multiple instances)
3. **Minimal DOM Updates**: Only update what changed
4. **Pure Calculations**: Memoization possible (currently recalculates)
5. **Event Delegation**: Could be used for repeated elements

## Future Enhancement Opportunities

1. Add calculation memoization for performance
2. Add animation for view transitions
3. Export results to CSV/PDF
4. Save/load calculator state
5. Add more dividend models
6. Multi-language support
7. Dark mode theme

---

**Architecture designed for:**
- ✅ Maintainability
- ✅ Testability
- ✅ Accessibility
- ✅ Performance
- ✅ Extensibility
