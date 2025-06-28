document.addEventListener('DOMContentLoaded', () => {
  const automaticToggle = document.getElementById('automatic-blocker-toggle');
  const manualToggle = document.getElementById('manual-blocker-toggle');
  const selectElementBtn = document.getElementById('select-element-btn');
  const manageBtn = document.getElementById('manage-btn');

  // Load saved states
  chrome.storage.local.get(['automaticBlockerEnabled', 'manualBlockerEnabled'], (result) => {
    automaticToggle.checked = result.automaticBlockerEnabled !== false;
    manualToggle.checked = result.manualBlockerEnabled !== false;
  });

  // Handle automatic toggle change
  automaticToggle.addEventListener('change', () => {
    const isEnabled = automaticToggle.checked;
    chrome.storage.local.set({ automaticBlockerEnabled: isEnabled });
    sendMessageToContentScript({ action: "toggleAutomaticBlocker", enabled: isEnabled });
  });

  // Handle manual toggle change
  manualToggle.addEventListener('change', () => {
    const isEnabled = manualToggle.checked;
    chrome.storage.local.set({ manualBlockerEnabled: isEnabled });
    sendMessageToContentScript({ action: "toggleManualBlocker", enabled: isEnabled });
  });

  // Handle element selection button
  selectElementBtn.addEventListener('click', () => {
    selectElementBtn.textContent = "- Selecting -";
    selectElementBtn.disabled = true;
    sendMessageToContentScript({ action: "startElementSelection" });
  });

  // Handle manage button
  manageBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  });
});

function sendMessageToContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  });
}

// Listen for messages from content script (e.g., to re-enable button)
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'selectionCanceled' || request.action === 'selectionCompleted') {
    const selectElementBtn = document.getElementById('select-element-btn');
    if(selectElementBtn) {
      selectElementBtn.textContent = "Select Element to Block";
      selectElementBtn.disabled = false;
    }
  }
}); 