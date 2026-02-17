// options.js - Handle options page functionality

// Constants
const STATUS_DISPLAY_DURATION_MS = 2000;

// DOM elements
let apiKeyInput, eventTypeSelect, timestampInput, sourceSelect, externalIdInput;
let saveApiKeyBtn, simulateEventBtn, statusDiv;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  apiKeyInput = document.getElementById('apiKey');
  eventTypeSelect = document.getElementById('eventType');
  timestampInput = document.getElementById('timestamp');
  sourceSelect = document.getElementById('source');
  externalIdInput = document.getElementById('externalId');
  saveApiKeyBtn = document.getElementById('saveApiKey');
  simulateEventBtn = document.getElementById('simulateEvent');
  statusDiv = document.getElementById('status');

  // Load saved API key
  loadApiKey();

  // Attach event listeners
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  simulateEventBtn.addEventListener('click', simulateEvent);
});

/**
 * Load API key from chrome.storage.sync
 */
function loadApiKey() {
  chrome.storage.sync.get(['apiKey'], function(result) {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
      showStatus('API key loaded successfully', 'success');
      setTimeout(() => hideStatus(), STATUS_DISPLAY_DURATION_MS);
    }
  });
}

/**
 * Save API key to chrome.storage.sync
 */
function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }

  chrome.storage.sync.set({ apiKey: apiKey }, function() {
    if (chrome.runtime.lastError) {
      showStatus('Error saving API key: ' + chrome.runtime.lastError.message, 'error');
    } else {
      showStatus('✓ API key saved successfully!', 'success');
    }
  });
}

/**
 * Simulate an event by sending message to background script
 */
function simulateEvent() {
  const eventType = eventTypeSelect.value;
  
  // Validation
  if (!eventType) {
    showStatus('Please select an event type', 'error');
    return;
  }

  // Get API key from storage
  chrome.storage.sync.get(['apiKey'], function(result) {
    if (!result.apiKey) {
      showStatus('Please save an API key first', 'error');
      return;
    }

    // Build payload
    const payload = {
      apiKey: result.apiKey,
      type: eventType,
      source: sourceSelect.value
    };

    // Add optional timestamp (convert to ISO string if provided)
    if (timestampInput.value) {
      const date = new Date(timestampInput.value);
      payload.timestamp = date.toISOString();
    }

    // Add optional external ID
    if (externalIdInput.value.trim()) {
      payload.externalId = externalIdInput.value.trim();
    }

    // Disable button while processing
    simulateEventBtn.disabled = true;
    showStatus('Sending event...', 'info');

    // Send message to background script
    chrome.runtime.sendMessage(
      { action: 'SIMULATE_EVENT', payload: payload },
      function(response) {
        simulateEventBtn.disabled = false;
        
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
          return;
        }

        // Handle response from background script
        if (response.success) {
          if (response.data && response.data.duplicate) {
            showStatus('⚠️ Event was a duplicate and not stored', 'warning');
          } else {
            showStatus('✓ Event simulated successfully!', 'success');
          }
          
          // Show additional response data
          if (response.data) {
            const details = JSON.stringify(response.data, null, 2);
            console.log('Event response:', details);
          }
        } else {
          showStatus('❌ Error: ' + (response.error || 'Unknown error'), 'error');
        }
      }
    );
  });
}

/**
 * Show status message
 */
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
}

/**
 * Hide status message
 */
function hideStatus() {
  statusDiv.style.display = 'none';
}
