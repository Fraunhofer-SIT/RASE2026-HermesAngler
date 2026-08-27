'use strict';

function setGlobal() {
  var root = typeof globalThis !== 'undefined'
    ? globalThis
    : Function('return this')();

  var log = root.frida.log.bind(root.frida);
  var flush = root.frida.flushLogs.bind(root.frida);

  log("[hook] start");
  flush();

  // ---- Storage ----
  root.moduleExportsMap = {};
  root.moduleCount = 0;

  // ---- SAFE summary: never resolves getters ----
  root.summary = function () {
    var lines = [];
    var totalFns = 0;
    var totalMods = 0;
    var totalGetters = 0;

    for (var id in root.moduleExportsMap) {
      var exp = root.moduleExportsMap[id];
      if (!exp) continue;
      totalMods++;

      var fns = [];
      var getters = [];
      var props = [];

      // exports is directly a function
      if (typeof exp === 'function') {
        fns.push(exp.name || 'default');
        totalFns++;
      }

      if (typeof exp !== 'object' && typeof exp !== 'function') continue;

      try {
        var keys = Object.getOwnPropertyNames(exp);
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          if (k === '__esModule') continue;
          try {
            var desc = Object.getOwnPropertyDescriptor(exp, k);
            if (!desc) continue;

            // SAFE: just check descriptor, never call getter
            if (desc.get) {
              getters.push(k);
              totalGetters++;
            } else if (typeof desc.value === 'function') {
              fns.push(k + "(" + desc.value.length + ")");
              totalFns++;
            } else if (typeof desc.value === 'string') {
              props.push(k + '="' + String(desc.value).slice(0, 50) + '"');
            } else if (typeof desc.value === 'number' || typeof desc.value === 'boolean') {
              props.push(k + "=" + desc.value);
            }
          } catch (e) {}
        }
      } catch (e) {}

      if (fns.length === 0 && getters.length === 0) continue;

      var line = "M:" + id;
      if (fns.length > 0) line += " fn=[" + fns.join(", ") + "]";
      if (getters.length > 0) line += " lazy=[" + getters.join(", ") + "]";
      if (props.length > 0) line += " " + props.join(", ");
      lines.push({ id: Number(id), line: line });
    }

    lines.sort(function (a, b) { return a.id - b.id; });

    log("══════ SUMMARY ══════");
    log("Modules: " + totalMods + " | Functions: " + totalFns + " | Lazy getters: " + totalGetters);
    log("═════════════════════");
    flush();

    for (var m = 0; m < lines.length; m++) {
      log(lines[m].line);
      if (m % 50 === 0) flush();
    }

    flush();
  };

  // ---- Resolve ONE module's getters on demand ----
  root.resolve = function (moduleId) {
    var exp = root.moduleExportsMap[moduleId];
    if (!exp) { log("[resolve] not found: " + moduleId); flush(); return; }

    var results = {};
    try {
      var keys = Object.getOwnPropertyNames(exp);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        try {
          var val = exp[k]; // THIS resolves getters
          results[k] = typeof val === 'function'
            ? "[Function " + (val.name || 'anon') + "(" + val.length + ")]"
            : typeof val === 'string'
              ? '"' + val.slice(0, 100) + '"'
              : String(val).slice(0, 100);
        } catch (e) {
          results[k] = "[error: " + e.message + "]";
        }
      }
    } catch (e) {}

    log("M:" + moduleId + " → " + JSON.stringify(results, null, 2));
    flush();
  };

  // ---- Apple SignIn Hook ----
  var appleHooked = false;

  function tryHook(moduleId, exp) {
    if (appleHooked || !exp || typeof exp !== 'object') return;
    try {
      var desc = Object.getOwnPropertyDescriptor(exp, 'oniOSAppleButtonPress');
      if (!desc) return;

      // Handle both direct value and lazy getter
      var orig;
      if (desc.get) {
        try { orig = exp.oniOSAppleButtonPress; } catch (e) { return; }
      } else {
        orig = desc.value;
      }
      if (typeof orig !== 'function') return;

      var hooked = function () {
        log("╔══════════════════════════════════════");
        log("║ [HOOK] oniOSAppleButtonPress CALLED");
        log("║ args: " + arguments.length);
        for (var i = 0; i < arguments.length; i++) {
          try {
            log("║   [" + i + "] " + JSON.stringify(arguments[i]).slice(0, 300));
          } catch (e) {
            log("║   [" + i + "] [" + typeof arguments[i] + "]");
          }
        }
        log("╚══════════════════════════════════════");
        flush();

        var result;
        try {
          result = orig.apply(this, arguments);
        } catch (e) {
          log("[✗] threw: " + e.message);
          flush();
          throw e;
        }

        if (result && typeof result.then === 'function') {
          log("[⏳] → Promise");
          flush();
          result.then(function (val) {
            try { log("[✓] resolved: " + JSON.stringify(val).slice(0, 500)); }
            catch (e) { log("[✓] resolved: [" + typeof val + "]"); }
            flush();
          }).catch(function (err) {
            log("[✗] rejected: " + (err.message || String(err)));
            flush();
          });
        } else {
          try { log("[←] returned: " + JSON.stringify(result).slice(0, 300)); }
          catch (e) { log("[←] returned: [" + typeof result + "]"); }
          flush();
        }

        return result;
      };

      // Replace: handle getter or direct value
      if (desc.get) {
        Object.defineProperty(exp, 'oniOSAppleButtonPress', {
          configurable: true,
          enumerable: desc.enumerable,
          get: function () { return hooked; },
          set: desc.set
        });
      } else if (desc.writable) {
        exp.oniOSAppleButtonPress = hooked;
      }

      appleHooked = true;
      log("[✓] oniOSAppleButtonPress hooked (module " + moduleId + ")");
      flush();
    } catch (e) {}
  }

  // ---- Metro hooks ----
  var originalDefine = null;
  var originalRequire = null;

  Object.defineProperty(globalThis, '__d', {
    configurable: true, enumerable: true,
    get: function () { return originalDefine; },
    set: function (newFn) {
      originalDefine = function (factory, moduleId, dependencyMap) {
        var wrappedFactory = function (global, _require, importDefault, importAll, module, exports, _dependencyMap) {
          var result = factory.apply(this, arguments);
          root.moduleExportsMap[moduleId] = module.exports;
          root.moduleCount++;
          tryHook(moduleId, module.exports);
          return result;
        };
        return newFn.call(this, wrappedFactory, moduleId, dependencyMap);
      };
    }
  });

  Object.defineProperty(globalThis, '__r', {
    configurable: true, enumerable: true,
    get: function () { return originalRequire; },
    set: function (newFn) {
      originalRequire = function (moduleId) {
        var result = newFn.call(this, moduleId);
        if (result && !root.moduleExportsMap[moduleId]) {
          root.moduleExportsMap[moduleId] = result;
        }
        tryHook(moduleId, result);
        return result;
      };
      for (var key of Object.keys(newFn)) {
        originalRequire[key] = newFn[key];
      }
    }
  });

  log("[hook] ready");
  log("[cmd] summary()    → safe list (no getter resolution)");
  log("[cmd] resolve(id)  → resolve one module's lazy exports");
  flush();
}

module.exports = '(' + setGlobal.toString() + ')();';