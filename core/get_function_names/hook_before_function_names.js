'use strict';

function setGlobal() {
  var root = typeof globalThis !== 'undefined'
    ? globalThis
    : Function('return this')();

  if (root.__fridaFunctionNameDumpInstalled) {
    return;
  }

  root.__fridaFunctionNameDumpInstalled = true;

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

  log('[hook-before-function-names] start');
  flush();

  installErrorUtilsLogging();

  root.moduleExportsMap = {};
  root.moduleFactoriesMap = {};
  root.moduleObjectsMap = {};
  root.moduleIdsSeen = {};
  root.moduleCount = 0;

  var activeFunctionCallWatches = [];
  var watchedFunctionPaths = {};
  var reportedUnwatchablePaths = {};
  var activeLazyFunctionDumps = [];
  var dumpedLazyFunctionPaths = {};
  var logFunctionCallNamesOnly = root.__fridaLogFunctionCallNamesOnly !== false;
  var logWatchSetup = root.__fridaLogFunctionWatchSetup === true;

  function rememberModule(moduleId, exportsValue) {
    if (exportsValue) {
      root.moduleExportsMap[moduleId] = exportsValue;
    }

    if (!root.moduleIdsSeen[moduleId]) {
      root.moduleIdsSeen[moduleId] = true;
      root.moduleCount++;
    }
  }

  function rememberFactory(moduleId, factory) {
    if (typeof factory === 'function') {
      root.moduleFactoriesMap[moduleId] = factory;
    }
  }

  function rememberModuleObject(moduleId, moduleRef) {
    if (moduleRef && typeof moduleRef === 'object') {
      root.moduleObjectsMap[moduleId] = moduleRef;
    }
  }

  function normalizeFilter(filter) {
    if (filter === null || filter === undefined) {
      return '';
    }

    return String(filter).toLowerCase();
  }

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

  function joinPath(prefix, key) {
    return prefix ? prefix + '.' + key : key;
  }

  function safeValuePreview(value, maxLength) {
    try {
      if (typeof value === 'string') {
        return JSON.stringify(value.slice(0, maxLength));
      }

      return JSON.stringify(value).slice(0, maxLength);
    } catch (_) {
      return '[' + typeof value + ']';
    }
  }

  function buildErrorUtilsSnapshot(value) {
    var snapshot = {
      preview: value === null || value === undefined ? 'NULL' : safeValuePreview(value, 500),
      name: '',
      message: '',
      stack: ''
    };

    if (value && typeof value === 'object') {
      try {
        if (value.name) {
          snapshot.name = String(value.name);
        }
      } catch (_) {}

      try {
        if (value.message) {
          snapshot.message = String(value.message);
        }
      } catch (_) {}

      try {
        if (value.stack) {
          snapshot.stack = String(value.stack).slice(0, 1200);
        }
      } catch (_) {}
    }

    return snapshot;
  }

  function logErrorUtilsValue(label, value, isFatal) {
    var snapshot = buildErrorUtilsSnapshot(value);
    var currentAutoRequireModuleId = root.__fridaCurrentAutoRequireModuleId;

    root.__fridaLastErrorUtilsEvent = {
      label: label,
      isFatal: !!isFatal,
      preview: snapshot.preview,
      name: snapshot.name,
      message: snapshot.message,
      stack: snapshot.stack,
      moduleId: currentAutoRequireModuleId || ''
    };

    if (isFatal && currentAutoRequireModuleId) {
      root.__fridaCurrentAutoRequireFailure = root.__fridaLastErrorUtilsEvent;
      log('[errorutils][' + label + '][suppressed] M:' + currentAutoRequireModuleId + ' ' + (snapshot.message || snapshot.preview));
      flush();
      return root.__fridaLastErrorUtilsEvent;
    }

    log('[errorutils][' + label + '] ' + snapshot.preview);
    if (snapshot.name) {
      log('[errorutils][' + label + '][name] ' + snapshot.name);
    }
    if (snapshot.message) {
      log('[errorutils][' + label + '][message] ' + snapshot.message);
    }
    if (snapshot.stack) {
      log('[errorutils][' + label + '][stack] ' + snapshot.stack);
    }

    flush();
    return root.__fridaLastErrorUtilsEvent;
  }

  function installErrorUtilsLogging() {
    if (root.__fridaErrorUtilsLoggingInstalled) {
      return;
    }

    var errorUtils = root.ErrorUtils;
    if (!errorUtils || typeof errorUtils !== 'object') {
      return;
    }

    root.__fridaErrorUtilsLoggingInstalled = true;

    function wrapReporter(methodName) {
      var originalMethod = errorUtils[methodName];
      if (typeof originalMethod !== 'function') {
        return;
      }

      errorUtils[methodName] = function () {
        var snapshot = logErrorUtilsValue(methodName, arguments[0], methodName === 'reportFatalError');
        if (snapshot && snapshot.isFatal && snapshot.moduleId) {
          return;
        }

        return originalMethod.apply(this, arguments);
      };
    }

    wrapReporter('reportError');
    wrapReporter('reportFatalError');

    if (typeof errorUtils.getGlobalHandler === 'function' && typeof errorUtils.setGlobalHandler === 'function') {
      try {
        var originalGlobalHandler = errorUtils.getGlobalHandler();
        if (typeof originalGlobalHandler === 'function') {
          errorUtils.setGlobalHandler(function (error, isFatal) {
            var snapshot = logErrorUtilsValue('globalHandler', error, isFatal);
            log('[errorutils][globalHandler][isFatal] ' + String(isFatal));
            flush();

            if (snapshot && snapshot.isFatal && snapshot.moduleId) {
              return;
            }

            return originalGlobalHandler.apply(this, arguments);
          });
        }
      } catch (_) {}
    }

    log('[errorutils] logging installed');
    flush();
  }

  function rememberEntry(entrySet, entries, value) {
    if (entrySet[value]) {
      return;
    }

    entrySet[value] = true;
    entries.push(value);
  }

  function shouldSkipFunctionDumpPath(path) {
    if (!path) {
      return false;
    }

    var segments = String(path).split('.');
    for (var segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
      var segment = normalizeFilter(segments[segmentIndex]);
      if (segment === 'globalthis' ||
          segment === 'self' ||
          segment === 'window' ||
          segment === 'global' ||
          segment === 'global_obj' ||
          segment === 'globalobj' ||
          segment === 'moduleexportsmap' ||
          segment === 'modulefactoriesmap' ||
          segment === 'console' ||
          segment === 'object' ||
          segment === 'array' ||
          segment === 'promise' ||
          segment === 'reflect' ||
          segment === 'math' ||
          segment === 'json' ||
          segment === 'intl' ||
          segment === 'hermesinternal' ||
          segment === 'abortcontroller' ||
          segment === 'blob' ||
          segment === 'url' ||
          segment === 'urlsearchparams' ||
          segment === 'xmlhttprequest') {
        return true;
      }
    }

    return false;
  }

  function addFunctionEntry(functionNameSet, functionNames, name, fn) {
    if (shouldSkipFunctionDumpPath(name)) {
      return;
    }

    rememberEntry(functionNameSet, functionNames, name + '(' + fn.length + ')');
  }

  function addLazyEntry(lazyNameSet, lazyNames, name) {
    if (shouldSkipFunctionDumpPath(name)) {
      return;
    }

    rememberEntry(lazyNameSet, lazyNames, name + ' [lazy]');
  }

  function isInspectableValue(value) {
    return !!value && (typeof value === 'object' || typeof value === 'function');
  }

  function isHandlerLikeKey(key) {
    return /^on[A-Za-z]/.test(key) ||
      /(?:Press|Click|Tap|Submit|Handler|Callback)$/.test(key);
  }

  function isInterestingContainerKey(key) {
    return key === 'default' ||
      key === 'props' ||
      key === 'defaultProps' ||
      key === 'handlers' ||
      key === 'callbacks' ||
      key === 'actions' ||
      key === 'current' ||
      key === 'state' ||
      key === 'value' ||
      key === 'type';
  }

  function objectHasInterestingKeys(value) {
    try {
      var ownKeys = Object.getOwnPropertyNames(value);
      for (var index = 0; index < ownKeys.length; index++) {
        var ownKey = ownKeys[index];
        if (isHandlerLikeKey(ownKey) || isInterestingContainerKey(ownKey)) {
          return true;
        }
      }
    } catch (_) {}

    return false;
  }

  function shouldInspectNestedValue(key, value, remainingDepth) {
    if (remainingDepth <= 0 || !isInspectableValue(value)) {
      return false;
    }

    if (remainingDepth > 1) {
      return true;
    }

    return isInterestingContainerKey(key) || objectHasInterestingKeys(value);
  }

  function shouldResolveLazyDumpEntry(path, loweredFilter, remainingDepth) {
    return !!loweredFilter &&
      remainingDepth > 0 &&
      !shouldSkipFunctionDumpPath(path) &&
      normalizeFilter(path).indexOf(loweredFilter) !== -1;
  }

  function inspectResolvedLazyValue(target, key, path, functionNameSet, functionNames, lazyNameSet, lazyNames, remainingDepth, loweredFilter, resolvedLazyPaths) {
    if (!shouldResolveLazyDumpEntry(path, loweredFilter, remainingDepth) || resolvedLazyPaths[path]) {
      return;
    }

    resolvedLazyPaths[path] = true;

    var value;
    try {
      value = target[key];
    } catch (_) {
      return;
    }

    if (typeof value === 'function') {
      addFunctionEntry(functionNameSet, functionNames, path, value);
    }

    if (!shouldInspectNestedValue(key, value, remainingDepth)) {
      return;
    }

    inspectValue(value, path, functionNameSet, functionNames, lazyNameSet, lazyNames, remainingDepth - 1, loweredFilter, resolvedLazyPaths);
  }

  function buildScopedFunctionDump(prefix, value) {
    var functionNames = [];
    var lazyNames = [];
    var functionNameSet = {};
    var lazyNameSet = {};

    if (typeof value === 'function') {
      addFunctionEntry(functionNameSet, functionNames, prefix, value);
    }

    inspectValue(value, prefix, functionNameSet, functionNames, lazyNameSet, lazyNames, 2, '', {});

    functionNames.sort(function (left, right) { return left.localeCompare(right); });
    lazyNames.sort(function (left, right) { return left.localeCompare(right); });

    return {
      functionNames: functionNames,
      lazyNames: lazyNames
    };
  }

  function logScopedFunctionDump(moduleId, path, value) {
    var dump = buildScopedFunctionDump(path, value);
    var line = '[functions][lazy-access] M:' + moduleId + ' ' + path;

    if (dump.functionNames.length > 0) {
      line += ' fn=[' + dump.functionNames.join(', ') + ']';
    }
    if (dump.lazyNames.length > 0) {
      line += ' lazy=[' + dump.lazyNames.join(', ') + ']';
    }
    if (dump.functionNames.length === 0 && dump.lazyNames.length === 0) {
      line += ' no matches';
    }

    log(line);
    flush();
  }

  function matchesLazyFunctionDump(path) {
    if (activeLazyFunctionDumps.length === 0 || !path) {
      return false;
    }

    var pathText = normalizeFilter(path);
    for (var dumpIndex = 0; dumpIndex < activeLazyFunctionDumps.length; dumpIndex++) {
      if (pathText.indexOf(activeLazyFunctionDumps[dumpIndex].filter) !== -1) {
        return true;
      }
    }

    return false;
  }

  function markLazyFunctionDumpPath(moduleId, path) {
    var dumpKey = String(moduleId) + ':' + path;
    if (dumpedLazyFunctionPaths[dumpKey]) {
      return false;
    }

    dumpedLazyFunctionPaths[dumpKey] = true;
    return true;
  }

  function armLazyFunctionDumpGetter(moduleId, target, key, path, descriptor) {
    if (!descriptor.get || !descriptor.configurable || !matchesLazyFunctionDump(path)) {
      return;
    }

    var getter = descriptor.get;
    var setter = descriptor.set;

    try {
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: function () {
          var value = getter.call(this);

          if (markLazyFunctionDumpPath(moduleId, path)) {
            logScopedFunctionDump(moduleId, path, value);
          }

          return value;
        },
        set: setter
      });
    } catch (_) {}
  }

  function inspectLazyFunctionDumpTarget(moduleId, target, prefix, remainingDepth) {
    if (!isInspectableValue(target) || shouldSkipFunctionDumpPath(prefix)) {
      return;
    }

    try {
      var keys = Object.getOwnPropertyNames(target);
      for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        var key = keys[keyIndex];
        if (shouldSkipOwnKey(target, key)) {
          continue;
        }

        try {
          var descriptor = Object.getOwnPropertyDescriptor(target, key);
          if (!descriptor) {
            continue;
          }

          var entryName = joinPath(prefix, key);
          if (shouldSkipFunctionDumpPath(entryName)) {
            continue;
          }

          if (descriptor.get) {
            armLazyFunctionDumpGetter(moduleId, target, key, entryName, descriptor);
          } else if (shouldInspectNestedValue(key, descriptor.value, remainingDepth)) {
            inspectLazyFunctionDumpTarget(moduleId, descriptor.value, entryName, remainingDepth - 1);
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  function scanLazyFunctionDumpsForModule(moduleId, exportsValue) {
    if (activeLazyFunctionDumps.length === 0 || !exportsValue) {
      return exportsValue;
    }

    if (typeof exportsValue === 'object' || typeof exportsValue === 'function') {
      inspectLazyFunctionDumpTarget(moduleId, exportsValue, '', 3);
    }

    return exportsValue;
  }

  function rescanLazyFunctionDumps() {
    var moduleIds = Object.keys(root.moduleExportsMap).sort(compareModuleIds);
    for (var moduleIndex = 0; moduleIndex < moduleIds.length; moduleIndex++) {
      var moduleId = moduleIds[moduleIndex];
      var exportsValue = root.moduleExportsMap[moduleId];
      if (!exportsValue) {
        continue;
      }

      root.moduleExportsMap[moduleId] = scanLazyFunctionDumpsForModule(moduleId, exportsValue);
    }
  }

  function hasMatchAllFunctionCallWatch() {
    for (var watchIndex = 0; watchIndex < activeFunctionCallWatches.length; watchIndex++) {
      if (activeFunctionCallWatches[watchIndex].matchAll) {
        return true;
      }
    }

    return false;
  }

  function isNativeFunction(fn) {
    if (typeof fn !== 'function') {
      return false;
    }

    try {
      return Function.prototype.toString.call(fn).indexOf('[native code]') !== -1;
    } catch (_) {
      return false;
    }
  }

  function shouldSkipFunctionCallWatchPath(path) {
    if (!path) {
      return false;
    }

    var firstSegment = String(path).split('.')[0];
    return firstSegment === 'globalThis' ||
      firstSegment === 'self' ||
      firstSegment === 'window' ||
      firstSegment === 'global' ||
      firstSegment === 'console' ||
      firstSegment === 'Object' ||
      firstSegment === 'Array' ||
      firstSegment === 'Promise' ||
      firstSegment === 'Reflect' ||
      firstSegment === 'Math' ||
      firstSegment === 'JSON' ||
      firstSegment === 'Intl' ||
      firstSegment === 'HermesInternal' ||
      firstSegment === 'moduleExportsMap' ||
      firstSegment === 'AbortController' ||
      firstSegment === 'Blob' ||
      firstSegment === 'URL' ||
      firstSegment === 'URLSearchParams' ||
      firstSegment === 'XMLHttpRequest';
  }

  function shouldWrapFunctionCallWatch(path, fn) {
    if (!matchesFunctionCallWatch(path, fn)) {
      return false;
    }

    if (shouldSkipFunctionCallWatchPath(path) || isNativeFunction(fn)) {
      return false;
    }

    return true;
  }

  function shouldInspectFunctionCallWatchNestedValue(key, value, remainingDepth) {
    if (!shouldInspectNestedValue(key, value, remainingDepth)) {
      return false;
    }

    if (!hasMatchAllFunctionCallWatch()) {
      return true;
    }

    return isInterestingContainerKey(key) || objectHasInterestingKeys(value);
  }

  function matchesFunctionCallWatch(path, fn) {
    if (activeFunctionCallWatches.length === 0) {
      return false;
    }

    var pathText = normalizeFilter(path);
    var functionName = typeof fn === 'function' ? normalizeFilter(fn.name) : '';

    for (var watchIndex = 0; watchIndex < activeFunctionCallWatches.length; watchIndex++) {
      var watch = activeFunctionCallWatches[watchIndex];
      if (watch.matchAll) {
        return true;
      }

      if ((pathText && pathText.indexOf(watch.filter) !== -1) || (functionName && functionName.indexOf(watch.filter) !== -1)) {
        return true;
      }
    }

    return false;
  }

  function createFunctionCallWrapper(moduleId, path, fn) {
    if (typeof fn !== 'function') {
      return fn;
    }

    try {
      if (fn.__fridaFunctionCallWrapper) {
        return fn.__fridaFunctionCallWrapper;
      }
    } catch (_) {}

    var wrapped = function () {
      log('[watch][call] M:' + moduleId + ' ' + path);
      flush();

      if (logFunctionCallNamesOnly) {
        return fn.apply(this, arguments);
      }

      var result;
      try {
        result = fn.apply(this, arguments);
      } catch (error) {
        log('[watch][throw] M:' + moduleId + ' ' + path + ' ' + (error && error.message ? error.message : String(error)));
        flush();
        throw error;
      }

      if (result && typeof result.then === 'function') {
        log('[watch][return] M:' + moduleId + ' ' + path + ' Promise');
        flush();
        result.then(function (value) {
          log('[watch][resolve] M:' + moduleId + ' ' + path + ' ' + safeValuePreview(value, 300));
          flush();
        }).catch(function (error) {
          log('[watch][reject] M:' + moduleId + ' ' + path + ' ' + (error && error.message ? error.message : String(error)));
          flush();
        });
      } else {
        log('[watch][return] M:' + moduleId + ' ' + path + ' ' + safeValuePreview(result, 300));
        flush();
      }

      return result;
    };

    try {
      Object.defineProperty(fn, '__fridaFunctionCallWrapper', {
        value: wrapped,
        configurable: true
      });
    } catch (_) {}

    try {
      Object.defineProperty(wrapped, '__fridaOriginalFunction', {
        value: fn,
        configurable: true
      });
    } catch (_) {}

    try {
      Object.defineProperty(wrapped, '__fridaFunctionCallWrapper', {
        value: wrapped,
        configurable: true
      });
    } catch (_) {}

    return wrapped;
  }

  function markFunctionPath(moduleId, path) {
    var watchKey = String(moduleId) + ':' + path;
    if (watchedFunctionPaths[watchKey]) {
      return false;
    }

    watchedFunctionPaths[watchKey] = true;
    return true;
  }

  function reportUnwatchablePath(moduleId, path, reason) {
    var watchKey = String(moduleId) + ':' + path;
    if (reportedUnwatchablePaths[watchKey]) {
      return;
    }

    reportedUnwatchablePaths[watchKey] = true;
    if (!logWatchSetup) {
      return;
    }

    log('[watch][skip] M:' + moduleId + ' ' + path + ' ' + reason);
    flush();
  }

  function watchPropertyValue(moduleId, target, key, path, descriptor) {
    if (typeof descriptor.value !== 'function' || !shouldWrapFunctionCallWatch(path, descriptor.value)) {
      return;
    }

    if (!markFunctionPath(moduleId, path)) {
      return;
    }

    var wrapped = createFunctionCallWrapper(moduleId, path, descriptor.value);
    try {
      if (descriptor.writable) {
        target[key] = wrapped;
      } else if (descriptor.configurable) {
        Object.defineProperty(target, key, {
          configurable: true,
          enumerable: descriptor.enumerable,
          writable: false,
          value: wrapped
        });
      } else {
        reportUnwatchablePath(moduleId, path, 'value is not writable/configurable');
        return;
      }
    } catch (error) {
      reportUnwatchablePath(moduleId, path, 'wrap failed: ' + (error && error.message ? error.message : String(error)));
      return;
    }

    if (logWatchSetup) {
      log('[watch][armed] M:' + moduleId + ' ' + path);
      flush();
    }
  }

  function watchGetterValue(moduleId, target, key, path, descriptor) {
    if (hasMatchAllFunctionCallWatch()) {
      return;
    }

    if (shouldSkipFunctionCallWatchPath(path)) {
      return;
    }

    if (!matchesFunctionCallWatch(path, null)) {
      return;
    }

    if (!descriptor.get || !descriptor.configurable) {
      if (descriptor.get) {
        reportUnwatchablePath(moduleId, path, 'getter is not configurable');
      }
      return;
    }

    if (!markFunctionPath(moduleId, path)) {
      return;
    }

    var getter = descriptor.get;
    var setter = descriptor.set;
    var wrappedValue;

    try {
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: function () {
          var value = getter.call(this);
          if (!matchesFunctionCallWatch(path, value)) {
            return value;
          }

          if (!wrappedValue || wrappedValue.__fridaOriginalFunction !== value) {
            wrappedValue = createFunctionCallWrapper(moduleId, path, value);
          }

          return wrappedValue;
        },
        set: setter
      });
    } catch (error) {
      reportUnwatchablePath(moduleId, path, 'getter wrap failed: ' + (error && error.message ? error.message : String(error)));
      return;
    }

    if (logWatchSetup) {
      log('[watch][armed] M:' + moduleId + ' ' + path + ' [lazy]');
      flush();
    }
  }

  function inspectFunctionCallWatchTarget(moduleId, target, prefix, remainingDepth) {
    if (!isInspectableValue(target)) {
      return;
    }

    try {
      var keys = Object.getOwnPropertyNames(target);
      for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        var key = keys[keyIndex];
        if (shouldSkipOwnKey(target, key)) {
          continue;
        }

        try {
          var descriptor = Object.getOwnPropertyDescriptor(target, key);
          if (!descriptor) {
            continue;
          }

          var entryName = joinPath(prefix, key);
          if (descriptor.get) {
            watchGetterValue(moduleId, target, key, entryName, descriptor);
          } else {
            watchPropertyValue(moduleId, target, key, entryName, descriptor);
          }

          if (!descriptor.get && shouldInspectFunctionCallWatchNestedValue(key, descriptor.value, remainingDepth)) {
            inspectFunctionCallWatchTarget(moduleId, descriptor.value, entryName, remainingDepth - 1);
          }
        } catch (_) {}
      }
    } catch (_) {}

    try {
      var prototype = typeof target === 'function' ? target.prototype : Object.getPrototypeOf(target);
      if (!shouldInspectPrototype(prototype)) {
        return;
      }

      var prototypeKeys = Object.getOwnPropertyNames(prototype);
      for (var prototypeIndex = 0; prototypeIndex < prototypeKeys.length; prototypeIndex++) {
        var prototypeKey = prototypeKeys[prototypeIndex];
        if (prototypeKey === 'constructor') {
          continue;
        }

        try {
          var prototypeDescriptor = Object.getOwnPropertyDescriptor(prototype, prototypeKey);
          if (!prototypeDescriptor) {
            continue;
          }

          var prototypeName = joinPath(joinPath(prefix, 'prototype'), prototypeKey);
          if (prototypeDescriptor.get) {
            watchGetterValue(moduleId, prototype, prototypeKey, prototypeName, prototypeDescriptor);
          } else {
            watchPropertyValue(moduleId, prototype, prototypeKey, prototypeName, prototypeDescriptor);
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  function scanFunctionCallWatchesForModule(moduleId, exportsValue) {
    if (activeFunctionCallWatches.length === 0 || !exportsValue) {
      return exportsValue;
    }

    var result = exportsValue;
    if (typeof result === 'function' && shouldWrapFunctionCallWatch(result.name || 'default', result)) {
      if (markFunctionPath(moduleId, result.name || 'default')) {
        result = createFunctionCallWrapper(moduleId, result.name || 'default', result);
        if (logWatchSetup) {
          log('[watch][armed] M:' + moduleId + ' ' + (exportsValue.name || 'default'));
          flush();
        }
      }
    }

    if (typeof result === 'object' || typeof result === 'function') {
      inspectFunctionCallWatchTarget(moduleId, result, '', 3);
    }

    return result;
  }

  function rescanFunctionCallWatches() {
    var moduleIds = Object.keys(root.moduleExportsMap).sort(compareModuleIds);
    for (var moduleIndex = 0; moduleIndex < moduleIds.length; moduleIndex++) {
      var moduleId = moduleIds[moduleIndex];
      var exportsValue = root.moduleExportsMap[moduleId];
      if (!exportsValue) {
        continue;
      }

      root.moduleExportsMap[moduleId] = scanFunctionCallWatchesForModule(moduleId, exportsValue);
    }
  }

  function shouldInspectPrototype(prototype) {
    if (!prototype ||
        prototype === Object.prototype ||
        prototype === Array.prototype ||
        prototype === Function.prototype) {
      return false;
    }

    var ctor = prototype.constructor;
    if (typeof ctor === 'function') {
      try {
        if (Function.prototype.toString.call(ctor).indexOf('[native code]') !== -1) {
          return false;
        }
      } catch (_) {}
    }

    return true;
  }

  function shouldSkipOwnKey(target, key) {
    if (key === '__esModule' || key.indexOf('__frida') === 0) {
      return true;
    }

    return typeof target === 'function' && (
      key === 'length' ||
      key === 'name' ||
      key === 'prototype' ||
      key === 'arguments' ||
      key === 'caller'
    );
  }

  function inspectPrototype(target, prefix, functionNameSet, functionNames, lazyNameSet, lazyNames) {
    var prototype;

    if (shouldSkipFunctionDumpPath(prefix)) {
      return;
    }

    try {
      prototype = typeof target === 'function' ? target.prototype : Object.getPrototypeOf(target);
    } catch (_) {
      return;
    }

    if (!shouldInspectPrototype(prototype)) {
      return;
    }

    try {
      var prototypeKeys = Object.getOwnPropertyNames(prototype);
      for (var prototypeIndex = 0; prototypeIndex < prototypeKeys.length; prototypeIndex++) {
        var prototypeKey = prototypeKeys[prototypeIndex];
        if (prototypeKey === 'constructor') {
          continue;
        }

        try {
          var prototypeDescriptor = Object.getOwnPropertyDescriptor(prototype, prototypeKey);
          if (!prototypeDescriptor) {
            continue;
          }

          var prototypeName = joinPath(joinPath(prefix, 'prototype'), prototypeKey);
          if (shouldSkipFunctionDumpPath(prototypeName)) {
            continue;
          }

          if (prototypeDescriptor.get) {
            addLazyEntry(lazyNameSet, lazyNames, prototypeName);
          } else if (typeof prototypeDescriptor.value === 'function') {
            addFunctionEntry(functionNameSet, functionNames, prototypeName, prototypeDescriptor.value);
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  function inspectValue(target, prefix, functionNameSet, functionNames, lazyNameSet, lazyNames, remainingDepth, loweredFilter, resolvedLazyPaths) {
    if (!isInspectableValue(target)) {
      return;
    }

    if (shouldSkipFunctionDumpPath(prefix)) {
      return;
    }

    try {
      var keys = Object.getOwnPropertyNames(target);
      for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        var key = keys[keyIndex];
        if (shouldSkipOwnKey(target, key)) {
          continue;
        }

        try {
          var descriptor = Object.getOwnPropertyDescriptor(target, key);
          if (!descriptor) {
            continue;
          }

          var entryName = joinPath(prefix, key);
          if (shouldSkipFunctionDumpPath(entryName)) {
            continue;
          }

          if (descriptor.get) {
            addLazyEntry(lazyNameSet, lazyNames, entryName);
            inspectResolvedLazyValue(target, key, entryName, functionNameSet, functionNames, lazyNameSet, lazyNames, remainingDepth, loweredFilter, resolvedLazyPaths);
          } else if (typeof descriptor.value === 'function') {
            addFunctionEntry(functionNameSet, functionNames, entryName, descriptor.value);
          }

          if (!descriptor.get && shouldInspectNestedValue(key, descriptor.value, remainingDepth)) {
            inspectValue(descriptor.value, entryName, functionNameSet, functionNames, lazyNameSet, lazyNames, remainingDepth - 1, loweredFilter, resolvedLazyPaths);
          }
        } catch (_) {}
      }
    } catch (_) {}

    inspectPrototype(target, prefix, functionNameSet, functionNames, lazyNameSet, lazyNames);
  }

  var originalDefine = null;
  var originalRequire = null;

  root.moduleDefinedCount = 0;
  root.moduleDefinedIds = {};
  root.moduleRequiredCount = 0;
  root.moduleRequiredIds = {};
  root.moduleExecutedCount = 0;
  root.moduleExecutedIds = {}; 
 
  Object.defineProperty(globalThis, '__d', {
    configurable: true,
    enumerable: true,
    get: function () { return originalDefine; },
    set: function (newFn) {
      originalDefine = function (factory, moduleId, dependencyMap) {
        rememberFactory(moduleId, factory);

        if (!root.moduleDefinedIds[moduleId]) {
          root.moduleDefinedIds[moduleId] = true;
          root.moduleDefinedCount++;
        }

        var wrappedFactory = function (global, _require, importDefault, importAll, module, exports, _dependencyMap) {
          var result = factory.apply(this, arguments);
          rememberModuleObject(moduleId, module);
          rememberModule(moduleId, module.exports);
          module.exports = scanFunctionCallWatchesForModule(moduleId, module.exports);
          module.exports = scanLazyFunctionDumpsForModule(moduleId, module.exports);
          root.moduleExportsMap[moduleId] = module.exports;
          
          if (!root.moduleExecutedIds[moduleId]) {
            root.moduleExecutedIds[moduleId] = true;
            root.moduleExecutedCount++;          
          }

          return result;
        };

        return newFn.call(this, wrappedFactory, moduleId, dependencyMap);
      };
    }
  });

  Object.defineProperty(globalThis, '__r', {
    configurable: true,
    enumerable: true,
    get: function () { return originalRequire; },
    set: function (newFn) {
      originalRequire = function (moduleId) {

        var result = newFn.call(this, moduleId);
        if (result && !root.moduleExportsMap[moduleId]) {
          rememberModule(moduleId, result);
        }

        if (!root.moduleRequiredIds[moduleId]) {
          root.moduleRequiredIds[moduleId] = true;
          root.moduleRequiredCount++;          
        }

        result = scanFunctionCallWatchesForModule(moduleId, result);
        result = scanLazyFunctionDumpsForModule(moduleId, result);
        if (result) {
          root.moduleExportsMap[moduleId] = result;
        }

        return result;
      };

      for (var key in newFn) {
        originalRequire[key] = newFn[key];
      }
    }
  });

  log('[hook-before-function-names] end');
  flush();
}

module.exports = '(' + setGlobal.toString() + ')();';