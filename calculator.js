/**
 * Dividend Discount Model Calculator - Main Entry Point
 * CFA Institute - Vanilla JavaScript Implementation
 * 
 * This calculator demonstrates equity valuation using three dividend models:
 * 1. Constant Dividend Model
 * 2. Constant Growth Model (Gordon Growth Model)
 * 3. Changing Growth Model (Two-Stage Model)
 */

import { state, setState, subscribe } from './modules/state.js';
import { calculateAllModels } from './modules/calculations.js';
import { 
  validateAllInputs,
  validateField,
  updateFieldError,
  updateValidationSummary,
  hasErrors 
} from './modules/validation.js';
import { 
  $,
  listen,
  focusElement,
  announceToScreenReader,
  debounce 
} from './modules/utils.js';
import { renderChart, shouldShowLabels, destroyChart } from './modules/chart.js';
import { renderTable } from './modules/table.js';
import { renderResults } from './modules/results.js';

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the calculator when DOM is ready
 */
function init() {
  console.log('Dividend Discount Calculator initializing...');
  
  // Set up input event listeners
  setupInputListeners();
  
  // Set up model selector
  setupModelSelector();
  
  // Set up view toggle listeners
  setupViewToggle();
  
  // Set up skip link handlers
  setupSkipLinks();
  
  // Set up window resize listener for chart labels
  setupResizeListener();
  
  // Subscribe to state changes
  subscribe(handleStateChange);
  
  // Initial calculation
  updateCalculations();
  
  // Run self-tests
  runSelfTests();
  
  console.log('Dividend Discount Calculator ready');
}

/**
 * Set up skip link handlers for accessibility
 */
function setupSkipLinks() {
  const skipToTable = document.querySelector('a[href="#data-table"]');
  
  if (skipToTable) {
    listen(skipToTable, 'click', (e) => {
      e.preventDefault();
      
      if (state.viewMode !== 'table') {
        switchView('table');
      } else {
        focusElement($('#data-table-element'), 100);
      }
      
      const section = $('#data-table');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

// =============================================================================
// INPUT HANDLING
// =============================================================================

/**
 * Set up event listeners for input fields
 */
function setupInputListeners() {
  const inputs = [
    { id: 'D0', field: 'D0' },
    { id: 'required', field: 'required' },
    { id: 'gConst', field: 'gConst' },
    { id: 'gShort', field: 'gShort' },
    { id: 'gLong', field: 'gLong' },
    { id: 'shortYears', field: 'shortYears' }
  ];
  
  inputs.forEach(({ id, field }) => {
    const input = $(`#${id}`);
    if (!input) return;
    
    const debouncedUpdate = debounce(() => {
      const value = parseFloat(input.value);
      
      // Validate field
      const error = validateField(field, value);
      updateFieldError(id, error);
      
      // Update state
      const errors = { ...state.errors };
      if (error) {
        errors[field] = error;
      } else {
        delete errors[field];
      }
      
      setState({
        [field]: value,
        errors
      });
      
      // Update validation summary
      updateValidationSummary(errors);
      
      // Recalculate if no errors
      if (!hasErrors(errors)) {
        updateCalculations();
      }
    }, 300);
    
    listen(input, 'input', debouncedUpdate);
    listen(input, 'change', debouncedUpdate);
  });
}

/**
 * Update calculations based on current state
 */
function updateCalculations() {
  const { D0, required, gConst, gShort, gLong, shortYears, errors } = state;
  
  // Don't calculate if there are validation errors
  if (hasErrors(errors)) {
    setState({ calculations: null });
    return;
  }
  
  try {
    // Calculate all three models
    const calculations = calculateAllModels({
      D0,
      required: required / 100,
      gConst: gConst / 100,
      gShort: gShort / 100,
      gLong: gLong / 100,
      shortYears
    });
    
    // Update state with calculations
    setState({ calculations });
    
  } catch (error) {
    console.error('Calculation error:', error);
    setState({ calculations: null });
  }
}

// =============================================================================
// MODEL SELECTOR
// =============================================================================

/**
 * Set up model selector buttons
 */
function setupModelSelector() {
  const modelButtons = [
    { id: 'model-all-btn', model: 'all' },
    { id: 'model-constant-btn', model: 'constant' },
    { id: 'model-growth-btn', model: 'growth' },
    { id: 'model-changing-btn', model: 'changing' }
  ];
  
  modelButtons.forEach(({ id, model }) => {
    const btn = $(`#${id}`);
    if (!btn) return;
    
    listen(btn, 'click', () => selectModel(model));
  });
}

/**
 * Select a model and update UI
 * @param {string} model - Model identifier
 */
function selectModel(model) {
  // Update button states
  const allButtons = document.querySelectorAll('.model-btn');
  allButtons.forEach(btn => {
    const btnModel = btn.getAttribute('data-model');
    if (btnModel === model) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    }
  });
  
  // Update state
  setState({ selectedModel: model });
  
  // Announce change
  const modelNames = {
    'all': 'All models',
    'constant': 'Constant dividend model',
    'growth': 'Constant growth model',
    'changing': 'Changing growth model'
  };
  announceToScreenReader(`${modelNames[model]} selected`);
}

// =============================================================================
// VIEW TOGGLE (CHART/TABLE)
// =============================================================================

/**
 * Set up chart/table view toggle
 */
function setupViewToggle() {
  const chartBtn = $('#chart-view-btn');
  const tableBtn = $('#table-view-btn');
  
  if (!chartBtn || !tableBtn) {
    console.error('Toggle buttons not found');
    return;
  }
  
  listen(chartBtn, 'click', () => switchView('chart'));
  listen(tableBtn, 'click', () => switchView('table'));
}

/**
 * Switch between chart and table views
 * @param {string} view - 'chart' or 'table'
 */
function switchView(view) {
  const chartBtn = $('#chart-view-btn');
  const tableBtn = $('#table-view-btn');
  const chartContainer = $('#chart-container');
  const tableContainer = $('#table-container');
  const legend = $('#chart-legend');
  
  // Update state
  setState({ viewMode: view });
  
  // Update button states
  if (view === 'chart') {
    chartBtn.classList.add('active');
    chartBtn.setAttribute('aria-pressed', 'true');
    tableBtn.classList.remove('active');
    tableBtn.setAttribute('aria-pressed', 'false');
    
    // Show chart, hide table
    chartContainer.style.display = 'block';
    tableContainer.style.display = 'none';
    legend.style.display = 'flex';
    
    // Announce change
    announceToScreenReader('Chart view active');
    
    // Focus chart container
    focusElement(chartContainer, 100);
    
    // Re-render chart
    if (state.calculations) {
      const showLabels = shouldShowLabels();
      renderChart(state.calculations, state.selectedModel, showLabels);
    }
    
  } else {
    tableBtn.classList.add('active');
    tableBtn.setAttribute('aria-pressed', 'true');
    chartBtn.classList.remove('active');
    chartBtn.setAttribute('aria-pressed', 'false');
    
    // Show table, hide chart
    tableContainer.style.display = 'block';
    chartContainer.style.display = 'none';
    legend.style.display = 'none';
    
    // Announce change
    announceToScreenReader('Table view active');
    
    // Focus table
    focusElement($('#data-table-element'), 100);
    
    // Destroy chart to save resources
    destroyChart();
  }
}

// =============================================================================
// RENDERING
// =============================================================================

/**
 * Handle state changes and update UI
 * @param {Object} newState - Updated state
 */
function handleStateChange(newState) {
  const { calculations, viewMode, selectedModel } = newState;
  
  if (!calculations) {
    // Clear displays if no calculations
    return;
  }
  
  // Update results section
  renderResults(calculations, selectedModel);
  
  // Update chart if in chart view
  if (viewMode === 'chart') {
    const showLabels = shouldShowLabels();
    renderChart(calculations, selectedModel, showLabels);
  }
  
  // Update table if in table view
  if (viewMode === 'table') {
    renderTable(calculations, selectedModel);
  }
}

// =============================================================================
// WINDOW RESIZE HANDLING
// =============================================================================

/**
 * Set up window resize listener for responsive chart labels
 */
function setupResizeListener() {
  let resizeTimeout;
  
  listen(window, 'resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (state.viewMode === 'chart' && state.calculations) {
        const showLabels = shouldShowLabels();
        renderChart(state.calculations, state.selectedModel, showLabels);
      }
    }, 250);
  });
}

// =============================================================================
// SELF-TESTS
// =============================================================================

/**
 * Run self-tests to verify calculations
 */
function runSelfTests() {
  console.log('Running self-tests...');
  
  const tests = [
    {
      name: 'Constant dividend model - basic',
      inputs: { D0: 5, required: 0.1, gConst: 0, gShort: 0, gLong: 0, shortYears: 5 },
      expected: { constant: 50 }
    },
    {
      name: 'Gordon growth model - basic',
      inputs: { D0: 4, required: 0.1, gConst: 0.05, gShort: 0.05, gLong: 0.03, shortYears: 5 },
      expected: { growth: 84 } // D1 = 4.2, (4.2 / 0.05) = 84
    },
    {
      name: 'Growth must be less than required return',
      inputs: { D0: 5, required: 0.05, gConst: 0.1, gShort: 0.1, gLong: 0.1, shortYears: 5 },
      expected: { constantInvalid: true, growthInvalid: true, changingInvalid: true }
    }
  ];
  
  tests.forEach(test => {
    try {
      const result = calculateAllModels(test.inputs);
      
      if (test.expected.constant !== undefined) {
        const diff = Math.abs(result.constant.price - test.expected.constant);
        if (diff <= 0.1) {
          console.log(`✓ ${test.name} passed`);
        } else {
          console.warn(`✗ ${test.name} failed: expected ${test.expected.constant}, got ${result.constant.price.toFixed(2)}`);
        }
      }
      
      if (test.expected.growth !== undefined) {
        const diff = Math.abs(result.growth.price - test.expected.growth);
        if (diff <= 0.1) {
          console.log(`✓ ${test.name} passed`);
        } else {
          console.warn(`✗ ${test.name} failed: expected ${test.expected.growth}, got ${result.growth.price.toFixed(2)}`);
        }
      }
      
      if (test.expected.constantInvalid) {
        if (!isFinite(result.constant.price)) {
          console.log(`✓ ${test.name} (constant) passed - correctly invalid`);
        } else {
          console.warn(`✗ ${test.name} (constant) failed - should be invalid`);
        }
      }
      
    } catch (error) {
      console.error(`✗ ${test.name} threw error:`, error);
    }
  });
  
  console.log('Self-tests complete');
}

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Cleanup function (called on page unload)
 */
function cleanup() {
  destroyChart();
  console.log('Calculator cleanup complete');
}

// Register cleanup
window.addEventListener('beforeunload', cleanup);

// =============================================================================
// START THE APPLICATION
// =============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential external use
export { state, setState, updateCalculations };