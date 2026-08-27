'use strict';

function setGlobal() {
  var root = typeof globalThis !== 'undefined'
    ? globalThis
    : Function('return this')();

  if (root.__fridaFunctionNameAfterInstalled) {
    return;
  }

  root.__fridaFunctionNameAfterInstalled = true;

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

  log('[hook-function-names] scheduled');
  flush();

  setTimeout(function () {
    log('[hook-function-names] start');

    function compareModuleIds(left, right) {
      var leftNumber = Number(left);
      var rightNumber = Number(right);

      if (!isNaN(leftNumber) && !isNaN(rightNumber)) {
        return leftNumber - rightNumber;
      }

      var leftText = left === null || left === undefined ? '' : '' + left;
      var rightText = right === null || right === undefined ? '' : '' + right;

      if (leftText < rightText) {
        return -1;
      }

      if (leftText > rightText) {
        return 1;
      }

      return 0;
    }

    function getModuleIds() {
      return Object.keys(root.moduleExportsMap || {}).sort(compareModuleIds);
    }

    function registerRootFunction(name, fn) {
      if (typeof fn !== 'function') {
        return;
      }

      try {
        if (root.frida && typeof root.frida.registerRootFunction === 'function') {
          root.frida.registerRootFunction(name, fn);
          return;
        }
      } catch (_) {}

      if (!root.__fridaRegisteredFunctions) {
        root.__fridaRegisteredFunctions = {};
      }

      root.__fridaRegisteredFunctions[name] = fn;
    }

    function getRegisteredRootFunctionNames() {
      var names = [];

      try {
        if (root.frida && typeof root.frida.listRootFunctions === 'function') {
          names = root.frida.listRootFunctions();
        } else if (root.__fridaRegisteredFunctions) {
          names = Object.keys(root.__fridaRegisteredFunctions);
        }
      } catch (_) {
        names = [];
      }

      return names.sort(function (left, right) {
        var leftText = left === null || left === undefined ? '' : '' + left;
        var rightText = right === null || right === undefined ? '' : '' + right;

        if (leftText < rightText) {
          return -1;
        }

        if (leftText > rightText) {
          return 1;
        }

        return 0;
      });
    }

    function logRegisteredRootFunctions() {
      var functionNames = getRegisteredRootFunctionNames();

      log('[hook-function-names] registered functions: ' + functionNames.length);

      for (var i = 0; i < functionNames.length; i++) {
        log('[hook-function-names] function: ' + functionNames[i] + '()');
      }

      flush();
    }

    function shouldSkipKey(key) {
      return key === '__esModule' ||
        key === 'length' ||
        key === 'name' ||
        key === 'prototype' ||
        key === 'caller' ||
        key === 'arguments' ||
        key === 'callee' ||
        key === '__proto__' ||
        key === 'stack' ||
        key === 'prepareStackTrace' ||
        key.indexOf('__frida') === 0;
    }

    function safeDumpModule(exp) {
      var fnNames = [];

      try {
        if (typeof exp === 'function') {
          fnNames.push((exp.name || 'default') + '(' + exp.length + ')');
        }

        if (typeof exp !== 'object' && typeof exp !== 'function') {
          return fnNames;
        }

        var keys;
        try {
          keys = Object.getOwnPropertyNames(exp);
        } catch (_) {
          return fnNames;
        }

        for (var k = 0; k < keys.length; k++) {
          var key = keys[k];
          if (shouldSkipKey(key)) continue;

          try {
            var desc = Object.getOwnPropertyDescriptor(exp, key);
            if (!desc) continue;

            if (desc.get) {
              fnNames.push(key + ' [lazy]');
            } else if (typeof desc.value === 'function') {
              fnNames.push(key + '(' + desc.value.length + ')');
            }
          } catch (_) {}
        }
      } catch (_) {}

      return fnNames;
    }

    function ensureHookStore() {
      if (!root.__fridaFunctionHooks) {
        root.__fridaFunctionHooks = {};
      }

      return root.__fridaFunctionHooks;
    }

    function normalizeFunctionName(functionName) {
      var text = functionName === null || functionName === undefined ? '' : String(functionName);

      if (!text) {
        return text;
      }

      if (text.slice(-7) === ' [lazy]') {
        return text.slice(0, -7);
      }

      var signatureMatch = text.match(/^(.*)\(\d+\)$/);
      if (signatureMatch) {
        return signatureMatch[1];
      }

      return text;
    }

    function getModuleExport(moduleId) {
      var moduleIdText = String(moduleId);

      if (!root.moduleExportsMap) {
        return null;
      }

      try {
        return root.moduleExportsMap[moduleIdText];
      } catch (_) {
        return null;
      }
    }

    function getModuleObject(moduleId) {
      var moduleIdText = String(moduleId);

      if (!root.moduleObjectsMap) {
        return null;
      }

      try {
        return root.moduleObjectsMap[moduleIdText];
      } catch (_) {
        return null;
      }
    }

    function copyOwnProperties(source, target) {
      try {
        var keys = Object.getOwnPropertyNames(source);
        for (var index = 0; index < keys.length; index++) {
          var key = keys[index];
          if (key === 'length' || key === 'name' || key === 'arguments' || key === 'caller') {
            continue;
          }

          try {
            var descriptor = Object.getOwnPropertyDescriptor(source, key);
            if (!descriptor) {
              continue;
            }

            Object.defineProperty(target, key, descriptor);
          } catch (_) {}
        }
      } catch (_) {}

      try {
        Object.setPrototypeOf(target, Object.getPrototypeOf(source));
      } catch (_) {}
    }

    function markWrapper(wrapper, hookKey, originalFn) {
      try {
        Object.defineProperty(wrapper, '__fridaHookKey', {
          configurable: true,
          enumerable: false,
          value: hookKey,
          writable: false
        });
      } catch (_) {}

      try {
        Object.defineProperty(wrapper, '__fridaOriginalFunction', {
          configurable: true,
          enumerable: false,
          value: originalFn,
          writable: false
        });
      } catch (_) {}
    }

    function previewValue(value) {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') {
        return value.length > 5000 ? JSON.stringify(value.slice(0, 5000)) + '...[truncated, full length: ' + value.length + ']' : JSON.stringify(value);
      }
      if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
      if (typeof value === 'function') return '[function ' + (value.name || 'anonymous') + ']';
      try { return JSON.stringify(value); } catch (_) {}
      try { if (value && typeof value.toString === 'function') return String(value.toString()).slice(0, 5000); } catch (_) {}
      return '[' + typeof value + ']';
    }

    function createFunctionWrapper(moduleId, functionName, originalFn, hookKey) {
      var wrapper = function () {
        var argParts = [];
        for (var i = 0; i < arguments.length; i++) {
          argParts.push(previewValue(arguments[i]));
        }
        log('[hook][call] M:' + moduleId + ' ' + functionName + ' args=[' + argParts.join(', ') + ']');
        flush();
        var result;
        var threw = false;
        try {
          result = originalFn.apply(this, arguments);
        } catch (e) {
          threw = true;
          log('[hook][throw] M:' + moduleId + ' ' + functionName + ' error=' + previewValue(e));
          flush();
          throw e;
        }
        log('[hook][return] M:' + moduleId + ' ' + functionName + ' return=' + previewValue(result));
        flush();
        return result;
      };

      copyOwnProperties(originalFn, wrapper);
      markWrapper(wrapper, hookKey, originalFn);
      return wrapper;
    }

    function getPropertyDescriptor(target, key) {
      if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
        return null;
      }

      try {
        return Object.getOwnPropertyDescriptor(target, key);
      } catch (_) {
        return null;
      }
    }

    function isExactModuleExportLabel(exp, requestedName) {
      var exportName;
      var exportLabel;

      if (typeof exp !== 'function') {
        return false;
      }

      exportName = exp.name || 'default';
      exportLabel = exportName + '(' + exp.length + ')';

      return requestedName === exportLabel || requestedName === ('default(' + exp.length + ')');
    }

    function isModuleExportAlias(exp, normalizedName) {
      var exportName;

      if (typeof exp !== 'function') {
        return false;
      }

      exportName = exp.name || 'default';
      return normalizedName === exportName || normalizedName === 'default';
    }

    function installWrappedValue(target, propertyName, descriptor, moduleId, hookLabel, hookKey) {
      var currentValue = descriptor && descriptor.value;
      var hookStore = ensureHookStore();
      var wrapped;

      if (typeof currentValue !== 'function') {
        log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' is not a function');
        flush();
        return false;
      }

      if (currentValue.__fridaHookKey === hookKey || hookStore[hookKey]) {
        log('[hook][skip] M:' + moduleId + ' ' + hookLabel + ' already hooked');
        flush();
        return true;
      }

      wrapped = createFunctionWrapper(moduleId, hookLabel, currentValue, hookKey);

      try {
        if (descriptor.writable !== false) {
          target[propertyName] = wrapped;
        } else if (descriptor.configurable) {
          Object.defineProperty(target, propertyName, {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            writable: descriptor.writable,
            value: wrapped
          });
        } else {
          log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' is not writable');
          flush();
          return false;
        }
      } catch (error) {
        log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' install failed: ' + String(error));
        flush();
        return false;
      }

      hookStore[hookKey] = {
        kind: 'property',
        moduleId: String(moduleId),
        propertyName: propertyName,
        original: currentValue,
        wrapped: wrapped
      };

      log('[hook][ok] M:' + moduleId + ' ' + hookLabel + ' hooked');
      flush();
      return true;
    }

    function installLazyGetterHook(target, propertyName, descriptor, moduleId, hookLabel, hookKey) {
      var hookStore = ensureHookStore();
      var record;
      var getter;

      if (hookStore[hookKey]) {
        log('[hook][skip] M:' + moduleId + ' ' + hookLabel + ' already hooked');
        flush();
        return true;
      }

      if (!descriptor || typeof descriptor.get !== 'function') {
        log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' has no getter');
        flush();
        return false;
      }

      if (!descriptor.configurable) {
        log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' getter is not configurable');
        flush();
        return false;
      }

      record = {
        kind: 'lazy-property',
        moduleId: String(moduleId),
        propertyName: propertyName,
        originalGetter: descriptor.get,
        originalSetter: descriptor.set,
        original: null,
        wrapped: null,
        lastOriginal: null,
        reportedNonFunction: false
      };

      getter = function () {
        var value;

        value = descriptor.get.apply(this, arguments);
        if (typeof value !== 'function') {
          if (!record.reportedNonFunction) {
            record.reportedNonFunction = true;
            log('[hook][lazy-skip] M:' + moduleId + ' ' + hookLabel + ' resolved to ' + typeof value);
            flush();
          }
          return value;
        }

        if (record.lastOriginal === value && record.wrapped) {
          return record.wrapped;
        }

        record.reportedNonFunction = false;
        record.lastOriginal = value;
        record.original = value;
        record.wrapped = createFunctionWrapper(moduleId, hookLabel, value, hookKey);
        return record.wrapped;
      };

      try {
        Object.defineProperty(getter, '__fridaHookKey', {
          configurable: true,
          enumerable: false,
          value: hookKey,
          writable: false
        });
      } catch (_) {}

      try {
        Object.defineProperty(target, propertyName, {
          configurable: descriptor.configurable,
          enumerable: descriptor.enumerable,
          get: getter,
          set: descriptor.set
        });
      } catch (error) {
        log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' lazy install failed: ' + String(error));
        flush();
        return false;
      }

      hookStore[hookKey] = record;
      log('[hook][armed] M:' + moduleId + ' ' + hookLabel + ' lazy getter armed');
      flush();
      return true;
    }

    function installModuleExportHook(moduleId, exp, hookLabel) {
      var hookStore = ensureHookStore();
      var hookKey = String(moduleId) + '::__module__';
      var moduleRecord = getModuleObject(moduleId);
      var wrapped;

      if (hookStore[hookKey] || (typeof exp === 'function' && exp.__fridaHookKey === hookKey)) {
        log('[hook][skip] M:' + moduleId + ' ' + hookLabel + ' already hooked');
        flush();
        return true;
      }

      if (!moduleRecord || typeof moduleRecord !== 'object') {
        log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' missing module record');
        flush();
        return false;
      }

      if (typeof exp !== 'function') {
        log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' is not a module export function');
        flush();
        return false;
      }

      wrapped = createFunctionWrapper(moduleId, hookLabel, exp, hookKey);

      try {
        moduleRecord.exports = wrapped;
        if (root.moduleExportsMap) {
          root.moduleExportsMap[String(moduleId)] = wrapped;
        }
      } catch (error) {
        log('[hook][error] M:' + moduleId + ' ' + hookLabel + ' export install failed: ' + String(error));
        flush();
        return false;
      }

      hookStore[hookKey] = {
        kind: 'module-export',
        moduleId: String(moduleId),
        propertyName: '',
        original: exp,
        wrapped: wrapped
      };

      log('[hook][ok] M:' + moduleId + ' ' + hookLabel + ' export hooked');
      flush();
      return true;
    }

    function hookFunction(moduleId, functionName) {
      var moduleIdText = String(moduleId);
      var requestedName = functionName === null || functionName === undefined ? '' : String(functionName);
      var normalizedName = normalizeFunctionName(requestedName);
      var exp = getModuleExport(moduleIdText);
      var descriptor;
      var hookLabel;
      var hookKey;

      if (!requestedName) {
        log('[hook][error] functionName is required');
        flush();
        return false;
      }

      if (!exp) {
        log('[hook][error] M:' + moduleIdText + ' not found');
        flush();
        return false;
      }

      if (isExactModuleExportLabel(exp, requestedName)) {
        return installModuleExportHook(moduleIdText, exp, normalizedName || (exp.name || 'default'));
      }

      descriptor = getPropertyDescriptor(exp, requestedName);
      hookLabel = requestedName;

      if (!descriptor && normalizedName !== requestedName) {
        descriptor = getPropertyDescriptor(exp, normalizedName);
        hookLabel = normalizedName;
      }

      if (descriptor && typeof descriptor.get === 'function') {
        hookKey = moduleIdText + ':' + hookLabel;
        return installLazyGetterHook(exp, hookLabel, descriptor, moduleIdText, hookLabel, hookKey);
      }

      if (descriptor && typeof descriptor.value === 'function') {
        hookKey = moduleIdText + ':' + hookLabel;
        return installWrappedValue(exp, hookLabel, descriptor, moduleIdText, hookLabel, hookKey);
      }

      if (isModuleExportAlias(exp, normalizedName)) {
        return installModuleExportHook(moduleIdText, exp, normalizedName || (exp.name || 'default'));
      }

      log('[hook][error] M:' + moduleIdText + ' ' + requestedName + ' not found');
      flush();
      return false;
    }

    function logModuleStats() {
      var moduleIds = getModuleIds();

      log('[hook-function-names] root.moduleRequiredCount: ' + root.moduleRequiredCount);
      log('[hook-function-names] root.moduleDefinedCount: ' + root.moduleDefinedCount);
      log('[hook-function-names] root.moduleExecutedCount: ' + root.moduleExecutedCount);
      flush();
    }

    function logModuleFunctions(batchSize) {
      var moduleIds = getModuleIds();

      if (typeof batchSize !== 'number') {
        batchSize = 50;
      }

      function processBatch(startIndex) {
        var endIndex = Math.min(startIndex + batchSize, moduleIds.length);

        for (var i = startIndex; i < endIndex; i++) {
          var id = moduleIds[i];
          var exp;

          try {
            exp = root.moduleExportsMap[id];
          } catch (_) {
            continue;
          }

          if (!exp) continue;
          if (typeof exp !== 'object' && typeof exp !== 'function') continue;

          var fnNames = safeDumpModule(exp);

          if (fnNames.length > 0) {
            log('[functions][after] M:' + id + ' fn=[' + fnNames.join(', ') + ']');
          }
        }

        flush();

        if (endIndex >= moduleIds.length) {
          log('[hook-function-names] done');
          flush();
          return;
        }

        setTimeout(function () {
          processBatch(endIndex);
        }, 0);
      }

      processBatch(0);
    }

    registerRootFunction('logModuleStats', logModuleStats);
    registerRootFunction('logModuleFunctions', logModuleFunctions);
  registerRootFunction('hookFunction', hookFunction);
    logRegisteredRootFunctions();

    logModuleStats();
    //logModuleFunctions();
    log('[hook-function-names] end');
    flush();
  }, 100);

}

module.exports = '(' + setGlobal.toString() + ')();';