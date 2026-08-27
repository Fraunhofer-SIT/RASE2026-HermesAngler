'use strict';

function setGlobal() {
  var root = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();

  if (!root.frida || typeof root.frida.log !== 'function') {
    return;
  }

  var log = root.frida.log.bind(root.frida);
  var flush = typeof root.frida.flushLogs === 'function'
    ? root.frida.flushLogs.bind(root.frida)
    : function () {};

  function runDump() {
    try {
      if (typeof root.runEngineDump === 'function') {
        root.runEngineDump('after-bundle');
      } else {
        log('[hook-engine-dump] runEngineDump is unavailable');
      }
    } catch (error) {
      log('[hook-engine-dump] error: ' + (error && error.message ? error.message : String(error)));
    }

    log('[hook-engine-dump] end');
    flush();
  }

  log('[hook-engine-dump] start');

  if (typeof setImmediate === 'function') {
    log('[hook-engine-dump] scheduled setImmediate');
    flush();
    setImmediate(runDump);
    return;
  }

  if (typeof setTimeout === 'function') {
    log('[hook-engine-dump] scheduled setTimeout(0)');
    flush();
    setTimeout(runDump, 0);
    return;
  }

  runDump();
}

module.exports = '(' + setGlobal.toString() + ')();';