document.addEventListener('DOMContentLoaded', () => {
  const contentArea = document.getElementById('dashboard-content');

  function renderDashboard() {
    chrome.storage.local.get(['customBlockedSelectors'], (result) => {
      contentArea.innerHTML = ''; // Clear current view
      const allSelectors = result.customBlockedSelectors || {};

      if (Object.keys(allSelectors).length === 0) {
        contentArea.innerHTML = '<p>No elements have been blocked yet. Use the "Select Element to Block" feature on any webpage.</p>';
        return;
      }

      for (const host in allSelectors) {
        const selectors = allSelectors[host];
        if (selectors.length > 0) {
          const group = document.createElement('div');
          group.className = 'domain-group';

          const header = document.createElement('div');
          header.className = 'domain-header';
          header.textContent = host;
          group.appendChild(header);

          const list = document.createElement('ul');
          list.className = 'selector-list';
          
          selectors.forEach((selector, index) => {
            const item = document.createElement('li');
            item.className = 'selector-item';
            
            const text = document.createElement('span');
            text.className = 'selector-text';
            text.textContent = selector;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
              deleteSelector(host, index);
            });

            item.appendChild(text);
            item.appendChild(deleteBtn);
            list.appendChild(item);
          });

          group.appendChild(list);
          contentArea.appendChild(group);
        }
      }
    });
  }

  function deleteSelector(host, index) {
    chrome.storage.local.get(['customBlockedSelectors'], (result) => {
      const allSelectors = result.customBlockedSelectors || {};
      const hostSelectors = allSelectors[host] || [];
      
      hostSelectors.splice(index, 1);
      
      if (hostSelectors.length === 0) {
        delete allSelectors[host];
      } else {
        allSelectors[host] = hostSelectors;
      }
      
      chrome.storage.local.set({ customBlockedSelectors: allSelectors }, () => {
        console.log(`Deleted selector at index ${index} for ${host}`);
        renderDashboard(); // Re-render the dashboard
      });
    });
  }

  renderDashboard();
}); 