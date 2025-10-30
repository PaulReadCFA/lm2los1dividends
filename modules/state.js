/**
 * State Management Module
 * Simple observable state pattern for reactive updates
 */

export const state = {
  // Input values
  D0: 5,                    // Current dividend
  required: 10,             // Required return (percentage)
  gConst: 5,                // Constant growth rate (percentage)
  gShort: 5,                // Short-term growth rate (percentage)
  gLong: 3,                 // Long-term growth rate (percentage)
  shortYears: 5,            // Years of high growth
  
  // Model selection
  selectedModel: 'all', // 'constant' | 'growth' | 'changing' | 'all'
  
  // UI state
  viewMode: 'chart',        // 'chart' | 'table'
  
  // Calculated values
  calculations: null,       // All three model calculations
  
  // Validation errors
  errors: {},
  
  // Listeners for state changes
  listeners: []
};

/**
 * Update state and notify listeners
 * @param {Object} updates - Object with state properties to update
 */
export function setState(updates) {
  Object.assign(state, updates);
  notifyListeners();
}

/**
 * Subscribe to state changes
 * @param {Function} callback - Function to call when state changes
 * @returns {Function} Unsubscribe function
 */
export function subscribe(callback) {
  state.listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = state.listeners.indexOf(callback);
    if (index > -1) {
      state.listeners.splice(index, 1);
    }
  };
}

/**
 * Notify all listeners of state change
 */
function notifyListeners() {
  state.listeners.forEach(callback => {
    try {
      callback(state);
    } catch (error) {
      console.error('Error in state listener:', error);
    }
  });
}

/**
 * Get current state (read-only)
 * @returns {Object} Current state
 */
export function getState() {
  return { ...state };
}