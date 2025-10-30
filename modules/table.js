/**
 * Table Module - Dividend Discount Calculator
 * Semantic HTML table with accessibility support
 * Displays dividends for selected model(s)
 */

import { formatCurrency, createElement } from './utils.js';
import { getModelMetadata } from './calculations.js';

/**
 * Render dividend cash flow table
 * @param {Object} calculations - All three model calculations
 * @param {string} selectedModel - Selected model ('all', 'constant', 'growth', 'changing')
 */
export function renderTable(calculations, selectedModel) {
  const tableElement = document.getElementById('data-table-element');
  
  if (!tableElement) {
    console.error('Table element not found');
    return;
  }
  
  // Clear existing content
  tableElement.innerHTML = '';
  
  // Determine which models to display
  const modelsToShow = selectedModel === 'all' 
    ? ['constant', 'growth', 'changing']
    : [selectedModel];
  
  // Get data from first model (they all have same years)
  const firstModel = calculations[modelsToShow[0]];
  if (!firstModel || !firstModel.cashFlows || firstModel.cashFlows.length === 0) {
    console.warn('No cash flow data available for table');
    return;
  }
  
  const cashFlows = firstModel.cashFlows;
  
  // Build caption
  let captionText = 'Dividend cash flows: ';
  if (selectedModel === 'all') {
    captionText += 'All three models compared. ';
  } else {
    const metadata = getModelMetadata(selectedModel);
    captionText += `${metadata.name}. `;
  }
  captionText += 'Year 0 shows initial investment (negative). Years 1-10 show expected dividend payments.';
  
  const caption = createElement('caption', { className: 'sr-only' }, captionText);
  tableElement.appendChild(caption);
  
  // Create table head
  const thead = createElement('thead');
  const headerRow = createElement('tr');
  
  // Year column
  const yearHeader = createElement('th', {
    scope: 'col',
    className: 'text-left'
  }, 'Year');
  headerRow.appendChild(yearHeader);
  
  // Model columns
  modelsToShow.forEach(modelKey => {
    const metadata = getModelMetadata(modelKey);
    const th = createElement('th', {
      scope: 'col',
      className: 'text-right'
    }, metadata.name);
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  tableElement.appendChild(thead);
  
  // Create table body
  const tbody = createElement('tbody');
  
  cashFlows.forEach((row, index) => {
    const tr = createElement('tr');
    
    // Year cell (row header)
    const yearLabel = row.year === 0 ? 'Initial' : `Year ${row.year}`;
    const yearTh = createElement('th', {
      scope: 'row',
      className: 'text-left'
    }, yearLabel);
    tr.appendChild(yearTh);
    
    // Model dividend cells
    modelsToShow.forEach(modelKey => {
      const modelData = calculations[modelKey];
      const dividend = modelData.cashFlows[index].dividend;
      
      const td = createElement('td', { className: 'text-right' });
      td.textContent = formatCurrency(dividend, true);
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });
  
  tableElement.appendChild(tbody);
  
  // Create table foot with totals (sum of all dividends)
  const tfoot = createElement('tfoot');
  const footerRow = createElement('tr');
  
  // Total row header
  const totalTh = createElement('th', {
    scope: 'row',
    className: 'text-left'
  }, 'Total Received');
  footerRow.appendChild(totalTh);
  
  // Calculate totals for each model
  modelsToShow.forEach(modelKey => {
    const modelData = calculations[modelKey];
    const total = modelData.cashFlows.reduce((sum, cf) => {
      // Only sum positive dividends (exclude initial investment)
      return sum + (cf.dividend > 0 ? cf.dividend : 0);
    }, 0);
    
    const td = createElement('td', { className: 'text-right' });
    td.textContent = formatCurrency(total);
    footerRow.appendChild(td);
  });
  
  tfoot.appendChild(footerRow);
  tableElement.appendChild(tfoot);
}