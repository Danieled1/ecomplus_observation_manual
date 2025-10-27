const { validateSidebarNav } = require('../tools/sidebarNav');
const fs = require('fs');
const path = require('path');

// Helper to build an assertion entry
function mkAssert({ id, label, pass, selector, screenshot, text, type, elapsedMs }) {
  return {
    id,
    label,
    pass: !!pass,
    type: type || undefined,
    elapsedMs: typeof elapsedMs === 'number' ? elapsedMs : undefined,
    evidence: {
      selector: selector || null,
      screenshot: screenshot || null,
      text: typeof text === 'string' ? (text.length > 300 ? text.slice(0, 300) + '…' : text) : null
    }
  };
}

module.exports = async function ticketFlow(page, outputDir, creds = {}) {
  // creds.url is preferred, then STAGING_URL env, then fallback
  const base = (creds.url || process.env.STAGING_URL || '').replace(/\/+$/, '') || 'http://localhost';
  const url = `${base}/tickets/`;
  const meta = { url };
  const assertions = [];
  // Helper to write structured JSON into flow_logs for this run
  const writeFlowLogJSON = (filename, payload) => {
    try {
      const dir = path.join(outputDir, 'flow_logs');
      try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
      const file = path.join(dir, filename);
      fs.writeFileSync(file, JSON.stringify(payload, null, 2));
    } catch (_) { /* non-fatal */ }
  };
  try {
    console.log('[ticketFlow] navigating to', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(500);
    const shotLanding = `${outputDir}/tickets_page.png`;
    await page.screenshot({ path: shotLanding }).catch(()=>{});

    // Phase 8R3: Hard-open the Create Ticket form before any typing
    try {
      await page.waitForSelector('#createTicketBtn', { visible: true, timeout: 10000 });
      await page.click('#createTicketBtn');
      console.log('[ticketFlow] clicked createTicketBtn');
      await page.waitForSelector('select[name="acf[field_65f06082a4add]"]', { visible: true, timeout: 10000 });
      console.log('[ticketFlow] sector select visible');
    } catch (_) {
      // Non-fatal: continue with heuristic opening below
    }

    // Ensure create view is active before filling (avoid history toggle in same cycle)
    try {
      const createBtn = await page.$('#createTicketBtn');
      if (createBtn) {
        // Heuristic: click only if the form is not visible
        const hasTitleField = await page.$('input[name="acf[field_65f060dba4ade]"], input[name="ticket_title"], #ticket_title, input[type="text"]');
        if (!hasTitleField) {
          await createBtn.click().catch(()=>{});
          await page.waitForTimeout(600);
        }
      }
    } catch(_) {}

    // Title field: try a list of common selectors (child-theme and ACF variants)
    const titleSelectors = [
      'input[name="ticket_title"]',
      'input[name="acf[field_65f060dba4ade]"]',
      'input[name="title"]',
      '#ticket_title',
      'input[type="text"]'
    ];
    const titleText = `QA test ticket ${Date.now()}`;
    let typedTitle = false;
    let usedTitleSel = null;
    const tTitle0 = Date.now();
    for (const sel of titleSelectors) {
      try {
        const handle = await page.$(sel);
        if (handle) {
          await handle.click({ clickCount: 3 }).catch(()=>{});
          await page.type(sel, titleText, { delay: 20 });
          typedTitle = true;
          usedTitleSel = sel;
          console.log('[ticketFlow] typed title using', sel);
          break;
        }
      } catch (e) {
        console.warn('[ticketFlow] title selector failed', sel, e.message);
      }
    }
    if (!typedTitle) console.warn('[ticketFlow] no title selector matched; continuing');
  assertions.push(mkAssert({ id: 'titleFilled', label: 'Ticket title field filled', pass: typedTitle, selector: usedTitleSel, screenshot: shotLanding, type: 'deterministic', elapsedMs: Date.now() - tTitle0 }));
    // Defer immediate appearance check until after submit to avoid false negatives
    let ticketInList = false;
    const tinyMCESelectors = ['iframe[id$="_ifr"]', 'iframe[id^="acf-editor-"]', 'iframe.tox-edit-area__iframe'];
    let contentTyped = false;
    let usedContentSel = null;
  const tContent0 = Date.now();
  for (const iframeSel of tinyMCESelectors) {
      try {
        const iframeHandle = await page.$(iframeSel);
        if (iframeHandle) {
          const frame = await iframeHandle.contentFrame();
          if (frame) {
            await frame.focus('body');
            const content = creds.ticketContent || process.env.TICKET_CONTENT || 'Automated QA ticket test.';
            await frame.evaluate((txt) => { document.body.innerHTML = ''; }, content).catch(()=>{});
            await frame.type('body', creds.ticketContent || process.env.TICKET_CONTENT || 'Automated QA ticket test.', { delay: 20 }).catch(()=>{});
            contentTyped = true;
            usedContentSel = iframeSel + ' > body';
            console.log('[ticketFlow] typed content into TinyMCE iframe', iframeSel);
            break;
          }
        }
      } catch (e) {
        console.warn('[ticketFlow] TinyMCE attempt failed for', iframeSel, e.message);
      }
    }
    // Textarea fallbacks
    if (!contentTyped) {
      const textareaSelectors = [
        'textarea[name="ticket_content"]',
        'textarea[name="acf[field_65f06191a4adf]"]',
        'textarea[name="content"]',
        'textarea'
      ];
      for (const sel of textareaSelectors) {
        try {
          const handle = await page.$(sel);
          if (handle) {
            await handle.click().catch(()=>{});
            const content = creds.ticketContent || process.env.TICKET_CONTENT || 'Automated QA ticket test.';
            await page.type(sel, content, { delay: 20 }).catch(()=>{});
            contentTyped = true;
            usedContentSel = sel;
            console.log('[ticketFlow] typed content using', sel);
            break;
          }
        } catch (e) {
          console.warn('[ticketFlow] textarea selector failed', sel, e.message);
        }
      }
    }
    if (!contentTyped) console.warn('[ticketFlow] no content field found');
  assertions.push(mkAssert({ id: 'contentFilled', label: 'Ticket content field filled', pass: contentTyped, selector: usedContentSel, screenshot: shotLanding, type: 'deterministic', elapsedMs: Date.now() - tContent0 }));

    // Attempt to select sector/sub-sector if present. Prefer values from creds or env.
    try {
      // Phase 8R3a: explicitly target the main sector select and then the secondary subject select
      const sectorDesired = creds.ticketSectorValue || process.env.TICKET_SECTOR_VALUE || 'technical_support';
      const sectorSelectorsOrdered = [
        'select[name="acf[field_65f06082a4add]"]',
        'select[name*="ticket_sector"]',
        'select[name^="acf"][name*="sector"]',
        'select[id*="sector"]',
        'select'
      ];
      let sectorPicked = false;
      for (const sel of sectorSelectorsOrdered) {
        try {
          const exists = await page.$(sel);
          if (!exists) continue;
          await page.waitForSelector(sel, { visible: true, timeout: 10000 });
          const optionExists = await page.$eval(sel, (s, desired) => Array.from(s.options||[]).some(o => (o.value||'') === desired || (o.textContent||'').trim() === desired), sectorDesired).catch(()=>false);
          if (optionExists) {
            await page.select(sel, sectorDesired).catch(()=>{});
            console.log('[ticketFlow] selected ticket_sector', sectorDesired, 'via', sel);
          } else {
            // pick first non-empty option
            await page.evaluate((sSel) => {
              const s = document.querySelector(sSel);
              if (!s) return;
              for (const o of Array.from(s.options||[])) {
                if (o.value) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); break; }
              }
            }, sel).catch(()=>{});
            console.log('[ticketFlow] selected first non-empty ticket_sector via', sel);
          }
          sectorPicked = true;
          break;
        } catch(_) {}
      }
      if (!sectorPicked) console.log('[ticketFlow] no sector select found (optional)');
      // Wait briefly for dependent ACF field to render
      await page.waitForTimeout(400);

      // Secondary sub-topic select (ticket_sector_subject)
      const subjectDesired = creds.ticketSectorSubjectValue || process.env.TICKET_SECTOR_SUBJECT_VALUE || 'other';
      const subjectSelectorsOrdered = [
        'select[name="acf[field_65f064c9a4ae1]"]',
        'select[name*="ticket_sector_subject"]',
        'select[name^="acf"][name*="subject"]'
      ];
      for (const sel of subjectSelectorsOrdered) {
        try {
          await page.waitForSelector(sel, { visible: true, timeout: 10000 });
          const hasOption = await page.$eval(sel, (s, desired) => Array.from(s.options||[]).some(o => (o.value||'') === desired || (o.textContent||'').trim() === desired), subjectDesired).catch(()=>false);
          if (hasOption) {
            await page.select(sel, subjectDesired).catch(()=>{});
            console.log('[ticketFlow] selected ticket_sector_subject', subjectDesired, 'via', sel);
          } else {
            await page.evaluate((sSel) => {
              const s = document.querySelector(sSel);
              if (!s) return;
              for (const o of Array.from(s.options||[])) {
                if (o.value) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); break; }
              }
            }, sel).catch(()=>{});
            console.log('[ticketFlow] selected first non-empty ticket_sector_subject via', sel);
          }
          break; // only select once
        } catch (_) {}
      }
      await page.waitForTimeout(300);
    } catch (e) {
      console.warn('[ticketFlow] selecting sector/subject failed', e.message);
    }

    // Screenshot the filled form
  const shotFilled = `${outputDir}/tickets_filled.png`;
  await page.screenshot({ path: shotFilled }).catch(()=>{});

    // Try to submit: prefer plain submit buttons but tolerate AJAX endpoints
    const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', '#submitTicket', 'button[name="submit"]', 'button'];
    let submitted = false;
    let usedSubmitSel = null;
  const tSubmit0 = Date.now();
  for (const sel of submitSelectors) {
      try {
        const btn = await page.$(sel);
        if (btn) {
          // Click submit and then allow either a navigation or an AJAX response to settle
          await btn.click().catch(()=>{});
          console.log('[ticketFlow] submit clicked');
          // Phase 8R3: wait explicitly for acf_form_submit network and then a success notice
          const acfSubmitWait = page.waitForResponse(
            res => res.url().includes('admin-ajax.php') && res.url().includes('acf_form_submit'),
            { timeout: 15000 }
          ).catch(() => null);
          await Promise.race([
            page.waitForNavigation({ waitUntil: ['domcontentloaded','load','networkidle2'], timeout: 15000 }).catch(() => null),
            acfSubmitWait,
            page.waitForTimeout(2000)
          ]);
          // After submission event, wait for a success notice to render (without changing assertions)
          try {
            await page.waitForSelector('.acf-notice.updated, .bb-feedback.success, .notice-success, .bp-feedback.success', { timeout: 15000 });
            console.log('[ticketFlow] success notice visible');
          } catch(_) {}
          // Phase 8R3b: Alternate success path — detect a new ticket row containing the submitted title
          try {
            await page.waitForFunction(
              (title) => {
                const rows = Array.from(document.querySelectorAll('.ticket-row, table tbody tr, .bb-table tbody tr'));
                return rows.some(r => (r.textContent||'').includes(title));
              },
              { timeout: 15000 },
              titleText
            );
            console.log('[ticketFlow] detected new ticket row containing title');
          } catch(_) {}
          submitted = true;
          usedSubmitSel = sel;
          console.log('[ticketFlow] clicked submit using', sel);
          break;
        }
      } catch (e) {
        console.warn('[ticketFlow] submit attempt failed for', sel, e.message);
      }
    }
    if (!submitted) console.warn('[ticketFlow] no submit button found; attempt skipped');
  assertions.push(mkAssert({ id: 'submitClicked', label: 'Submit button clicked', pass: submitted, selector: usedSubmitSel, screenshot: shotFilled, type: 'deterministic', elapsedMs: Date.now() - tSubmit0 }));

  // Final small wait to ensure DOM is stable before reading success banners
  await page.waitForTimeout(800);
  const shotAfter = `${outputDir}/tickets_after_submit.png`;
    await page.screenshot({ path: shotAfter }).catch(()=>{});

  // Detect success via common banners or updated list
  let submitSuccess = false;
    let successText = '';
    const successSelectors = [
      '.notice-success', '.bb-notice.success', '.bp-feedback.success', '.message-success', '.updated', '.woocommerce-message',
      '.ld-alert-success', '.elementor-message-success', '.alert-success', '.bb-feedback.success'
    ];
  const tAck0 = Date.now();
  for (const sel of successSelectors) {
      try {
        const found = await page.$(sel);
        if (found) {
          submitSuccess = true;
          successText = await page.$eval(sel, el => (el.innerText || '').trim()).catch(() => '');
          break;
        }
      } catch(_) {}
    }

    // Count ticket history rows if present to satisfy coverage 'counts'
    try {
      const rows = await page.$$eval('table tbody tr', els => els.length).catch(() => 0);
      if (typeof rows === 'number') meta.rows = rows;
      // Strengthened fallback: mark success if a row containing the specific title appears
      if (!submitSuccess) {
        try {
          const rowHasTitle = await page.evaluate((title) => {
            const rows = Array.from(document.querySelectorAll('.ticket-row, table tbody tr, .bb-table tbody tr'));
            return rows.some(r => (r.textContent||'').includes(title));
          }, titleText).catch(() => false);
          if (rowHasTitle) {
            submitSuccess = true;
            successText = 'Row with title detected';
          }
        } catch(_) {}
      }
    } catch(e) {}
  assertions.push(mkAssert({ id: 'submitSuccess', label: 'Ticket submit acknowledged', pass: submitSuccess, selector: successSelectors.join(', '), screenshot: shotAfter, text: successText, type: 'stateful', elapsedMs: Date.now() - tAck0 }));

    // Ensure deterministic list visibility like the original stable flow:
    // After submit, click #ticketHistoryBtn once (not toggle), wait for .ticket-row
    // Skip #ticketRefreshBtn if history panel is hidden
    try {
      const historyBtn = await page.$('#ticketHistoryBtn');
      if (historyBtn) {
        await historyBtn.click().catch(() => {});
        try { await page.waitForSelector('.ticket-row', { timeout: 8000 }); } catch (_) {}
        // Only refresh if history panel appears visible
        const historyVisible = await page.evaluate(() => {
          const hist = document.querySelector('#ticketHistory');
          if (!hist) return false;
          const style = window.getComputedStyle(hist);
          return style.display !== 'none' && style.visibility !== 'hidden' && hist.offsetParent !== null;
        }).catch(() => false);
        // Always attempt a refresh click (even if panel visibility heuristic fails)
        const refreshBtn = await page.$('#ticketRefreshBtn');
        if (refreshBtn) {
          // Wait for an admin-ajax call or small timeout after clicking
          const ajaxWait = page.waitForResponse(r => r.url().includes('admin-ajax.php'), { timeout: 8000 }).catch(()=>null);
          await refreshBtn.click().catch(() => {});
          await Promise.race([ajaxWait, page.waitForTimeout(800)]);
          try { await page.waitForSelector('.ticket-row', { timeout: 8000 }); } catch (_) {}
        } else {
          // Try clicking a link/button with refresh semantics (Hebrew/English)
          await page.evaluate(() => {
            const labels = ['רענן רשימה','רענן','Refresh list','Refresh'];
            const els = Array.from(document.querySelectorAll('a,button'));
            for (const el of els) {
              const t = (el.innerText||'').trim();
              if (labels.some(l => t.includes(l))) { try { el.click(); } catch(_) {} }
            }
          }).catch(()=>{});
          await page.waitForTimeout(600);
        }
      }
    } catch (_) {}

    // Immediate appearance check (without reload) after submit/banner
    const tAppear0 = Date.now();
    try {
      const rowText = await page.evaluate(() => {
        const sel = 'table tbody tr, .tickets-list .ticket-row, .bb-table tbody tr';
        const rows = Array.from(document.querySelectorAll(sel));
        if (!rows.length) return (document.body?.innerText || '');
        return rows.map(r => r.innerText).join('\n');
      });
      ticketInList = !!(rowText && rowText.includes(titleText));
    } catch(_) {}

    // Deterministic verification (5I+7): First try a direct lookup endpoint by title with retries and cache-buster
    if (!ticketInList) {
      try {
        const ajaxBase = `${base.replace(/\/+$/,'')}/wp-admin/admin-ajax.php`;
        const findDetails = await page.evaluate(async (ajaxBase, title) => {
          const attempts = [];
          const tryFetch = async (params, usePost=false) => {
            const u = ajaxBase + (usePost ? '' : ('?' + new URLSearchParams(params).toString()));
            const opts = usePost ? { method: 'POST', credentials: 'include', headers: { 'Accept': 'application/json','Content-Type':'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) } : { credentials: 'include', headers: { 'Accept': 'application/json' } };
            try {
              const res = await fetch(u, opts);
              const status = res.status;
              let data = null;
              try { data = await res.json(); } catch (_) { data = null; }
              attempts.push({ method: usePost ? 'POST' : 'GET', url: u, status, data });
              if (!res.ok) return null;
              return data;
            } catch (e) { attempts.push({ method: usePost ? 'POST' : 'GET', url: u, error: String(e && e.message || e) }); return null; }
          };
          // attempt up to 3 times with cache buster and then POST fallback
          const baseParams = { action: 'find_ticket_by_title', title: title };
          let found = false;
          for (let i=0;i<3;i++) {
            const params = Object.assign({}, baseParams, { _: Date.now() + '-' + i });
            let data = await tryFetch(params, false);
            if (!data) data = await tryFetch(params, true);
            if (data) {
              if (data.found === true) { found = true; break; }
              if (typeof data === 'boolean') { found = data; break; }
              if (typeof data.found === 'string' && String(data.found).toLowerCase() === 'true') { found = true; break; }
            }
            await new Promise(r => setTimeout(r, 400 * (i+1)));
          }
          return { found, attempts };
        }, ajaxBase, titleText);
        // Persist detailed endpoint JSON and searched title into flow logs for Phase 8R2 diagnostics
        writeFlowLogJSON('ticket.find_ticket_by_title.json', { searchedTitle: titleText, endpoint: 'find_ticket_by_title', base: ajaxBase, details: findDetails });
        const foundByFind = !!(findDetails && findDetails.found);
        if (foundByFind) {
          ticketInList = true;
          console.log('[ticketFlow] ticket title confirmed via find_ticket_by_title endpoint');
        }
      } catch (_) {}
    }
    // Fallback (5G): JSON lookup via admin-ajax for current user's ticket titles
    if (!ticketInList) {
      try {
        const ajaxUrl = `${base.replace(/\/+$/, '')}/wp-admin/admin-ajax.php?action=get_ticket_titles&_=${Date.now()}`;
        // Warm the list by calling the endpoint client-side before scanning DOM
        await page.evaluate(async (url) => { try { await fetch(url, { credentials: 'include' }); } catch(_){} }, ajaxUrl).catch(()=>{});
        const ajaxDetails = await page.evaluate(async (url, title) => {
          try {
            const res = await fetch(url, { credentials: 'include', headers: { 'Accept': 'application/json' } });
            const status = res.status;
            if (!res.ok) return { ok: false, status };
            const data = await res.json();
            const extract = (d) => {
              if (!d) return [];
              if (Array.isArray(d)) return d;
              if (Array.isArray(d.titles)) return d.titles;
              if (typeof d.titles !== 'undefined' && d.titles !== null) return [d.titles].flat();
              return [];
            };
            const titles = extract(data).map(t => (typeof t === 'string' ? t : (t && t.title) || ''));
            const includesExact = titles.includes(title);
            const includesPartial = titles.some(t => (t || '').includes(title));
            return { ok: true, status, includesExact, includesPartial, titles };
          } catch (e) {
            return { ok: false, error: String(e && e.message || e) };
          }
        }, ajaxUrl, titleText);
        // Persist details for equality vs inclusion confirmation
        writeFlowLogJSON('ticket.get_ticket_titles.json', { searchedTitle: titleText, endpoint: 'get_ticket_titles', url: ajaxUrl, details: ajaxDetails });
        const foundByAjax = !!(ajaxDetails && ajaxDetails.ok && (ajaxDetails.includesExact || ajaxDetails.includesPartial));
        if (foundByAjax) {
          ticketInList = true;
          console.log('[ticketFlow] ticket title confirmed via admin-ajax JSON lookup');
        }
      } catch (_) {}
    }
  assertions.push(mkAssert({ id: 'ticketAppearsInList', label: 'New ticket appears in list after submit', pass: ticketInList, text: titleText, type: 'stateful', elapsedMs: Date.now() - tAppear0 }));

    // Persistence: Reload /tickets/ and confirm the new ticket title appears (with small polling + cache-busting)
  let ticketPersists = false;
  const tPersist0 = Date.now();
    try {
      // Ensure any pending navigation/AJAX is complete before reloading
      await Promise.race([
        page.waitForNavigation({ waitUntil: ['domcontentloaded','load','networkidle2'], timeout: 8000 }).catch(() => null),
        page.waitForTimeout(800)
      ]);
      const maxPoll = 5;
      for (let i = 0; i < maxPoll && !ticketPersists; i++) {
        const bust = `?_=${Date.now()}`;
        await page.goto(url + bust, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{});
        await page.waitForTimeout(Math.min(200 * Math.pow(2, i), 1600));
        // try to trigger any AJAX-driven list refresh by clicking a common refresh or pagination control if present
        try {
          // Re-assert deterministic list visibility on each poll (history only, no toggling)
          const historyBtn = await page.$('#ticketHistoryBtn');
          if (historyBtn) {
            await historyBtn.click().catch(() => {});
            try { await page.waitForSelector('.ticket-row', { timeout: 8000 }); } catch (_) {}
          }
          const controls = await page.$$('.pagination a, .tablenav .next, .tablenav .prev, .reload, .refresh-button, a.view-all, a[rel="next"], a[rel="prev"], #ticketRefreshBtn');
          if (controls && controls.length) {
            for (const c of controls.slice(0,2)) { await c.click().catch(()=>{}); await page.waitForTimeout(500); }
          }
          // Also try anchors with text content like "הצג הכל" / "צפה בכל"
          await page.evaluate(() => {
            const texts = ['הצג הכל','צפה בכל','View All','רענן רשימה','רענן','Refresh'];
            const links = Array.from(document.querySelectorAll('a'));
            for (const a of links) {
              const t = (a.textContent||'').trim();
              if (texts.some(x => t.includes(x))) { try { a.click(); } catch(_) {} }
            }
          }).catch(()=>{});
          // Warm and verify via admin-ajax get_ticket_titles between polls
          try {
            const ok = await page.evaluate(async (url, title) => {
              try {
                const res = await fetch(url, { credentials: 'include', headers: { 'Accept': 'application/json' } });
                if (!res.ok) return false;
                const data = await res.json();
                const list = Array.isArray(data) ? data : (Array.isArray(data.titles) ? data.titles : []);
                return list.some(t => (typeof t === 'string' ? t : (t && t.title) || '').includes(title));
              } catch(_) { return false; }
            }, `${base.replace(/\/+$/, '')}/wp-admin/admin-ajax.php?action=get_ticket_titles&_=${Date.now()}`, titleText);
            if (ok) ticketPersists = true;
          } catch(_) {}
        } catch(_) {}
        const scan = await page.evaluate(() => {
          const bodies = [
            ...Array.from(document.querySelectorAll('table tbody tr, .tickets-list .ticket-row, .bb-table tbody tr')).map(r => r.innerText),
            (document.body && document.body.innerText) || ''
          ];
          return bodies.join('\n');
        });
        if (scan && titleText && scan.includes(titleText)) { ticketPersists = true; break; }
      }
    } catch(e) {}
  assertions.push(mkAssert({ id: 'ticketPersistsAfterReload', label: 'New ticket visible after reload', pass: ticketPersists, text: titleText, type: 'stateful', elapsedMs: Date.now() - tPersist0 }));

    // BuddyPanel validation (non-blocking)
    try {
      const nav = await validateSidebarNav(page, url, outputDir, { contentSelectors: ['table tbody', '.entry-content', 'body'], shotName: 'tickets_sidebar.png' });
      if (nav) Object.assign(meta, nav);
      const header = await page.$('header, .bb-header, .site-header');
      if (header) meta.headerPresent = true;
    } catch(e) {}

    // return success with metadata+assertions
    meta.assertions = assertions;
    return { ok: true, meta };
  } catch (err) {
    console.warn('[ticketFlow] flow error', err.message);
    await page.screenshot({ path: `${outputDir}/tickets_error.png` }).catch(()=>{});
    meta.assertions = assertions;
    return { ok: false, error: err.message, meta };
  }
}
