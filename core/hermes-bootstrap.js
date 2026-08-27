'use strict';

/**
 * hermes-bootstrap.js  (DO NOT EDIT — this is the plumbing)
 *
 * Contains all the boilerplate: log, flush, previewValue, getModuleExport,
 * version reading, retry/bootstrap logic. It imports the user's hook
 * function from hooks.js and inlines it into the serialized
 * string that gets injected into Hermes.
 *
 * frida-agent.js requires THIS file (not hooks.js directly).
 */

const userMarkUserSection = require('../hooks');

function installUserRuntimeScript() {
  var root = typeof globalThis !== 'undefined'
    ? globalThis
    : Function('return this')();

  if (root.__fridaUserRuntimeScriptInstalled) {
    return;
  }

  root.__fridaUserRuntimeScriptInstalled = true;

  var RETRY_DELAY_MS = 250;
  var MAX_ATTEMPTS = 40;

  function log(message) {
    try {
      if (root.frida && typeof root.frida.log === 'function') {
        root.frida.log(message);
      }
    } catch (_) {}
  }

  function flush() {
    try {
      if (root.frida && typeof root.frida.flushLogs === 'function') {
        root.frida.flushLogs();
      }
    } catch (_) {}
  }

  function previewValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
    if (typeof value === 'function') return '[function ' + (value.name || 'anonymous') + ']';
    try { return JSON.stringify(value); } catch (_) {}
    try { if (value && typeof value.toString === 'function') return String(value.toString()); } catch (_) {}
    return '[' + typeof value + ']';
  }

  function getModuleExport(moduleId) {
    if (!root.moduleExportsMap) return null;
    try { return root.moduleExportsMap[String(moduleId)]; } catch (_) { return null; }
  }

  function getRegisteredRootFunction(name) {
    try {
      if (root.__fridaRegisteredFunctions && typeof root.__fridaRegisteredFunctions[name] === 'function') {
        return root.__fridaRegisteredFunctions[name];
      }
    } catch (_) {}
    return null;
  }

  function readVersion() {
    var version = '(unknown)';
    try {
      if (typeof root.Platform !== 'undefined' && root.Platform) {
        version = 'Platform.OS=' + root.Platform.OS + ' v=' + (root.Platform.Version || '?');
      }
    } catch (_) {}
    try {
      var reactNative = getModuleExport('16');
      if (reactNative && reactNative.version) {
        version += ' react=' + reactNative.version;
      }
    } catch (_) {}
    return version;
  }

  // The user's hook function gets inlined here by the loader.
  // Helpers are passed as arguments so they survive .toString() inlining.
  var userFn = __USER_FN_PLACEHOLDER__;

  function markUserSection(hookFunction) {
    userFn(hookFunction, log, flush, getModuleExport, previewValue, root);
  }

  // ─── Bootstrap ────────────────────────────────────────────────────

  function tryInstall(attempt) {
    var hookFunction = getRegisteredRootFunction('hookFunction');

    if (hookFunction === null) {
      if (attempt >= MAX_ATTEMPTS) {
        log('[user-runtime][error] hookFunction root hook did not become available');
        flush();
        return;
      }

      setTimeout(function () {
        tryInstall(attempt + 1);
      }, RETRY_DELAY_MS);
      return;
    }

    log('[user-runtime] ready');
    flush();

    try {
      markUserSection(hookFunction);
    } catch (error) {
      log('[user-runtime][error] markUserSection failed: ' + (error && error.stack ? String(error.stack) : String(error)));
      flush();
    }
  }

  log('[user-runtime] scheduled');
  flush();

  setTimeout(function () {
    tryInstall(0);
  }, 0);
}

// ─── Build the final serialized string ──────────────────────────────
// Replace the placeholder with the user's function source so it gets
// inlined into the same scope when injected into Hermes.

var templateSource = installUserRuntimeScript.toString();
var userFnSource = userMarkUserSection.toString();
var finalSource = templateSource.replace(
  'var userFn = __USER_FN_PLACEHOLDER__;',
  'var userFn = ' + userFnSource + ';'
);

module.exports = '(' + finalSource + ')();';
