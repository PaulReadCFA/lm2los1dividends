/**
 * Chart Module - Dividend Discount Calculator (Enhanced Accessibility)
 * Chart rendering using Chart.js with comprehensive keyboard accessibility
 * and screen reader support
 */

import { formatCurrency } from './utils.js';
import { getModelMetadata } from './calculations.js';

// Model colors matching CSS
const COLORS = {
  constant: '#2563eb',
  growth: '#16a34a',
  changing: '#9333ea',
  darkText: '#06005a'
};

let chartInstance = null;
let currentFocusIndex = 0;
let isKeyboardMode = false;

/**
 * Create or update dividend cash flow chart
 * @param {Object} calculations - All three model calculations
 * @param {string} selectedModel - Selected model ('all', 'constant', 'growth', 'changing')
 * @param {boolean} showLabels - Whether to show value labels
 */
export function renderChart(calculations, selectedModel, showLabels = true) {
  const canvas = document.getElementById('dividend-chart');
  
  if (!canvas) {
    console.error('Chart canvas not found');
    return;
  }
  
  // Enhanced accessibility attributes
  // Make canvas focusable and add keyboard navigation
 canvas.setAttribute('tabindex', '0');
canvas.setAttribute('role', 'img');
canvas.setAttribute('aria-roledescription', 'interactive chart');
canvas.setAttribute(
  'aria-label',
  'Interactive chart. Press Enter to focus, then use arrow keys to explore data points.'
);
  // Allow Enter to activate keyboard navigation from wrapper
const container = canvas.parentElement;
if (container) {
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      canvas.focus();
    }
  });
}
  
  // Enhanced aria-label with detailed keyboard instructions
  const modelDescription = selectedModel === 'all' 
    ? 'comparing all three dividend discount models' 
    : `showing ${selectedModel} model`;
  
  canvas.setAttribute('aria-label', 
    `Interactive dividend cash flow bar chart ${modelDescription}. ` +
    'Press Tab to focus the chart, then use Left and Right arrow keys to navigate between years. ' +
    'Press Home to jump to the first year, End to jump to the last year. ' +
    'Press T to toggle between chart and table view. ' +
    'Current data point information will be announced as you navigate.'
  );
  
  const ctx = canvas.getContext('2d');
  
  // Determine which models to display
  const modelsToShow = selectedModel === 'all' 
    ? ['constant', 'growth', 'changing']
    : [selectedModel];
  
  // Get data from first model (they all have same years)
  const firstModel = calculations[modelsToShow[0]];
  if (!firstModel || !firstModel.cashFlows || firstModel.cashFlows.length === 0) {
    console.warn('No cash flow data available');
    return;
  }
  
  const labels = firstModel.cashFlows.map(cf => cf.yearLabel);
  
  // Build datasets for selected models
  const datasets = modelsToShow.map(modelKey => {
    const modelData = calculations[modelKey];
    const metadata = getModelMetadata(modelKey);
    
    return {
      label: metadata.name,
      data: modelData.cashFlows.map(cf => cf.dividend),
      backgroundColor: COLORS[modelKey],
      borderColor: '#333',
      borderWidth: 1
    };
  });
  
  // Destroy existing chart instance
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Reset focus index
  currentFocusIndex = 0;
  
  // Create new chart
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
onHover: (event, activeElements) => {
  // Skip if keyboard focus already active
  if (isKeyboardMode && document.activeElement === canvas) return;

  // Announce hovered data point for screen readers
  if (activeElements.length > 0) {
    const index = activeElements[0].index;
    const firstModel = calculations[
      selectedModel === 'all' ? 'constant' : selectedModel
    ];
    const cashFlow = firstModel.cashFlows[index];
    announceDataPoint(cashFlow, calculations, selectedModel);
  }
}

,
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: false // Using custom legend in HTML
        },
        tooltip: {
          callbacks: {
            title: (context) => {
              const index = context[0].dataIndex;
              return index === 0 ? 'Initial Investment' : `Year ${labels[index]}`;
            },
            label: (context) => {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${formatCurrency(Math.abs(value))}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Years'
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cash Flow ($)'
          },
          ticks: {
            callback: function(value) {
              return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value);
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      layout: {
        padding: {
          left: 20,
          right: 30,
          top: showLabels && selectedModel !== 'all' ? 40 : 20,
          bottom: 60
        }
      }
    },
    plugins: [
      {
        // Custom plugin to draw labels on top of bars (only for single model view)
        id: 'barLabels',
        afterDatasetsDraw: (chart) => {
          if (!showLabels || selectedModel === 'all' || datasets[0].data.length > 10) return;
          
          const ctx = chart.ctx;
          ctx.save();
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = COLORS.darkText;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          
          const meta = chart.getDatasetMeta(0);
          
          chart.data.labels.forEach((label, index) => {
            const value = datasets[0].data[index];
            if (Math.abs(value) < 0.01) return;
            
            if (!meta.data[index]) return;
            
            const bar = meta.data[index];
            const x = bar.x;
            const y = value < 0 ? bar.y + 30 : bar.y - 5;
            
            ctx.fillText(formatCurrency(Math.abs(value)), x, y);
          });
          
          ctx.restore();
        }
      },
      {
        // Outer borders plugin
        id: 'outerBorders',
        afterDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;

          chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((bar) => {
              const x = bar.x - bar.width / 2;
              const y = Math.min(bar.y, bar.base);
              const width = bar.width;
              const height = Math.abs(bar.base - bar.y);

              ctx.strokeRect(x, y, width, height);
            });
          });

          ctx.restore();
        }
      },
      {
        // Enhanced keyboard focus highlight plugin with better visibility
        id: 'keyboardFocus',
        afterDatasetsDraw: (chart) => {
          if (document.activeElement !== canvas) return;
          
          const ctx = chart.ctx;
          const meta = chart.getDatasetMeta(0);
          
          if (!meta.data[currentFocusIndex]) return;
          
          const bar = meta.data[currentFocusIndex];
          
          // Draw enhanced focus indicator with better contrast
          ctx.save();
          ctx.strokeStyle = COLORS.darkText;
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          
          const x = bar.x - bar.width / 2 - 4;
          const y = Math.min(bar.y, bar.base) - 4;
          const width = bar.width + 8;
          const height = Math.abs(bar.base - bar.y) + 8;
          
          ctx.strokeRect(x, y, width, height);
          
          // Add filled background for even better visibility
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = COLORS.darkText;
          ctx.fillRect(x, y, width, height);
          
          ctx.restore();
        }
      }
    ]
  });
  
  // Add enhanced keyboard navigation with shortcuts
  setupEnhancedKeyboardNavigation(canvas, firstModel.cashFlows, calculations, selectedModel);
}

/**
 * Setup enhanced keyboard navigation for the chart
 * @param {HTMLCanvasElement} canvas - The chart canvas
 * @param {Array} cashFlows - Array of cash flow objects
 * @param {Object} calculations - All calculations
 * @param {string} selectedModel - Selected model
 */
function setupEnhancedKeyboardNavigation(canvas, cashFlows, calculations, selectedModel) {
  // Remove existing listeners to avoid duplicates
  const oldListener = canvas._keydownListener;
  if (oldListener) {
    canvas.removeEventListener('keydown', oldListener);
  }
  
  // Create new listener with enhanced shortcuts
  const keydownListener = (e) => {
    const maxIndex = cashFlows.length - 1;
    let newIndex = currentFocusIndex;
    
    // Enable keyboard mode on any arrow key press
    isKeyboardMode = true;
    
    switch(e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(currentFocusIndex + 1, maxIndex);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(currentFocusIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = maxIndex;
        break;
      case 't':
      case 'T':
        e.preventDefault();
        toggleTableView();
        announceViewChange('table');
        return;
      case 'c':
      case 'C':
        e.preventDefault();
        toggleChartView();
        announceViewChange('chart');
        return;
      case 'h':
      case 'H':
      case '?':
        e.preventDefault();
        showKeyboardHelp();
        return;
      default:
        return;
    }
    
    if (newIndex !== currentFocusIndex) {
      currentFocusIndex = newIndex;
      chartInstance.update('none');
      announceDataPoint(cashFlows[currentFocusIndex], calculations, selectedModel);
      showTooltipAtIndex(currentFocusIndex);
    }
  };
  
  // Store listener reference for cleanup
  canvas._keydownListener = keydownListener;
  canvas.addEventListener('keydown', keydownListener);
  
  // Focus handler
  const focusListener = () => {
    isKeyboardMode = true;
    showTooltipAtIndex(currentFocusIndex);
    announceDataPoint(cashFlows[currentFocusIndex], calculations, selectedModel);
  };
  
  const blurListener = () => {
    chartInstance.tooltip.setActiveElements([], {x: 0, y: 0});
    chartInstance.update('none');
  };
  
  canvas._focusListener = focusListener;
  canvas._blurListener = blurListener;
  canvas.addEventListener('focus', focusListener);
  canvas.addEventListener('blur', blurListener);
  
  // Disable keyboard mode when mouse moves over chart
  const mouseMoveListener = () => {
    isKeyboardMode = false;
  };
  
  canvas._mouseMoveListener = mouseMoveListener;
  canvas.addEventListener('mousemove', mouseMoveListener);
}

/**
 * Toggle to table view
 */
function toggleTableView() {
  const tableBtn = document.getElementById('view-table-btn');
  if (tableBtn && !tableBtn.classList.contains('active')) {
    tableBtn.click();
  }
}

/**
 * Toggle to chart view
 */
function toggleChartView() {
  const chartBtn = document.getElementById('view-chart-btn');
  if (chartBtn && !chartBtn.classList.contains('active')) {
    chartBtn.click();
  }
}

/**
 * Show keyboard help
 */
function showKeyboardHelp() {
  // Try to focus keyboard help section if it exists
  const helpSection = document.getElementById('keyboard-help');
  if (helpSection) {
    helpSection.focus();
    helpSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    announceMessage('Keyboard help displayed');
  } else {
    // If no help section, announce available shortcuts
    announceMessage(
      'Keyboard shortcuts: Arrow keys to navigate data points. ' +
      'Home and End to jump to first or last year. ' +
      'T for table view, C for chart view.'
    );
  }
}

/**
 * Announce view change to screen readers
 * @param {string} view - View name ('chart' or 'table')
 */
function announceViewChange(view) {
  announceMessage(`Switched to ${view} view`);
}

/**
 * Announce a message to screen readers
 * @param {string} message - Message to announce
 */
function announceMessage(message) {
  let liveRegion = document.getElementById('chart-message-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'chart-message-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  liveRegion.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}

/**
 * Show tooltip at a specific data index
 * @param {number} index - Data point index
 */
function showTooltipAtIndex(index) {
  if (!chartInstance) return;
  
  const activeElements = chartInstance.data.datasets.map((dataset, datasetIndex) => ({
    datasetIndex,
    index
  }));
  
  const meta = chartInstance.getDatasetMeta(0);
  if (!meta.data[index]) return;
  
  chartInstance.tooltip.setActiveElements(activeElements, {
    x: meta.data[index].x,
    y: meta.data[index].y
  });
  
  chartInstance.update('none');
}

/**
 * Announce data point for screen readers with enhanced context
 * @param {Object} cashFlow - Cash flow object
 * @param {Object} calculations - All calculations
 * @param {string} selectedModel - Selected model
 */
function announceDataPoint(cashFlow, calculations, selectedModel) {
  let liveRegion = document.getElementById('chart-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'chart-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  const year = cashFlow.year;
  const yearLabel = year === 0 ? 'Initial investment' : `Year ${year}`;
  const totalYears = calculations[selectedModel === 'all' ? 'constant' : selectedModel].cashFlows.length - 1;
  const position = `${year} of ${totalYears}`;
  
  let announcement = `${yearLabel}, position ${position}. `;
  
  if (selectedModel === 'all') {
    const constantDiv = calculations.constant.cashFlows[year].dividend;
    const growthDiv = calculations.growth.cashFlows[year].dividend;
    const changingDiv = calculations.changing.cashFlows[year].dividend;
    
    announcement += `Constant dividend model: ${formatCurrency(Math.abs(constantDiv))}. `;
    announcement += `Constant growth model: ${formatCurrency(Math.abs(growthDiv))}. `;
    announcement += `Changing growth model: ${formatCurrency(Math.abs(changingDiv))}.`;
  } else {
    const modelName = getModelMetadata(selectedModel).name;
    announcement += `${modelName}: ${formatCurrency(Math.abs(cashFlow.dividend))}.`;
  }
  
  liveRegion.textContent = announcement;
}

/**
 * Update chart visibility based on window width
 * @returns {boolean} True if labels should be shown
 */
export function shouldShowLabels() {
  return window.innerWidth > 860;
}

/**
 * Cleanup chart resources
 */
export function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}