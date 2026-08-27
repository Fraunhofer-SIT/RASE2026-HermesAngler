'use strict';

/**
 * Example: Hook XMLHttpRequest to log all network requests
 *
 * Logs open() and send() arguments for every XHR, excluding Frida's
 * own log transport (https://localhost/frida-log).
 *
 * Usage:
 *   Copy-Item .\examples\hook-xhr.js .\hooks.js
 *   .\run-frida-agent.ps1 -BundleId <your-bundle-id>
 *
 * The module ID for XMLHttpRequest varies by app. In Tellonym it was 9488.
 * Use logModuleFunctions() in the Frida REPL to find the module that
 * exports XMLHttpRequest in your target app.
 */

module.exports = function markUserSection(hookFunction, log, flush, getModuleExport, previewValue, root) {
  var TARGET_MODULE_ID = '9488';
  var TARGET_EXPORT_NAME = 'XMLHttpRequest';
  var FRIDA_LOG_URL = 'https://localhost/frida-log';

  var XMLHttpRequestCtor = getModuleExport(TARGET_MODULE_ID);
  if (!XMLHttpRequestCtor || typeof XMLHttpRequestCtor[TARGET_EXPORT_NAME] !== 'function') {
    log('[user-runtime] module ' + TARGET_MODULE_ID + ' ' + TARGET_EXPORT_NAME + ' not found');
    flush();
    return;
  }

  var proto = XMLHttpRequestCtor[TARGET_EXPORT_NAME].prototype;
  var originalOpen = proto.open;
  var originalSend = proto.send;

  proto.open = function (method, url) {
    this.__fridaUrl = url;
    if (String(url).indexOf(FRIDA_LOG_URL) !== 0) {
      log('[user-runtime][xhr.open] ' + method + ' ' + url);
      flush();
    }
    return originalOpen.apply(this, arguments);
  };

  proto.send = function (body) {
    if (this.__fridaUrl && String(this.__fridaUrl).indexOf(FRIDA_LOG_URL) !== 0) {
      log('[user-runtime][xhr.send] ' + this.__fridaUrl + ' body=' + previewValue(body));
      flush();
    }
    return originalSend.apply(this, arguments);
  };

  log('[user-runtime] XHR hooks installed');
  flush();
};
