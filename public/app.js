const initialBookmarks = [
  { title: 'Home', url: 'about:home', icon: '🏠' },
  { title: 'Google', url: 'https://www.google.com', icon: 'G' },
  { title: 'GitHub', url: 'https://github.com', icon: 'GH' },
  { title: 'Docs', url: 'https://developer.mozilla.org', icon: 'MD' },
  { title: 'Wikipedia', url: 'https://en.wikipedia.org', icon: 'W' }
];

const state = {
  tabs: [],
  activeTabId: null,
  nextTabId: 1
};

const tabStrip = document.getElementById('tab-strip');
const bookmarkList = document.getElementById('bookmark-list');
const addressInput = document.getElementById('address-input');
const frame = document.getElementById('browser-frame');
const loadingIndicator = document.getElementById('loading-indicator');

function sanitizeUrl(rawValue) {
  const value = rawValue.trim();

  if (!value) {
    return 'about:home';
  }

  if (value.toLowerCase() === 'about:home') {
    return 'about:home';
  }

  if (/^https?:\/\//i.test(value) || /^about:/i.test(value)) {
    return value;
  }

  const hasDot = value.includes('.') || value.includes('localhost') || /^\d+\.\d+\.\d+\.\d+$/.test(value);
  if (hasDot) {
    return `https://${value}`;
  }

  return `https://duckduckgo.com/?q=${encodeURIComponent(value)}`;
}

function tabFaviconFromUrl(url) {
  const host = new URL(url).hostname || 'S';
  const firstLetter = host.charAt(0).toUpperCase();
  return firstLetter;
}

function createTab(url = 'about:home', title = 'New tab') {
  const id = state.nextTabId++;
  const tab = {
    id,
    title,
    url,
    history: [url],
    historyIndex: 0,
    favicon: tabFaviconFromUrl(url)
  };

  state.tabs.push(tab);
  state.activeTabId = id;
  return tab;
}

function updateBookmarkList() {
  bookmarkList.innerHTML = '';

  initialBookmarks.forEach((bookmark) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bookmark-item';
    button.innerHTML = `
      <span class="bookmark-icon">${bookmark.icon}</span>
      <span>${bookmark.title}</span>
    `;

    button.addEventListener('click', () => {
      openUrl(bookmark.url, bookmark.title);
    });

    bookmarkList.appendChild(button);
  });
}

function getActiveTab() {
  return state.tabs.find((tab) => tab.id === state.activeTabId) || state.tabs[0];
}

function renderTabs() {
  tabStrip.innerHTML = '';

  state.tabs.forEach((tab) => {
    const tabButton = document.createElement('button');
    tabButton.type = 'button';
    tabButton.className = `tab ${tab.id === state.activeTabId ? 'active' : ''}`;
    tabButton.innerHTML = `
      <span class="tab-favicon">${tab.favicon}</span>
      <span class="tab-title">${tab.title}</span>
    `;

    tabButton.addEventListener('click', () => {
      state.activeTabId = tab.id;
      render();
    });

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'tab-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });

    tabButton.appendChild(closeButton);
    tabStrip.appendChild(tabButton);
  });
}

function homePageDocument() {
  const html = `
    <html>
      <head>
        <style>
          :root {
            --bg: #f6f8ff;
            --panel: rgba(255,255,255,0.96);
            --text: #171c2c;
            --muted: #5f6d86;
            --blue: #2563eb;
            --border: rgba(148,163,184,0.35);
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            min-height: 100vh;
            font-family: Inter, "Segoe UI", sans-serif;
            background: radial-gradient(circle at top, #f7fbff 0%, #edf3ff 32%, #e7edf8 100%);
            color: var(--text);
            display: grid;
            place-items: center;
          }
          .container {
            width: min(980px, 92vw);
            padding: 40px 28px;
          }
          .card {
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 22px;
            box-shadow: 0 12px 34px rgba(15,23,42,0.08);
            padding: 28px;
          }
          .title {
            margin: 0 0 8px;
            font-size: clamp(2.2rem, 4vw, 4rem);
            letter-spacing: -0.06em;
          }
          .subtitle { color: var(--muted); font-size: 1.06rem; }
          .search-box {
            margin-top: 24px;
            display: flex;
            gap: 12px;
            align-items: center;
            background: #f2f4f8;
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 10px 16px;
          }
          .search-box input {
            border: none;
            background: transparent;
            width: 100%;
            font-size: 1.02rem;
            padding: 8px 0;
            outline: none;
          }
          .shortcut-grid {
            margin-top: 26px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 14px;
          }
          .shortcut {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
            background: #f8fafe;
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 16px;
          }
          .badge {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border-radius: 10px;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            font-weight: 700;
          }
          .name { font-weight: 600; }
          .tag { color: var(--muted); font-size: 0.82rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1 class="title">Welcome to ShortBrowse</h1>
            <div class="subtitle">A sleek browser inspired by Chrome, built for focused browsing.</div>
            <div class="search-box">
              <span>🔎</span>
              <input value="Search the web or type a URL" readonly />
            </div>
            <div class="shortcut-grid">
              <div class="shortcut"><div class="badge">G</div><div class="name">Google</div><div class="tag">Search</div></div>
              <div class="shortcut"><div class="badge">GH</div><div class="name">GitHub</div><div class="tag">Code</div></div>
              <div class="shortcut"><div class="badge">MD</div><div class="name">MDN</div><div class="tag">Docs</div></div>
              <div class="shortcut"><div class="badge">W</div><div class="name">Wikipedia</div><div class="tag">Learn</div></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function fallbackPageDocument(targetUrl) {
  const siteText = targetUrl.startsWith('https://') ? new URL(targetUrl).hostname.replace(/^www\./, '') : 'the web';
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background: #f3f6fb; color: #0f172a; display: grid; place-items: center; min-height: 100vh; }
          .card { background: white; padding: 32px; border-radius: 20px; box-shadow: 0 25px 54px rgba(15,23,42,0.08); max-width: 620px; width: 92vw; }
          h1 { margin-top: 0; font-size: clamp(2rem, 4vw, 3rem); }
          p { color: #475569; line-height: 1.6; }
          .pill { display: inline-block; margin-top: 10px; background: #e0f2fe; color: #075985; padding: 8px 12px; border-radius: 999px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Page preview unavailable</h1>
          <p>This browser is designed as a Chrome-inspired local experience, and ${siteText} is being routed through a safe local preview. If you want to browse the live site, use a full browser engine or allow direct page embedding.</p>
          <div class="pill">Target: ${targetUrl}</div>
        </div>
      </body>
    </html>
  `;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function loadFrameForTab(tab) {
  const activeUrl = tab.url || 'about:home';
  const normalized = sanitizeUrl(activeUrl);
  const iframe = frame;

  loadingIndicator.classList.remove('hidden');

  if (normalized === 'about:home') {
    iframe.src = homePageDocument();
    addressInput.value = 'about:home';
    return;
  }

  try {
    const parsed = new URL(normalized);
    const allowedHosts = ['example.com', 'www.example.com', 'developer.mozilla.org', 'www.mozilla.org', 'github.com', 'www.github.com', 'en.wikipedia.org', 'www.wikipedia.org', 'www.google.com'];
    const host = parsed.hostname.replace(/^www\./, '');

    if (allowedHosts.includes(parsed.hostname) || allowedHosts.includes(host)) {
      iframe.src = normalized;
      addressInput.value = normalized;
      setTimeout(() => loadingIndicator.classList.add('hidden'), 500);
      return;
    }

    iframe.src = fallbackPageDocument(normalized);
    addressInput.value = normalized;
    setTimeout(() => loadingIndicator.classList.add('hidden'), 500);
  } catch {
    iframe.src = fallbackPageDocument(normalized);
    addressInput.value = normalized;
    setTimeout(() => loadingIndicator.classList.add('hidden'), 500);
  }
}

function updateTabDataFromFrame(tab) {
  const url = tab.url;
  if (!url || url === 'about:home') {
    tab.title = 'Home';
    tab.favicon = 'H';
    return;
  }

  try {
    const parsed = new URL(url);
    tab.title = parsed.hostname.replace(/^www\./, '') || 'New tab';
    tab.favicon = tabFaviconFromUrl(url);
  } catch {
    tab.title = 'Search';
    tab.favicon = 'S';
  }
}

function render() {
  const activeTab = getActiveTab();

  if (activeTab) {
    addressInput.value = activeTab.url;
    updateTabDataFromFrame(activeTab);
  }

  renderTabs();
  loadFrameForTab(activeTab);
}

function openUrl(rawUrl, titleOverride) {
  const activeTab = getActiveTab();
  const normalized = sanitizeUrl(rawUrl);

  if (!activeTab) {
    createTab(normalized, titleOverride || 'Home');
    render();
    return;
  }

  activeTab.url = normalized;
  activeTab.title = titleOverride || activeTab.title || 'New tab';
  activeTab.history = [...new Set([...(activeTab.history || []), normalized])];
  activeTab.historyIndex = activeTab.history.length - 1;

  render();
}

function closeTab(tabId) {
  if (state.tabs.length === 1) {
    const tab = state.tabs[0];
    tab.url = 'about:home';
    tab.title = 'Home';
    tab.history = ['about:home'];
    tab.historyIndex = 0;
    render();
    return;
  }

  state.tabs = state.tabs.filter((tab) => tab.id !== tabId);
  state.activeTabId = state.tabs[0].id;
  render();
}

function handleAddressSubmit(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    openUrl(addressInput.value, 'New page');
  }
}

function setupEvents() {
  addressInput.addEventListener('keydown', handleAddressSubmit);
  document.getElementById('new-tab-btn').addEventListener('click', () => {
    const tab = createTab('about:home', 'Home');
    render();
    if (tab) {
      addressInput.value = tab.url;
    }
  });

  document.getElementById('focus-search').addEventListener('click', () => {
    addressInput.focus();
    addressInput.select();
  });

  document.getElementById('reload-btn').addEventListener('click', () => {
    const tab = getActiveTab();
    if (!tab) return;
    tab.url = sanitizeUrl(tab.url || 'about:home');
    render();
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    const tab = getActiveTab();
    if (!tab || !tab.history || tab.historyIndex <= 0) return;
    tab.historyIndex -= 1;
    tab.url = tab.history[tab.historyIndex];
    render();
  });

  document.getElementById('forward-btn').addEventListener('click', () => {
    const tab = getActiveTab();
    if (!tab || !tab.history || tab.historyIndex >= tab.history.length - 1) return;
    tab.historyIndex += 1;
    tab.url = tab.history[tab.historyIndex];
    render();
  });
}

function initialize() {
  state.tabs = [createTab('about:home', 'Home')];
  updateBookmarkList();
  setupEvents();
  render();
}

initialize();
