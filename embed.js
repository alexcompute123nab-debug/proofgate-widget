(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var base = '';
  try { base = new URL(script.src).origin; } catch (e) { base = ''; }

  var to = String(script.getAttribute('data-to') || 'TM2deFM4byG1rVvhA15fTJD7gLaE9xvSid').trim();
  var requested = Number(script.getAttribute('data-amount'));

  var themeSetting = String(script.getAttribute('data-theme') || 'auto').toLowerCase();
  var pageTheme = document.documentElement && document.documentElement.getAttribute
    ? document.documentElement.getAttribute('data-theme') : '';
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  function hostIsDark() {
    try {
      var bg = getComputedStyle(document.body).backgroundColor
        || getComputedStyle(document.documentElement).backgroundColor || '';
      var parts = bg.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      if (parts) {
        var lightness = (Number(parts[1]) * 299 + Number(parts[2]) * 587 + Number(parts[3]) * 114) / 1000;
        return lightness < 110;
      }
    } catch (e) {}
    return systemDark;
  }
  var resolvedDark = pageTheme === 'dark' || pageTheme === 'light' ? pageTheme === 'dark' : hostIsDark();
  var theme = themeSetting === 'dark' || themeSetting === 'light'
    ? themeSetting
    : (resolvedDark ? 'dark' : 'light');

  var variantSetting = String(script.getAttribute('data-variant') || 'auto').toLowerCase();
  var variant = variantSetting === 'solid' || variantSetting === 'dark' || variantSetting === 'outline'
    ? variantSetting
    : (theme === 'dark' ? 'dark' : 'solid');
  var accentRaw = String(script.getAttribute('data-accent') || '#0F5132').trim();
  var customAccent = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(accentRaw) ? accentRaw : '#0F5132';
  var customLabel = script.getAttribute('data-label');

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(to)) {
    if (window.console) console.warn('ProofGate widget: data-to must be a Tron base58 address.');
    return;
  }
  if (!isFinite(requested) || requested <= 0) {
    if (window.console) console.warn('ProofGate widget: data-amount must be a positive number.');
    return;
  }

  var host = document.createElement('div');
  host.setAttribute('data-proofgate-widget', '');
  host.setAttribute('data-theme', theme);
  host.setAttribute('data-variant', variant);
  host.style.setProperty('--pg-accent', customAccent);
  host.style.setProperty('--pgw-accent', customAccent);
  host.style.setProperty('--pgw-accent-strong', customAccent);
  var hex = customAccent.slice(1);
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  var r = parseInt(hex.slice(0, 2), 16);
  var g = parseInt(hex.slice(2, 4), 16);
  var b = parseInt(hex.slice(4, 6), 16);
  var bright = (r * 299 + g * 587 + b * 114) / 1000;
  host.style.setProperty('--pgw-on-accent', bright > 150 ? '#08110D' : '#F2F4F3');
  host.style.setProperty('--pgw-focus', customAccent);
  var shadow = host.attachShadow({ mode: 'open' });

  var CSS = [
    ':host{display:inline-block;contain:content;--pgw-paper:#fbfaf5;--pgw-paper-2:#f1efe7;--pgw-ink:#16211c;--pgw-ink-2:#33423a;--pgw-muted:#5d6a62;--pgw-rule:#d8d3c5;--pgw-rule-strong:#8d958d;--pgw-accent:#1c6b4e;--pgw-accent-strong:#14503a;--pgw-on-accent:#fbfaf5;--pgw-focus:#176b4c;--pgw-danger:#982f2f;--pgw-overlay:rgba(17,26,21,0.62);--pgw-white:#ffffff;--pgw-sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--pgw-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--pgw-radius:6px;--pgw-radius-lg:10px;--pgw-dur:140ms}',
    ':host([data-theme="dark"]){--pgw-paper:#141715;--pgw-paper-2:#1B1F1D;--pgw-ink:#F2F4F3;--pgw-ink-2:#C8CECB;--pgw-muted:#98A29E;--pgw-rule:#242926;--pgw-rule-strong:#3A423E;--pgw-accent:#34D399;--pgw-accent-strong:#6EE7B7;--pgw-on-accent:#08110D;--pgw-focus:#34D399;--pgw-danger:#F87171;--pgw-overlay:rgba(5,7,6,0.72);--pgw-white:#FFFFFF}',
    '*,*::before,*::after{box-sizing:border-box}',
    '[hidden]{display:none!important}',
    '.pg-pay-btn{position:relative;display:inline-flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 16px;border-radius:12px;font-family:"Inter",system-ui,-apple-system,sans-serif;font-size:14px;font-weight:500;letter-spacing:-0.01em;line-height:1;cursor:pointer;user-select:none;transition:transform 0.14s cubic-bezier(0.22,1,0.36,1),box-shadow 0.18s ease,background-color 0.18s ease,border-color 0.18s ease}',
    '.pg-pay-btn:hover{transform:translateY(-1px)}',
    '.pg-pay-btn:active{transform:translateY(1px) scale(0.992)}',
    '.pg-pay-btn:focus-visible{outline:2px solid var(--pgw-focus);outline-offset:3px}',
    '.pg-variant-solid{background-color:var(--pg-accent,#0F5132);color:#ffffff;border:1px solid rgba(255,255,255,0.14);box-shadow:inset 0 1px 0 rgba(255,255,255,0.24),0 1px 2px rgba(0,0,0,0.14),0 8px 20px -6px rgba(15,81,50,0.42)}',
    '.pg-variant-solid:hover{box-shadow:inset 0 1px 0 rgba(255,255,255,0.3),0 4px 10px rgba(0,0,0,0.16),0 12px 24px -6px rgba(15,81,50,0.5)}',
    '.pg-variant-solid .pg-icon-wrap{background:rgba(255,255,255,0.16);color:#ffffff}',
    '.pg-variant-solid .pg-net-badge{background:rgba(0,0,0,0.22)}',
    '.pg-variant-dark{background-color:#111312;color:#f4f6f5;border:1px solid #2a2f2c;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),0 4px 14px -2px rgba(0,0,0,0.35)}',
    '.pg-variant-dark:hover{background-color:#171a18;border-color:#3c4440}',
    '.pg-variant-dark .pg-icon-wrap{background:rgba(16,185,129,0.16);color:#34D399}',
    '.pg-variant-dark .pg-net-badge{background:rgba(255,255,255,0.08)}',
    '.pg-variant-outline{background-color:transparent;color:var(--pg-accent,#0F5132);border:1.5px solid var(--pg-accent,#0F5132);box-shadow:0 1px 2px rgba(0,0,0,0.04)}',
    '.pg-variant-outline:hover{background-color:rgba(16,185,129,0.06)}',
    '.pg-variant-outline .pg-icon-wrap{background:rgba(15,81,50,0.1)}',
    '.pg-variant-outline .pg-net-badge{background:rgba(15,81,50,0.08)}',
    '.pg-left{display:inline-flex;align-items:center;gap:10px}',
    '.pg-icon-wrap{width:20px;height:20px;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.pg-right{display:inline-flex;align-items:center;gap:8px;padding-left:12px;border-left:1px solid currentColor;border-left-color:rgba(128,128,128,0.28)}',
    '.pg-amount{font-family:"JetBrains Mono",var(--pgw-mono);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}',
    '.pg-net-badge{font-family:"JetBrains Mono",var(--pgw-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.05em;padding:2px 6px;border-radius:4px}',
    '.pgw-overlay{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;background:var(--pgw-overlay);backdrop-filter:blur(3px);font-family:var(--pgw-sans);color:var(--pgw-ink)}',
    '.pgw-dialog{width:min(420px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:24px;border:1px solid var(--pgw-rule);border-radius:var(--pgw-radius-lg);background:var(--pgw-paper);color:var(--pgw-ink);line-height:1.5;overscroll-behavior:contain;box-shadow:0 20px 50px -12px rgba(0,0,0,0.35)}',
    '.pgw-head{display:flex;align-items:start;justify-content:space-between;gap:16px;margin-bottom:16px}',
    '.pgw-title{margin:0;font:600 21px/1.25 var(--pgw-sans);letter-spacing:-0.01em;color:var(--pgw-ink)}',
    '.pgw-close{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;flex:0 0 auto;padding:0;border:1px solid var(--pgw-rule);border-radius:var(--pgw-radius);background:none;color:var(--pgw-ink-2);cursor:pointer}',
    '.pgw-close:hover{background:var(--pgw-paper-2);color:var(--pgw-ink)}',
    '.pgw-close:active{transform:translateY(1px)}',
    '.pgw-close:focus-visible{outline:2px solid var(--pgw-focus);outline-offset:2px}',
    '.pgw-note{margin:0 0 4px;font-size:14px;color:var(--pgw-muted)}',
    '.pgw-amount{margin:0 0 14px;font:500 27px/1.2 var(--pgw-mono);letter-spacing:-0.02em;color:var(--pgw-ink);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}',
    '.pgw-qr{display:flex;justify-content:center;padding:10px;border-radius:var(--pgw-radius);background:var(--pgw-white);border:1px solid var(--pgw-rule);width:fit-content;margin:0 auto 16px}',
    '.pgw-qr img{display:block;width:192px;height:192px;background:var(--pgw-white)}',
    '.pgw-address{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:stretch;margin-bottom:16px}',
    '.pgw-address code{display:flex;align-items:center;min-width:0;padding:10px 12px;border:1px solid var(--pgw-rule);border-radius:var(--pgw-radius);background:var(--pgw-paper-2);color:var(--pgw-ink-2);font:400 12px/1.4 var(--pgw-mono);overflow-wrap:anywhere}',
    '.pgw-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border:1px solid var(--pgw-accent);border-radius:var(--pgw-radius);background:var(--pgw-accent);color:var(--pgw-on-accent);font:600 14px/1.2 var(--pgw-sans);cursor:pointer;transition:transform var(--pgw-dur) cubic-bezier(0.2,0.7,0.3,1)}',
    '.pgw-btn:hover{background:var(--pgw-accent-strong)}',
    '.pgw-btn:active{transform:translateY(1px)}',
    '.pgw-btn:focus-visible{outline:2px solid var(--pgw-focus);outline-offset:3px}',
    '.pgw-btn[disabled]{opacity:0.55;cursor:not-allowed}',
    '.pgw-btn-2{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 14px;border:1px solid var(--pgw-rule-strong);border-radius:var(--pgw-radius);background:none;color:var(--pgw-ink);font:600 14px/1.2 var(--pgw-sans);cursor:pointer;transition:transform var(--pgw-dur) cubic-bezier(0.2,0.7,0.3,1)}',
    '.pgw-btn-2:hover{border-color:var(--pgw-ink-2);color:var(--pgw-accent-strong)}',
    '.pgw-btn-2:active{transform:translateY(1px)}',
    '.pgw-btn-2:focus-visible{outline:2px solid var(--pgw-focus);outline-offset:3px}',
    '.pgw-actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:14px}',
    '.pgw-link{color:var(--pgw-accent);font-weight:600;text-decoration:none}',
    '.pgw-link:hover{color:var(--pgw-accent-strong)}',
    '.pgw-link:focus-visible{outline:2px solid var(--pgw-focus);outline-offset:3px;border-radius:2px}',
    '.pgw-status{min-height:22px;margin:0;font-size:13px;line-height:1.5;color:var(--pgw-muted)}',
    '.pgw-status.is-error{color:var(--pgw-danger);font-weight:600}',
    '.pgw-help{margin:12px 0 0;font-size:12px;line-height:1.5;color:var(--pgw-muted)}',
    '.pgw-paid-title{margin:0 0 6px;font:600 19px/1.3 var(--pgw-sans);color:var(--pgw-ink)}',
    '.pgw-txid{display:block;margin:10px 0 16px;padding:10px 12px;border-radius:var(--pgw-radius);background:var(--pgw-paper-2);font:400 12px/1.4 var(--pgw-mono);color:var(--pgw-ink-2);overflow-wrap:anywhere}',
    '.pgw-loading{margin:8px 0 0;font-size:14px;color:var(--pgw-muted)}',
    '@media (max-width:480px){.pgw-dialog{padding:20px}.pgw-amount{font-size:23px}.pgw-qr img{width:176px;height:176px}}',
    '@media (prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important}}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = CSS;

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  var trigger = el('button', 'pg-pay-btn pg-variant-' + variant);
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  var buttonLabel = customLabel && customLabel.trim() ? String(customLabel).slice(0, 80) : 'Pay with USDT';
  trigger.innerHTML = '<span class="pg-left">'
    + '<span class="pg-icon-wrap">'
    + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.5 10.6V7.5H18V4.5H6V7.5H10.5V10.6C6.9 10.8 4.2 11.6 4.2 12.6C4.2 13.6 6.9 14.4 10.5 14.6V19.5H13.5V14.6C17.1 14.4 19.8 13.6 19.8 12.6C19.8 11.6 17.1 10.8 13.5 10.6ZM12 13.5C8.5 13.5 5.8 12.9 5.8 12.3C5.8 11.7 8.5 11.2 12 11.2C15.5 11.2 18.2 11.7 18.2 12.3C18.2 12.9 15.5 13.5 12 13.5Z" fill="currentColor"/></svg>'
    + '</span><span>' + escapeText(buttonLabel) + '</span></span>'
    + '<span class="pg-right"><span class="pg-amount">' + escapeText(formatAmount(requested)) + '</span>'
    + '<span class="pg-net-badge">TRC20</span></span>';

  var overlay = el('div', 'pgw-overlay');
  overlay.hidden = true;

  var dialog = el('div', 'pgw-dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'pgw-title');
  dialog.setAttribute('aria-busy', 'false');
  dialog.tabIndex = -1;

  var head = el('div', 'pgw-head');
  var title = el('h2', 'pgw-title');
  title.id = 'pgw-title';
  title.textContent = 'Pay with USDT';
  var closeBtn = el('button', 'pgw-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close payment dialog');
  closeBtn.appendChild(closeIcon());
  head.appendChild(title);
  head.appendChild(closeBtn);

  var viewLoading = el('section');
  viewLoading.setAttribute('data-view', 'loading');
  var loadingText = el('p', 'pgw-loading');
  loadingText.setAttribute('role', 'status');
  loadingText.setAttribute('aria-live', 'polite');
  loadingText.textContent = 'Preparing the payment.';
  viewLoading.appendChild(loadingText);

  var viewPay = el('section');
  viewPay.setAttribute('data-view', 'pay');
  viewPay.hidden = true;
  var payNote = el('p', 'pgw-note');
  payNote.id = 'pgw-note';
  payNote.textContent = 'Send exactly this amount of USDT on Tron.';
  var amountEl = el('p', 'pgw-amount');
  var qrWrap = el('div', 'pgw-qr');
  var qrImg = el('img');
  qrImg.width = 192;
  qrImg.height = 192;
  qrWrap.appendChild(qrImg);
  var addressRow = el('div', 'pgw-address');
  var addressEl = el('code');
  var copyBtn = el('button', 'pgw-btn-2');
  copyBtn.type = 'button';
  copyBtn.textContent = 'Copy address';
  addressRow.appendChild(addressEl);
  addressRow.appendChild(copyBtn);
  var actions = el('div', 'pgw-actions');
  var walletLink = el('a', 'pgw-link');
  walletLink.textContent = 'Open in a Tron wallet';
  walletLink.rel = 'noopener';
  actions.appendChild(walletLink);
  var statusEl = el('p', 'pgw-status');
  statusEl.setAttribute('role', 'status');
  statusEl.setAttribute('aria-live', 'polite');
  statusEl.textContent = 'Waiting for the transfer.';
  var helpEl = el('p', 'pgw-help');
  helpEl.textContent = 'The amount is unique to this order, so the server can match your transfer.';
  viewPay.appendChild(payNote);
  viewPay.appendChild(amountEl);
  viewPay.appendChild(qrWrap);
  viewPay.appendChild(addressRow);
  viewPay.appendChild(actions);
  viewPay.appendChild(statusEl);
  viewPay.appendChild(helpEl);

  var viewPaid = el('section');
  viewPaid.setAttribute('data-view', 'paid');
  viewPaid.hidden = true;
  var paidTitle = el('h3', 'pgw-paid-title');
  paidTitle.textContent = 'Payment confirmed';
  var paidText = el('p', 'pgw-note');
  paidText.textContent = 'The transfer is on chain.';
  var txidEl = el('code', 'pgw-txid');
  var doneBtn = el('button', 'pgw-btn');
  doneBtn.type = 'button';
  doneBtn.textContent = 'Done';
  viewPaid.appendChild(paidTitle);
  viewPaid.appendChild(paidText);
  viewPaid.appendChild(txidEl);
  viewPaid.appendChild(doneBtn);

  var viewError = el('section');
  viewError.setAttribute('data-view', 'error');
  viewError.hidden = true;
  var errorText = el('p', 'pgw-status is-error');
  errorText.setAttribute('role', 'alert');
  var retryBtn = el('button', 'pgw-btn');
  retryBtn.type = 'button';
  retryBtn.textContent = 'Try again';
  var errorHelp = el('p', 'pgw-help');
  errorHelp.textContent = 'No payment was taken. You can close this and try later.';
  viewError.appendChild(errorText);
  viewError.appendChild(retryBtn);
  viewError.appendChild(errorHelp);

  dialog.appendChild(head);
  dialog.appendChild(viewLoading);
  dialog.appendChild(viewPay);
  dialog.appendChild(viewPaid);
  dialog.appendChild(viewError);
  overlay.appendChild(dialog);
  shadow.appendChild(style);
  shadow.appendChild(trigger);
  shadow.appendChild(overlay);

  var views = [viewLoading, viewPay, viewPaid, viewError];
  var orderId = null;
  var exactAmount = null;
  var payTo = to;
  var timer = null;
  var creating = false;
  var paying = false;
  var paid = false;
  var lastFocus = null;

  function closeIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3 3l10 10M13 3L3 13');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.6');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    return svg;
  }

  function formatAmount(n) {
    var s = Number(n).toFixed(6);
    return s.replace(/0+$/, '').replace(/\.$/, '');
  }

  function post(path, body) {
    return fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () {
        return { error: 'The server returned an unreadable response.' };
      }).then(function (data) {
        if (!res.ok && !data.error) data.error = 'Request failed with status ' + res.status + '.';
        return data;
      });
    });
  }

  function showView(name) {
    views.forEach(function (view) {
      view.hidden = view.getAttribute('data-view') !== name;
    });
  }

  function setStatus(text, isError) {
    statusEl.textContent = text;
    if (isError) statusEl.classList.add('is-error');
    else statusEl.classList.remove('is-error');
  }

  function showError(text) {
    errorText.textContent = text;
    showView('error');
    retryBtn.focus();
  }

  function setBusy(value) {
    dialog.setAttribute('aria-busy', value ? 'true' : 'false');
  }

  function tronUri() {
    return 'tron:' + payTo + '?amount=' + formatAmount(exactAmount) + '&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  }

  function renderPay() {
    amountEl.textContent = formatAmount(exactAmount) + ' USDT';
    addressEl.textContent = payTo;
    qrImg.alt = 'QR code for ' + formatAmount(exactAmount) + ' USDT to the payment address';
    qrImg.src = base + '/v1/qr?text=' + encodeURIComponent(tronUri());
    walletLink.href = tronUri();
  }

  function stopPoll() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startPoll() {
    stopPoll();
    pollOnce();
    timer = setInterval(pollOnce, 4000);
  }

  function pollOnce() {
    if (!orderId || paid || paying) return;
    paying = true;
    post('/v1/widget/status', { order_id: orderId }).then(function (data) {
      paying = false;
      if (data.status === 'paid') {
        showPaid(data.txid);
        return;
      }
      if (data.error) {
        setStatus(data.error, true);
        return;
      }
      setStatus('Waiting for the transfer.', false);
    }).catch(function () {
      paying = false;
      setStatus('Could not reach the server. Retrying.', true);
    });
  }

  function showPaid(txid) {
    if (paid) return;
    paid = true;
    stopPoll();
    txidEl.textContent = txid || 'Transaction reported by the server.';
    showView('paid');
    doneBtn.focus();
    var payload = {
      order_id: orderId,
      txid: txid || null,
      amount: exactAmount,
      to: payTo
    };
    try {
      host.dispatchEvent(new CustomEvent('proofgate:paid', {
        detail: payload,
        bubbles: true,
        composed: true
      }));
    } catch (e) {}
    try {
      document.dispatchEvent(new CustomEvent('proofgate:paid', { detail: payload }));
    } catch (e) {}
  }

  function createOrder() {
    if (creating) return;
    creating = true;
    setBusy(true);
    showView('loading');
    loadingText.textContent = 'Preparing the payment.';
    post('/v1/widget/order', { to: to, amount: requested, label: customLabel ? String(customLabel).slice(0, 80) : '' }).then(function (data) {
      creating = false;
      setBusy(false);
      if (data.error) {
        showError(data.error);
        return;
      }
      if (!data.pay || !data.order_id) {
        showError('The server did not return payment details.');
        return;
      }
      orderId = data.order_id;
      exactAmount = data.pay.amount;
      payTo = data.pay.to || to;
      renderPay();
      setStatus('Waiting for the transfer.', false);
      showView('pay');
      startPoll();
    }).catch(function () {
      creating = false;
      setBusy(false);
      showError('Could not reach the payment server.');
    });
  }

  function openDialog() {
    if (!overlay.hidden) return;
    lastFocus = shadow.activeElement || document.activeElement;
    overlay.hidden = false;
    if (paid) {
      showView('paid');
      doneBtn.focus();
      return;
    }
    if (orderId && exactAmount) {
      showView('pay');
      startPoll();
      closeBtn.focus();
      return;
    }
    closeBtn.focus();
    createOrder();
  }

  function closeDialog() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    stopPoll();
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function focusable() {
    return Array.prototype.slice.call(overlay.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'))
      .filter(function (node) {
        return !node.closest('[hidden]') && node.getClientRects().length > 0;
      });
  }

  overlay.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    var items = focusable();
    if (!items.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    var first = items[0];
    var last = items[items.length - 1];
    var active = shadow.activeElement;
    if (event.shiftKey) {
      if (active === first || !overlay.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  var pressedOutside = false;
  overlay.addEventListener('pointerdown', function (event) {
    pressedOutside = event.target === overlay;
  });
  overlay.addEventListener('pointerup', function (event) {
    if (pressedOutside && event.target === overlay) closeDialog();
  });

  trigger.addEventListener('click', openDialog);
  closeBtn.addEventListener('click', closeDialog);
  doneBtn.addEventListener('click', closeDialog);
  retryBtn.addEventListener('click', function () {
    orderId = null;
    exactAmount = null;
    createOrder();
  });

  copyBtn.addEventListener('click', function () {
    var text = addressEl.textContent;
    var old = copyBtn.textContent;
    var restore = function () {
      setTimeout(function () { copyBtn.textContent = old; }, 1600);
    };
    var done = function () {
      copyBtn.textContent = 'Copied';
      restore();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text);
        done();
      });
      return;
    }
    fallbackCopy(text);
    done();
  });

  function fallbackCopy(value) {
    var area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(area);
  }

  function mount() {
    var parent = script.parentNode;
    if (parent && parent !== document.head) {
      parent.insertBefore(host, script.nextSibling);
    } else {
      document.body.appendChild(host);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
