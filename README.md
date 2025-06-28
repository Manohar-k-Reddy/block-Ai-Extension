# AI Blocker & Element Blocker

Your personal "delete" button for the annoying parts of the internet. This extension blocks pushy AI features and lets you hide anything else that gets in your way.

## What It Does

This extension gives you back control over your browsing experience by targeting two things:

1.  **Common AI Clutter**: It automatically finds and disables common AI buttons and interface elements that websites love to push on you.
2.  **Anything Else You Dislike**: It gives you a magic wand to permanently hide *any* other part of a website with a simple point-and-click.

## Features

*   **Automatic Blocker (The Peacemaker)**: Your one-click solution to digital noise. It politely tells the most common, pushy AI features to quiet down, so you don't have to.
*   **Manual Blocker (The Superpower)**: This is where you become the hero of your own internet. It's a universal "delete" button for the web. See a cookie banner that won't die? A social media widget you despise? Point, click, and *poof*—it's gone forever.
*   **Management Dashboard (Your Lair)**: Every hero needs a command center. Here you can see all the elements you've banished, grouped by website, and bring them back with a click if you have a change of heart.
*   **Simple Side Panel (The Control Panel)**: All your shiny new powers are neatly organized in a simple side panel. Easy to find, easy to use.

## How to Use

1.  Click the extension icon in your toolbar to open the **Control Panel**.
2.  Flip on the **Automatic Blocker** to deal with the usual suspects.
3.  Click **Select Element to Block** to activate your **Superpower**.
4.  Hover over the page, click on any element you want to banish, and confirm.
5.  Use the **Manual Blocker** toggle to turn your personal blocklist on or off.
6.  Visit your **Lair** (Manage Blocked Elements) to review your handiwork.

## Technical Details

This extension is built with standard web technologies and Chrome Extension APIs to be lightweight and efficient.

*   **Manifest V3**: Uses the modern and secure Manifest V3 standard for Chrome extensions.
*   **Content Script (`content.js`)**: A single script is injected into web pages to handle all DOM manipulation. It's responsible for finding and either disabling or hiding AI elements.
*   **Dynamic Content Handling**: It uses a `MutationObserver` to watch for changes to the webpage after it loads. This allows it to block AI elements that are loaded in dynamically with JavaScript.
*   **CSS Injection**: Instead of directly manipulating element styles (which can be slow), the extension injects a dynamic stylesheet into the page. Hiding elements is done by adding new CSS rules, which is a more performant method.
*   **Persistent Storage (`chrome.storage`)**: User preferences (like the toggle states) and all custom-blocked element selectors are saved to `chrome.storage`, ensuring your settings are remembered.
*   **Side Panel UI**: The user interface is built as a side panel, which provides a more stable and persistent place for controls compared to a standard popup.
*   **Dashboard**: The management dashboard is a standalone HTML page within the extension that reads from `chrome.storage` to display your saved rules.

## How to Install

1.  Download or clone this project to your local machine.
2.  Open your Chrome-based browser and navigate to `chrome://extensions`.
3.  Turn on **"Developer mode"** (usually a toggle in the top-right corner).
4.  Click the **"Load unpacked"** button.
5.  Select the folder where you saved the project.
6.  The extension is now installed and ready to use!

---

Built for fun, to give you back control of your web experience. 