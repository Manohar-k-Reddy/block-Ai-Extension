const actionKeywords = [
  "Ask AI",
  "Chat with AI",
  "Rewrite with AI",
  "Summarize",
  "Explain",
  "AI Assistant",
  "Copilot",
  "Get AI help",
  "Try AI",
  "Generate",
  "Draft with AI",
  "AI Mode",
  "Magic Write"
];

const specificSelectors = {
  '#Odp5De': null, // Specific ID for Google's AI Overview
  '[jsname="pcRaIe"]': null, // Related container for AI results
  '[jsname="yEVEwb"]': null, // "People also ask" container
  '.dnXCYb': null, // Individual "People also ask" item
  'block-component': 'AI Overview' // Fallback for Google's AI Overview
};

let isAutomaticEnabled = true;
let isManualEnabled = true;
let styleSheet = null;
let observer = null;
let debounceTimer = null;
let inspector = { active: false, overlay: null, tooltip: null };
const HIGHLIGHT_CLASS = 'ai-blocker-highlight';

function createStyleSheet() {
  if (styleSheet) return;
  const style = document.createElement('style');
  document.head.appendChild(style);
  styleSheet = style.sheet;
  // Add disabled style rule
  styleSheet.insertRule(`
    .ai-blocker-disabled { 
      pointer-events: none !important; 
      opacity: 0.6 !important; 
      cursor: not-allowed !important; 
    }
  `, styleSheet.cssRules.length);
  // Add the highlight style rule
  styleSheet.insertRule(`.${HIGHLIGHT_CLASS} { outline: 2px solid red !important; }`, styleSheet.cssRules.length);
}

function addBlockRule(selector) {
  // Check if the rule already exists
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (styleSheet.cssRules[i].selectorText === selector) {
      return; // Rule already exists
    }
  }
  styleSheet.insertRule(`${selector} { display: none !important; }`, styleSheet.cssRules.length);
}

function updateBlockedContent() {
  if (!styleSheet) return;

  if (isAutomaticEnabled) {
    // Action keyword-based DISABLING for buttons/links
    document.querySelectorAll('button, a, [role="button"]').forEach(element => {
      const texts = [element.textContent, element.getAttribute('aria-label')].filter(Boolean).join(' ').trim();
      if (actionKeywords.some(keyword => texts.includes(keyword))) {
        element.classList.add('ai-blocker-disabled');
        if (element.tagName === 'BUTTON') {
          element.setAttribute('disabled', 'true');
        } else {
          element.setAttribute('aria-disabled', 'true');
        }
      }
    });

    // Selector-based HIDING for specific known components
    for (const selector in specificSelectors) {
      const textToFind = specificSelectors[selector];
      document.querySelectorAll(selector).forEach(element => {
        if (!textToFind || element.textContent.includes(textToFind)) {
          addBlockRule(selector);
        }
      });
    }
  }

  if (isManualEnabled) {
    // Apply custom rules from storage
    applyCustomRules();
  }
}

function handleDOMChanges() {
  cancelAnimationFrame(debounceTimer);
  debounceTimer = requestAnimationFrame(() => {
    if (isAutomaticEnabled || isManualEnabled) {
      updateBlockedContent();
    }
  });
}

function startObserver() {
  if (observer) observer.disconnect();
  
  observer = new MutationObserver(handleDOMChanges);

  const mainContent = document.getElementById('rso') || document.body;

  observer.observe(mainContent, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });
}

function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  let path = '';
  let current = element;
  while (current.parentElement) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
      path = selector + (path ? ' > ' + path : '');
      break; // ID is unique, stop here
    }
    const siblings = Array.from(current.parentElement.children);
    const sameTagSiblings = siblings.filter(e => e.tagName === current.tagName);
    if (sameTagSiblings.length > 1) {
      const index = sameTagSiblings.indexOf(current) + 1;
      selector += `:nth-of-type(${index})`;
    }
    path = selector + (path ? ' > ' + path : '');
    current = current.parentElement;
    if (current.tagName.toLowerCase() === 'body') break;
  }
  return path;
}

function initInspector() {
  if (inspector.overlay) return;

  const inspectorStyles = `
    @keyframes sonar-pulse {
      0% { box-shadow: 0 0 0 0 rgba(68, 138, 255, 0.7); }
      70% { box-shadow: 0 0 10px 20px rgba(68, 138, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(68, 138, 255, 0); }
    }
    #ai-blocker-inspector-overlay {
      position: fixed;
      background-color: rgba(68, 138, 255, 0.5);
      z-index: 2147483646;
      pointer-events: none;
      transition: all 50ms;
      border-radius: 4px;
      animation: sonar-pulse 2s infinite;
    }
    #ai-blocker-inspector-tooltip {
      position: fixed;
      background-color: #333;
      color: white;
      font-family: monospace;
      font-size: 12px;
      padding: 5px 8px;
      border-radius: 4px;
      z-index: 2147483647;
      pointer-events: none;
    }
  `;
  const styleTag = document.createElement('style');
  styleTag.id = 'ai-blocker-inspector-styles';
  styleTag.textContent = inspectorStyles;
  document.head.appendChild(styleTag);

  inspector.overlay = document.createElement('div');
  inspector.overlay.id = 'ai-blocker-inspector-overlay';
  document.body.appendChild(inspector.overlay);

  inspector.tooltip = document.createElement('div');
  inspector.tooltip.id = 'ai-blocker-inspector-tooltip';
  document.body.appendChild(inspector.tooltip);
}

function startElementSelection() {
  if (inspector.active) return;
  
  initInspector();
  inspector.active = true;

  const updateInspectorUI = (target) => {
    const rect = target.getBoundingClientRect();
    inspector.overlay.style.display = 'block';
    inspector.overlay.style.width = `${rect.width}px`;
    inspector.overlay.style.height = `${rect.height}px`;
    inspector.overlay.style.top = `${rect.top}px`;
    inspector.overlay.style.left = `${rect.left}px`;
    
    let tooltipText = target.tagName.toLowerCase();
    if (target.id) tooltipText += `#${target.id}`;
    if (target.className && typeof target.className === 'string') {
        tooltipText += `.${target.className.trim().split(' ').filter(Boolean).join('.')}`;
    }
    
    inspector.tooltip.style.display = 'block';
    inspector.tooltip.textContent = tooltipText;

    const tooltipRect = inspector.tooltip.getBoundingClientRect();
    let top = rect.top - tooltipRect.height - 5;
    if (top < 0) top = rect.bottom + 5;

    inspector.tooltip.style.top = `${top}px`;
    inspector.tooltip.style.left = `${rect.left}px`;
  };

  const mouseMoveHandler = (e) => {
    updateInspectorUI(e.target);
  };
  
  const stopElementSelection = () => {
    inspector.active = false;
    if (inspector.overlay) inspector.overlay.style.display = 'none';
    if (inspector.tooltip) inspector.tooltip.style.display = 'none';
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('click', clickHandler, true);
    document.removeEventListener('keydown', keydownHandler, true);
  };

  const clickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newSelector = generateSelector(e.target);
    const host = window.location.hostname;

    stopElementSelection(); // Stop inspector before showing confirm dialog

    if (window.confirm(`Do you want to block this element?\n\nSelector: ${newSelector}`)) {
      try {
        addBlockRule(newSelector);
        
        chrome.storage.local.get(['customBlockedSelectors'], (result) => {
          const allSelectors = result.customBlockedSelectors || {};
          const hostSelectors = allSelectors[host] || [];
          if (!hostSelectors.includes(newSelector)) {
            hostSelectors.push(newSelector);
          }
          allSelectors[host] = hostSelectors;
          chrome.storage.local.set({ customBlockedSelectors: allSelectors });
        });
        
        chrome.runtime.sendMessage({ action: 'selectionCompleted' });
      } catch (err) {
        alert("Error: Could not block this element. Its structure may be too complex.");
        chrome.runtime.sendMessage({ action: 'selectionCanceled' });
      }
    } else {
      chrome.runtime.sendMessage({ action: 'selectionCanceled' });
    }
  };

  const keydownHandler = (e) => {
    if (e.key === 'Escape') {
      stopElementSelection();
      chrome.runtime.sendMessage({ action: 'selectionCanceled' });
    }
  };

  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('click', clickHandler, { capture: true });
  document.addEventListener('keydown', keydownHandler, { capture: true });
}

function applyCustomRules() {
  if (!isManualEnabled || !styleSheet) return;
  const host = window.location.hostname;
  chrome.storage.local.get(['customBlockedSelectors'], (result) => {
    const allSelectors = result.customBlockedSelectors || {};
    const hostSelectors = allSelectors[host] || [];
    hostSelectors.forEach(selector => addBlockRule(selector));
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleAutomaticBlocker") {
    isAutomaticEnabled = request.enabled;
    window.location.reload(); // Reload to apply/remove rules cleanly
  }

  if (request.action === "toggleManualBlocker") {
    isManualEnabled = request.enabled;
    window.location.reload(); // Reload to apply/remove rules cleanly
  }

  if (request.action === "startElementSelection") {
    startElementSelection();
  }
});

chrome.storage.local.get(['automaticBlockerEnabled', 'manualBlockerEnabled'], (result) => {
  isAutomaticEnabled = result.automaticBlockerEnabled !== false;
  isManualEnabled = result.manualBlockerEnabled !== false;
  
  createStyleSheet();
  updateBlockedContent();
  startObserver();
});

console.log("AI Blocker content script (v8) loaded."); 