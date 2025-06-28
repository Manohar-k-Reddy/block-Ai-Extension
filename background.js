console.log("AI Blocker background script is running."); 

chrome.runtime.onInstalled.addListener((details) => {
  // Open side panel on action click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  if (details.reason === 'update' || details.reason === 'install') {
    chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
            chrome.tabs.reload(tab.id);
        }
      });
    });
  }
}); 