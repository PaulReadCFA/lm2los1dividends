/**
 * Results Display Module - Dividend Discount Calculator
 * Renders equity valuations for selected model(s)
 */

import { formatCurrency, createElement } from './utils.js';
import { getModelMetadata } from './calculations.js';

/**
 * Render results section
 * @param {Object} calculations - All three model calculations
 * @param {string} selectedModel - Selected model ('all', 'constant', 'growth', 'changing')
 */
export function renderResults(calculations, selectedModel) {
  const container = document.getElementById('results-content');
  
  if (!container) {
    console.error('Results container not found');
    return;
  }
  
  // Clear existing content
  container.innerHTML = '';
  
  // Determine which models to display
  const modelsToShow = selectedModel === 'all' 
    ? ['constant', 'growth', 'changing']
    : [selectedModel];
  
  // Create result boxes for each model
  modelsToShow.forEach(modelKey => {
    const modelData = calculations[modelKey];
    const metadata = getModelMetadata(modelKey);
    
    const box = createResultBox(modelData, metadata, modelKey);
    container.appendChild(box);
  });
}

/**
 * Create result box for a single model
 * @param {Object} modelData - Model calculation data
 * @param {Object} metadata - Model metadata
 * @param {string} modelKey - Model identifier
 * @returns {Element} Result box element
 */
function createResultBox(modelData, metadata, modelKey) {
  const box = createElement('div', { 
    className: `result-box model-${modelKey}` 
  });
  
  // Title
  const title = createElement('h5', { 
    className: `result-title model-${modelKey}` 
  }, metadata.name);
  box.appendChild(title);
  
  // Price value
  const valueDiv = createElement('div', {
    className: `result-value model-${modelKey}`,
    'aria-live': 'polite',
    'aria-atomic': 'true'
  });
  
  if (isFinite(modelData.price)) {
    valueDiv.textContent = formatCurrency(modelData.price);
  } else {
    valueDiv.textContent = 'Invalid';
    valueDiv.style.fontSize = '1.5rem';
  }
  
  box.appendChild(valueDiv);
  
  // Description
  const description = createElement('div', { 
    className: 'result-description' 
  }, metadata.description);
  box.appendChild(description);
  
  // Formula
  const formula = createElement('div', { 
    className: 'result-formula' 
  }, metadata.formula);
  box.appendChild(formula);
  
  return box;
}