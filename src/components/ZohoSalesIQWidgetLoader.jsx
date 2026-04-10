import { useEffect } from 'react';

const ZOHO_SALESIQ_SCRIPT_ID = 'zsiqscript';
const ZOHO_SALESIQ_WIDGET_SRC =
  'https://salesiq.zohopublic.in/widget?wc=siq79be0a217878e0446b69dce568ecb00ecb77d7f8f0f8e11c5824d0d15aa2db43';
const ZOHO_PENDING_CHAT_REQUEST_KEY = '__easyHomesZohoPendingChatRequest';
const ZOHO_SCRIPT_LOAD_ERROR_KEY = '__easyHomesZohoScriptLoadError';

function ensureZohoSalesIQ() {
  if (typeof window === 'undefined') {
    return null;
  }

  window.$zoho = window.$zoho || {};
  window.$zoho.salesiq = window.$zoho.salesiq || {};

  if (typeof window.$zoho.salesiq.ready !== 'function') {
    window.$zoho.salesiq.ready = function ready() {};
  }

  return window.$zoho.salesiq;
}

function appendZohoSalesIQScript() {
  if (typeof document === 'undefined') {
    return;
  }

  const existingScript = document.getElementById(ZOHO_SALESIQ_SCRIPT_ID);
  if (existingScript) {
    return;
  }

  if (typeof window !== 'undefined') {
    window[ZOHO_SCRIPT_LOAD_ERROR_KEY] = false;
  }

  const script = document.createElement('script');
  script.id = ZOHO_SALESIQ_SCRIPT_ID;
  script.src = ZOHO_SALESIQ_WIDGET_SRC;
  script.defer = true;
  script.onerror = () => {
    if (typeof window !== 'undefined') {
      window[ZOHO_SCRIPT_LOAD_ERROR_KEY] = true;
    }
  };
  document.body.appendChild(script);
}

function setZohoSalesIQFloatButtonVisibility(mode) {
  if (typeof window === 'undefined') {
    return;
  }

  const method = window.$zoho?.salesiq?.floatbutton?.visible;
  if (typeof method === 'function') {
    method(mode);
  }
}

function setZohoSalesIQChatWindowVisibility(mode) {
  if (typeof window === 'undefined') {
    return;
  }

  const salesiq = window.$zoho?.salesiq;
  const visibilityMethods = [
    salesiq?.floatwindow?.visible,
    salesiq?.chatwindow?.visible,
  ];

  visibilityMethods.forEach((method) => {
    if (typeof method === 'function') {
      method(mode);
    }
  });
}

function applyZohoSalesIQTheme(salesiq, theme) {
  if (!theme || typeof salesiq?.set !== 'function') {
    return;
  }

  const entries = [
    ['theme.color', theme.color],
    ['theme.primary', theme.primary || theme.color],
    ['theme.accent', theme.accent || theme.color],
    ['theme.title', theme.title],
    ['theme.text', theme.text],
    ['theme.background', theme.background],
    ['theme.surface', theme.surface],
  ];

  entries.forEach(([key, value]) => {
    if (!value) {
      return;
    }

    try {
      salesiq.set(key, value);
    } catch (error) {
      // Ignore unknown theme keys; SalesIQ API support varies by tenant/version.
    }
  });
}

function applyZohoSalesIQConfiguration({ hideFloatButton, homeWidgets, theme }) {
  if (typeof window === 'undefined') {
    return;
  }

  const salesiq = window.$zoho?.salesiq;
  if (!salesiq) {
    return;
  }

  if (hideFloatButton) {
    setZohoSalesIQFloatButtonVisibility('hide');
  }

  applyZohoSalesIQTheme(salesiq, theme);

  if (Array.isArray(homeWidgets) && homeWidgets.length > 0 && typeof salesiq.set === 'function') {
    salesiq.set('home.widgets', homeWidgets);
  }
}

function flushPendingZohoSalesIQChatRequest() {
  if (typeof window === 'undefined') {
    return false;
  }

  const salesiq = window.$zoho?.salesiq;
  const pendingRequest = window[ZOHO_PENDING_CHAT_REQUEST_KEY];

  if (!salesiq?.__easyHomesReady || !pendingRequest) {
    return false;
  }

  if (pendingRequest.question && typeof salesiq.visitor?.question === 'function') {
    salesiq.visitor.question(pendingRequest.question);
  }

  setZohoSalesIQChatWindowVisibility('show');
  window[ZOHO_PENDING_CHAT_REQUEST_KEY] = null;

  return true;
}

export async function openZohoSalesIQChat({ question, timeoutMs = 12000 } = {}) {
  if (typeof window === 'undefined') {
    return false;
  }

  ensureZohoSalesIQ();
  window[ZOHO_PENDING_CHAT_REQUEST_KEY] = { question };
  appendZohoSalesIQScript();

  if (flushPendingZohoSalesIQChatRequest()) {
    return true;
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const poll = () => {
      if (flushPendingZohoSalesIQChatRequest()) {
        resolve(true);
        return;
      }

      if (window[ZOHO_SCRIPT_LOAD_ERROR_KEY]) {
        resolve(false);
        return;
      }

      if ((Date.now() - startedAt) >= timeoutMs) {
        resolve(false);
        return;
      }

      window.setTimeout(poll, 180);
    };

    poll();
  });
}

export default function ZohoSalesIQWidgetLoader({
  hideFloatButton = false,
  homeWidgets = [],
  theme = null,
}) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const salesiq = ensureZohoSalesIQ();
    if (!salesiq) {
      return undefined;
    }

    const previousReady = salesiq.ready;
    salesiq.ready = function salesiqReady(...args) {
      if (typeof previousReady === 'function') {
        previousReady.apply(this, args);
      }

      salesiq.__easyHomesReady = true;
      applyZohoSalesIQConfiguration({ hideFloatButton, homeWidgets, theme });

      // Re-apply theme once after initial paint in case UI mounts asynchronously.
      window.setTimeout(() => {
        applyZohoSalesIQTheme(salesiq, theme);
      }, 250);

      flushPendingZohoSalesIQChatRequest();
    };

    appendZohoSalesIQScript();

    if (salesiq.__easyHomesReady) {
      applyZohoSalesIQConfiguration({ hideFloatButton, homeWidgets, theme });
      flushPendingZohoSalesIQChatRequest();
    }

    return () => {
      if (window.$zoho?.salesiq) {
        window.$zoho.salesiq.ready = previousReady;
      }

      setZohoSalesIQChatWindowVisibility('hide');
      setZohoSalesIQFloatButtonVisibility('hide');
    };
  }, [hideFloatButton, homeWidgets, theme]);

  return null;
}
