'use strict';

/**
 * Example: Find the module ID for a given function name
 *
 * Scans every loaded module in root.moduleExportsMap for one or more
 * target function names. Reports the module ID(s) and all exports of
 * matching modules so you can pick the right one for hooking.
 *
 * This is the first step before you can use hookFunction(moduleId, fnName)
 * — you need to know the module ID, and it changes between app versions.
 *
 * Usage:
 *   Copy-Item .\examples\find-module-by-function.js .\hooks.js
 *   .\run-frida-agent.ps1 -BundleId <your-bundle-id>
 *
 * Edit the SEARCH_NAMES array below to match the function names you're
 * looking for. After running, check the Frida console output for lines
 * like:
 *
 *   M:809 has: [methodAESEncrypt, methodAESDecrypt, ...]
 *     All exports: [methodAESEncrypt, methodAESDecrypt, calculateAge, ...]
 *
 * Then use that module ID in your hook script:
 *   hookFunction('809', 'methodAESEncrypt');
 */

module.exports = function markUserSection(hookFunction, log, flush, getModuleExport, previewValue, root) {

  // ── Configure these ──────────────────────────────────────────────
  var SEARCH_NAMES = [
    'methodAESEncrypt',
    'methodAESDecrypt',
    'methodSecurityEncoded',
    'methodSecurityDecoded',
    'methodBaseEncodes',
    'changeToDecryptData'
  ];
  // ─────────────────────────────────────────────────────────────────

  log('=== Module Search ===');
  log('Looking for: ' + SEARCH_NAMES.join(', '));
  flush();

  // Get all loaded module IDs, sorted numerically
  var moduleIds;
  try {
    moduleIds = Object.keys(root.moduleExportsMap || {}).sort(function (a, b) {
      var na = Number(a);
      var nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a < b ? -1 : 1;
    });
  } catch (e) {
    log('Error getting module IDs: ' + e);
    flush();
    return;
  }

  log('Total loaded modules: ' + moduleIds.length);
  flush();

  var found = {};

  // Scan every module's exports for the target function names
  for (var i = 0; i < moduleIds.length; i++) {
    var id = moduleIds[i];
    var exp;

    try {
      exp = root.moduleExportsMap[id];
    } catch (_) {
      continue;
    }

    // Skip non-objects (some modules export primitives or functions)
    if (!exp || (typeof exp !== 'object' && typeof exp !== 'function')) continue;

    var names = [];
    try {
      names = Object.getOwnPropertyNames(exp);
    } catch (_) {
      continue;
    }

    // Check if any target name exists on this module
    for (var j = 0; j < SEARCH_NAMES.length; j++) {
      var target = SEARCH_NAMES[j];
      if (names.indexOf(target) !== -1) {
        if (!found[id]) found[id] = [];
        found[id].push(target);
      }
    }
  }

  var foundIds = Object.keys(found);

  if (foundIds.length === 0) {
    log('No modules found containing any target functions.');
    log('The app may not have loaded the module yet, or names changed.');
    log('Try interacting with the app first, then re-run.');
    flush();
    return;
  }

  // Report results
  log('=== Found ' + foundIds.length + ' matching module(s) ===');
  for (var k = 0; k < foundIds.length; k++) {
    var mid = foundIds[k];
    log('M:' + mid + ' has: [' + found[mid].join(', ') + ']');

    // Dump all export names on this module for context
    try {
      var allNames = Object.getOwnPropertyNames(root.moduleExportsMap[mid])
        .filter(function (n) {
          return n !== 'length' && n !== 'name' && n !== 'arguments' && n !== 'caller';
        });
      log('  All exports: [' + allNames.join(', ') + ']');
    } catch (_) {}
  }
  flush();

  log('=== Search DONE ===');
  log('Use the module ID above with hookFunction(moduleId, fnName)');
  flush();
};
