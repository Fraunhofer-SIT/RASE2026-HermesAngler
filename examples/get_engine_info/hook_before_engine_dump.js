'use strict';

function setGlobal() {
  var root = typeof globalThis !== 'undefined'
    ? globalThis
    : Function('return this')();

  if (!root.frida || typeof root.frida.log !== 'function') {
    return;
  }

  if (root.__fridaEngineDumpInstalled) {
    return;
  }

  root.__fridaEngineDumpInstalled = true;

  var log = root.frida.log.bind(root.frida);
  var flush = typeof root.frida.flushLogs === 'function'
    ? root.frida.flushLogs.bind(root.frida)
    : function () {};
  var lastDump = null;
  var afterBundleDumpStarted = false;
  var originalRequire = null;

  function safeGetOwnPropertyNames(value) {
    try {
      return Object.getOwnPropertyNames(value);
    } catch (_) {
      return [];
    }
  }

  function safeGetPrototypeOf(value) {
    try {
      return Object.getPrototypeOf(value);
    } catch (_) {
      return null;
    }
  }

  function safeGetOwnPropertyDescriptor(target, property) {
    try {
      return Object.getOwnPropertyDescriptor(target, property);
    } catch (_) {
      return null;
    }
  }

  function sortByLabel(members) {
    return members.sort(function (left, right) {
      return left.label.localeCompare(right.label);
    });
  }

  function normalizeFilter(filter) {
    if (filter === null || filter === undefined) {
      return '';
    }

    return String(filter);
  }

  function dedupeMembers(members) {
    var seen = Object.create(null);
    var result = [];

    for (var index = 0; index < members.length; index++) {
      var member = members[index];
      var key = member.kind + ':' + member.label;
      if (seen[key]) {
        continue;
      }

      seen[key] = true;
      result.push(member);
    }

    return sortByLabel(result);
  }

  function dumpEngine() {
    var result = {};
    var globals = safeGetOwnPropertyNames(root);

    for (var globalIndex = 0; globalIndex < globals.length; globalIndex++) {
      var name = globals[globalIndex];

      try {
        var globalDescriptor = safeGetOwnPropertyDescriptor(root, name);
        if (globalDescriptor && !('value' in globalDescriptor)) {
          result[name] = { type: 'accessor', members: [] };
          continue;
        }

        var obj = globalDescriptor && 'value' in globalDescriptor
          ? globalDescriptor.value
          : root[name];
        if (obj === null || obj === undefined) {
          continue;
        }

        var type = typeof obj;
        var entry = { type: type, members: [] };

        if (type === 'function') {
          var staticMembers = safeGetOwnPropertyNames(obj);
          for (var staticIndex = 0; staticIndex < staticMembers.length; staticIndex++) {
            entry.members.push({ kind: 'static', label: staticMembers[staticIndex] });
          }
        }

        var proto = null;
        if (type === 'function') {
          var prototypeDescriptor = safeGetOwnPropertyDescriptor(obj, 'prototype');
          proto = prototypeDescriptor && 'value' in prototypeDescriptor
            ? prototypeDescriptor.value
            : obj.prototype;
        } else {
          proto = safeGetPrototypeOf(obj);
        }

        while (proto && proto !== Object.prototype) {
          var protoMembers = safeGetOwnPropertyNames(proto);
          for (var protoIndex = 0; protoIndex < protoMembers.length; protoIndex++) {
            var memberName = protoMembers[protoIndex];
            try {
              var memberDescriptor = safeGetOwnPropertyDescriptor(proto, memberName);
              var kind = memberDescriptor && 'value' in memberDescriptor && typeof memberDescriptor.value === 'function'
                ? 'method'
                : 'prop';
              entry.members.push({ kind: kind, label: memberName });
            } catch (_) {}
          }

          proto = safeGetPrototypeOf(proto);
        }

        entry.members = dedupeMembers(entry.members);
        result[name] = entry;
      } catch (_) {
        result[name] = { type: 'inaccessible', members: [] };
      }
    }

    return result;
  }

  function renderDump(dump, filter) {
    var rawFilter = normalizeFilter(filter);
    var loweredFilter = rawFilter.toLowerCase();
    var names = Object.keys(dump).sort();
    var rendered = {
      filter: rawFilter,
      visibleCount: 0,
      totalMembers: 0,
      items: []
    };

    for (var objectIndex = 0; objectIndex < names.length; objectIndex++) {
      var objectName = names[objectIndex];
      var info = dump[objectName] || { type: 'unknown', members: [] };
      var members = Array.isArray(info.members) ? info.members : [];
      var nameMatch = !loweredFilter || objectName.toLowerCase().indexOf(loweredFilter) !== -1;
      var matchedMembers = [];

      if (rawFilter) {
        for (var memberIndex = 0; memberIndex < members.length; memberIndex++) {
          var member = members[memberIndex];
          if (member.label.toLowerCase().indexOf(loweredFilter) !== -1) {
            matchedMembers.push(member);
          }
        }
      } else {
        matchedMembers = members;
      }

      if (!nameMatch && matchedMembers.length === 0) {
        continue;
      }

      var membersToShow = nameMatch ? members : matchedMembers;
      rendered.visibleCount++;
      rendered.totalMembers += membersToShow.length;
      rendered.items.push({
        name: objectName,
        type: info.type,
        members: membersToShow
      });
    }

    return rendered;
  }

  function logRenderedDump(rendered, label) {
    var phase = label || 'manual';

    log('[engine][' + phase + '] dump-start objects=' + rendered.visibleCount + ' members=' + rendered.totalMembers + (rendered.filter ? ' filter=' + JSON.stringify(rendered.filter) : ''));
    flush();

    for (var objectIndex = 0; objectIndex < rendered.items.length; objectIndex++) {
      var item = rendered.items[objectIndex];
      log('[engine][' + phase + '] object ' + item.name + ' type=' + item.type + ' members=' + item.members.length);

      for (var memberIndex = 0; memberIndex < item.members.length; memberIndex++) {
        var member = item.members[memberIndex];
        log('[engine][' + phase + ']   [' + member.kind + '] ' + member.label);
      }

      if ((objectIndex + 1) % 10 === 0) {
        flush();
      }
    }

    if (rendered.visibleCount === 0) {
      log('[engine][' + phase + '] no matches' + (rendered.filter ? ' for ' + JSON.stringify(rendered.filter) : ''));
    }

    log('[engine][' + phase + '] dump-end objects=' + rendered.visibleCount + ' members=' + rendered.totalMembers);
    flush();
  }

  function logDump(dump, label, filter) {
    return logRenderedDump(renderDump(dump, filter), label);
  }

  function clearEngineDump() {
    lastDump = null;
    root.lastEngineDump = null;
    log('[engine] cleared');
    flush();
  }

  function exportEngineDumpJson(label) {
    var phase = label || 'export';
    var dump = lastDump;
    if (!dump) {
      log('[engine][' + phase + '] export unavailable: no dump');
      flush();
      return null;
    }

    var json;
    try {
      json = JSON.stringify(dump, null, 2);
    } catch (error) {
      log('[engine][' + phase + '] export failed: ' + error.message);
      flush();
      return null;
    }

    var chunkSize = 4000;
    var totalChunks = Math.ceil(json.length / chunkSize) || 1;
    log('[engine][' + phase + '] export-start bytes=' + json.length + ' chunks=' + totalChunks);
    flush();

    for (var offset = 0; offset < json.length; offset += chunkSize) {
      var chunkIndex = Math.floor(offset / chunkSize) + 1;
      log('[engine][' + phase + '][json ' + chunkIndex + '/' + totalChunks + '] ' + json.slice(offset, offset + chunkSize));
      if (chunkIndex % 5 === 0) {
        flush();
      }
    }

    log('[engine][' + phase + '] export-end');
    flush();
    return json;
  }

  function searchEngineDump(filter, label) {
    var phase = label || 'search';
    if (!lastDump) {
      log('[engine][' + phase + '] search unavailable: no dump');
      flush();
      return null;
    }

    logDump(lastDump, phase, filter);
    return lastDump;
  }

  function runEngineDump(label, filter) {
    var phase = label || 'manual';
    log('[engine][' + phase + '] collecting');
    flush();

    var dump = dumpEngine();
    lastDump = dump;
    root.lastEngineDump = dump;
    logDump(dump, phase, filter);
    return dump;
  }

  function ensureFlushLoop() {
    if (typeof setTimeout !== 'function') {
      return;
    }

    setTimeout(function () {
      try {
        flush();
      } catch (_) {}

      if (root.frida && root.frida._logBuffer && root.frida._logBuffer.length > 0) {
        ensureFlushLoop();
      }
    }, 250);
  }

  function scheduleAfterBundleDump() {
    if (afterBundleDumpStarted) {
      return;
    }

    afterBundleDumpStarted = true;

    function run() {
      try {
        runEngineDump('after-bundle');
      } catch (error) {
        log('[engine][after-bundle] error: ' + (error && error.message ? error.message : String(error)));
        flush();
      }

      ensureFlushLoop();
    }

    if (typeof setImmediate === 'function') {
      setImmediate(run);
      return;
    }

    if (typeof setTimeout === 'function') {
      setTimeout(run, 0);
      return;
    }

    run();
  }

  Object.defineProperty(globalThis, '__r', {
    configurable: true,
    enumerable: true,
    get: function () {
      return originalRequire;
    },
    set: function (newFn) {
      originalRequire = function (moduleId) {
        var result = newFn.call(this, moduleId);
        scheduleAfterBundleDump();
        return result;
      };

      for (var key of Object.keys(newFn)) {
        originalRequire[key] = newFn[key];
      }
    }
  });

  root.lastEngineDump = lastDump;
  root.dumpEngine = dumpEngine;
  root.renderDump = renderDump;
  root.clearEngineDump = clearEngineDump;
  root.exportEngineDumpJson = exportEngineDumpJson;
  root.searchEngineDump = searchEngineDump;
  root.logRenderedEngineDump = logRenderedDump;
  root.logEngineDump = logDump;
  root.runEngineDump = runEngineDump;

  log('[hook-before-engine-dump] helpers ready');
  log('[cmd] runEngineDump(label, filter)');
  log('[cmd] dumpEngine()');
  log('[cmd] renderDump(dump, filter)');
  log('[cmd] searchEngineDump(filter, label)');
  log('[cmd] exportEngineDumpJson(label)');
  log('[cmd] clearEngineDump()');
  log('[cmd] auto-dump triggers on first __r()');
  flush();
}

module.exports = '(' + setGlobal.toString() + ')();';