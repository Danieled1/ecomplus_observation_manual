const path = require('path');

function getPathFromUrl(u) {
  try {
    const url = new URL(u);
    return url.pathname.replace(/\/$/, '');
  } catch (e) {
    return String(u || '').replace(/^https?:\/\//i, '').split('/').slice(1).join('/');
  }
}

function normalizePath(p) {
  try { return decodeURIComponent(String(p || '')).toLowerCase().replace(/\/$/, ''); } catch (e) { return String(p || '').toLowerCase().replace(/\/$/, ''); }
}

function pathMatches(afterPath, wantPath) {
  const a = normalizePath(afterPath);
  const w = normalizePath(wantPath);
  if (!a || !w) return false;
  // exact or segment boundary match
  if (a === w) return true;
  try {
    const re = new RegExp(`(^|/)${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$)`);
    return re.test(a);
  } catch (e) {
    return a.includes(w);
  }
}

module.exports.validateSidebarNav = async function validateSidebarNav(page, targetUrl, outputDir, options = {}) {
  try {
    const contentSelectors = options.contentSelectors || ['.entry-content', '.site-main', 'body'];
    const shotName = options.shotName || 'sidebar_nav.png';
    const wantPath = normalizePath(getPathFromUrl(targetUrl) || '');
    // If we don't have a meaningful path (e.g., empty or too short), treat as not applicable
    if (!wantPath || wantPath.length < 2) {
      return { sidebarFound: false, sidebarLinkFound: false };
    }
    // Check for BuddyPanel/menu presence using real structure
    const menuRootSel = 'ul#buddypanel-menu, aside.buddypanel ul.buddypanel-menu.side-panel-menu, .bb-mobile-panel-inner ul.buddypanel-menu.side-panel-menu';
    const menuRoot = await page.$(menuRootSel);
    if (!menuRoot) {
      return { sidebarFound: false };
    }
    // Find a matching anchor inside the menu(s), expanding dropdowns if needed
    const hrefMatch = await page.evaluate((menuRootSel, wantPath) => {
      const normalize = (s) => { try { return decodeURIComponent(String(s || '')); } catch (e) { return String(s || ''); } };
      const root = document.querySelector(menuRootSel);
      if (!root) return null;
      // expand any known dropdown to reveal submenus
      const toggles = Array.from(root.querySelectorAll('.dropdown-toggle'));
      for (const t of toggles) {
        const li = t.closest('li.menu-item-has-children');
        const submenu = li && li.querySelector('.sub-menu');
        if (submenu && !submenu.classList.contains('bb-open')) {
          try { t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } catch (e) {}
          try { submenu.classList.add('bb-open'); } catch (e) {}
        }
      }
      const anchors = Array.from(root.querySelectorAll('a[href]'));
      const want = normalize(wantPath).toLowerCase().replace(/\/$/, '');
      if (!want || want.length < 2) return null;
      for (const a of anchors) {
        const hrefRaw = a.getAttribute('href');
        if (!hrefRaw) continue;
        const href = normalize(hrefRaw).toLowerCase();
        // compare by path only
        let pathOnly = href;
        try {
          const u = new URL(href, window.location.origin);
          pathOnly = (u.pathname || '').replace(/\/$/, '');
        } catch (e) {
          // leave as-is for relative/anchor hrefs
        }
        if (pathOnly.endsWith(want) || pathOnly.includes(`/${want}`) || pathOnly === want) {
          return hrefRaw;
        }
      }
      return null;
    }, menuRootSel, wantPath);
    if (!hrefMatch) {
      // Not applicable: no dedicated sidebar entry for this page
      return { sidebarFound: true, sidebarLinkFound: false };
    }
    // Click and validate navigation safely by DOM evaluation to avoid CSS escaping issues
    const before = page.url();
    try {
      await Promise.all([
        page.evaluate((menuRootSel, hrefMatch) => {
          const root = document.querySelector(menuRootSel);
          if (!root) return;
          const anchors = Array.from(root.querySelectorAll('a[href]'));
          const same = anchors.find(a => a.getAttribute('href') === hrefMatch) || anchors.find(a => (a.getAttribute('href') || '').includes(hrefMatch));
          if (same) {
            try { same.scrollIntoView({ block: 'center' }); } catch (e) {}
            same.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          }
        }, menuRootSel, hrefMatch),
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {})
      ]);
    } catch (e) {}
    // Wait briefly for content to paint
    try {
      await page.waitForFunction((sels) => sels.some(s => document.querySelector(s)), { timeout: 2000 }, contentSelectors).catch(()=>{});
    } catch(e) {}
    const after = page.url();
    const afterPath = getPathFromUrl(after).toLowerCase();
    const match = pathMatches(afterPath, wantPath);
    const shotPath = path.join(outputDir, shotName);
    try { await page.screenshot({ path: shotPath }); } catch(e) {}
    return { sidebarFound: true, sidebarLinkFound: true, sidebarUrl: after, sidebarMatch: !!match, sidebarNavOk: !!match, sidebarShot: shotPath, beforeUrl: before };
  } catch (e) {
    return { sidebarFound: false, error: e && e.message };
  }
};
