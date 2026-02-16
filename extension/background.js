// background.js - Service worker for handling event simulation

// Backend URL - Change this for staging/production environments
const BACKEND_URL = 'http://localhost:3000';

/**
 * Listen for messages from the options page
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SIMULATE_EVENT') {
    handleSimulateEvent(request.payload)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    // Return true to indicate we'll send response asynchronously
    return true;
  }
});

/**
 * Handle event simulation
 */
async function handleSimulateEvent(payload) {
  try {
    // Validate required fields
    if (!payload.type) {
      return {
        success: false,
        error: 'Event type is required'
      };
    }

    // Validate event type
    const validTypes = ['post', 'comment', 'reaction'];
    if (!validTypes.includes(payload.type)) {
      return {
        success: false,
        error: `Invalid event type. Must be one of: ${validTypes.join(', ')}`
      };
    }

    // Validate timestamp if provided
    if (payload.timestamp) {
      const date = new Date(payload.timestamp);
      if (isNaN(date.getTime())) {
        return {
          success: false,
          error: 'Invalid timestamp format'
        };
      }
    }

    // Get API key from storage if not in payload
    if (!payload.apiKey) {
      const result = await chrome.storage.sync.get(['apiKey']);
      if (!result.apiKey) {
        return {
          success: false,
          error: 'API key not found. Please save your API key in the options page.'
        };
      }
      payload.apiKey = result.apiKey;
    }

    // Send POST request to backend
    const response = await fetch(`${BACKEND_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      // Handle HTTP errors
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      };
    }

    // Success
    return {
      success: true,
      data: data
    };

  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Error simulating event:', error);
    
    let errorMessage = error.message;
    
    // Provide more helpful error messages for common issues
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to backend server. Make sure the server is running at ' + BACKEND_URL;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Optional: Log when service worker starts
 */
console.log('LinkedIn Activity Tracker background service worker loaded');
