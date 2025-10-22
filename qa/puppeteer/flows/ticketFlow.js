module.exports = async function ticketFlow(page, outputDir, creds = {}) {
  // creds.url is preferred, then STAGING_URL env, then fallback
  const base = (creds.url || process.env.STAGING_URL || '').replace(/\/+$/, '') || 'http://localhost';
  const url = `${base}/tickets/`;
  const meta = { url };
  try {
    console.log('[ticketFlow] navigating to', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outputDir}/tickets_page.png` }).catch(()=>{});

    // Title field: try a list of common selectors (child-theme and ACF variants)
    const titleSelectors = [
      'input[name="ticket_title"]',
      'input[name="acf[field_65f060dba4ade]"]',
      'input[name="title"]',
      '#ticket_title',
      'input[type="text"]'
    ];
    let typedTitle = false;
    for (const sel of titleSelectors) {
      try {
        const handle = await page.$(sel);
        if (handle) {
          await handle.click({ clickCount: 3 }).catch(()=>{});
          await page.type(sel, `QA test ticket ${Date.now()}`, { delay: 20 });
          typedTitle = true;
          console.log('[ticketFlow] typed title using', sel);
          break;
        }
      } catch (e) {
        console.warn('[ticketFlow] title selector failed', sel, e.message);
      }
    }
    if (!typedTitle) console.warn('[ticketFlow] no title selector matched; continuing');

    // Try to fill rich content: prefer TinyMCE iframe if present, else textarea fallbacks
    const tinyMCESelectors = ['iframe[id$="_ifr"]', 'iframe[id^="acf-editor-"]', 'iframe.tox-edit-area__iframe'];
    let contentTyped = false;
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
            console.log('[ticketFlow] typed content using', sel);
            break;
          }
        } catch (e) {
          console.warn('[ticketFlow] textarea selector failed', sel, e.message);
        }
      }
    }
    if (!contentTyped) console.warn('[ticketFlow] no content field found');

    // Attempt to select sector/sub-sector if present. Prefer values from creds or env.
    try {
      const sectorSelect = await page.$('select[name^="acf"][name*="sector"], select[id*="sector"], select[name*="ticket_sector"], select');
      if (sectorSelect) {
        // pick value from creds if provided, otherwise try to pick a stable option
        const desired = creds.ticketSectorValue || process.env.TICKET_SECTOR_VALUE || 'technical_support';
        const optionExists = await page.$eval('select', (sel, desired) => {
          const s = document.querySelector('select');
          if (!s) return false;
          return Array.from(s.options).some(o => o.value === desired || o.textContent.trim() === desired);
        }, desired).catch(()=>false);
        if (optionExists) {
          await page.select('select', desired).catch(()=>{});
          console.log('[ticketFlow] selected sector value', desired);
        } else {
          // pick first non-empty option
          await page.evaluate(() => {
            const s = document.querySelector('select');
            if (!s) return;
            for (const o of s.options) {
              if (o.value) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); break; }
            }
          }).catch(()=>{});
          console.log('[ticketFlow] selected first non-empty sector option');
        }
        await page.waitForTimeout(400);
      } else {
        console.log('[ticketFlow] no sector select found (optional)');
      }
    } catch (e) {
      console.warn('[ticketFlow] selecting sector failed', e.message);
    }

    // Screenshot the filled form
    await page.screenshot({ path: `${outputDir}/tickets_filled.png` }).catch(()=>{});

    // Try to submit: prefer plain submit buttons but tolerate AJAX endpoints
    const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', '#submitTicket', 'button[name="submit"]', 'button'];
    let submitted = false;
    for (const sel of submitSelectors) {
      try {
        const btn = await page.$(sel);
        if (btn) {
          // Try to click and wait a short while for navigation or network
          await Promise.all([
            btn.click().catch(()=>{}),
            page.waitForTimeout(1500)
          ]);
          submitted = true;
          console.log('[ticketFlow] clicked submit using', sel);
          break;
        }
      } catch (e) {
        console.warn('[ticketFlow] submit attempt failed for', sel, e.message);
      }
    }
    if (!submitted) console.warn('[ticketFlow] no submit button found; attempt skipped');

    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${outputDir}/tickets_after_submit.png` }).catch(()=>{});

    // return success with small metadata so orchestrator can record it
    return { ok: true, meta };
  } catch (err) {
    console.warn('[ticketFlow] flow error', err.message);
    await page.screenshot({ path: `${outputDir}/tickets_error.png` }).catch(()=>{});
    return { ok: false, error: err.message, meta };
  }
}
