'use strict';

/**
 * hooks.js  —  EDIT THIS FILE
 *
 * Put your hooks in the function below. It runs inside Hermes after the
 * bundle loads. All plumbing (logging, retries, version detection) is
 * handled by core/hermes-bootstrap.js — you don't see it here.
 *
 * Available inside the function:
 *   hookFunction(moduleId, functionName)  wrap a function with logging
 *   getModuleExport(moduleId)             get a module's export object
 *   log(msg) / flush()                    log to Frida console
 *   previewValue(value)                   safe string preview
 *
 * Example:
 *   hookFunction(744, 'methodAESEncrypt');
 *   hookFunction(744, 'methodAESDecrypt');
 *
 * Or copy a ready-made example:
 *   Copy-Item .\examples\hook-aes.js .\hooks.js
 */

module.exports = function markUserSection(hookFunction, log, flush, getModuleExport, previewValue, root) {
  // Example: read React Native version from module 16 and log it
  var rn = getModuleExport('16');
  if (rn && rn.version) {
    log('React Native version: ' + rn.version);
  } else {
    log('React Native version: (not found)');
  }
  flush();

  // YOUR CODE HERE
  // hookFunction(744, 'methodAESEncrypt');
};
