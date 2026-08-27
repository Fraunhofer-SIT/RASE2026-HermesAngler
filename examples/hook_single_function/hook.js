'use strict';

function setGlobal() {
  var root = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();
  root.frida.log("start script");

  root.summary();

  root.frida.log("end script");
  if (root.frida.flushLogs) root.frida.flushLogs();
}

// Export as a string to feed into executeApplicationScript
module.exports = '(' + setGlobal.toString() + ')();';