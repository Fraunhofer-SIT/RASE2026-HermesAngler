'use strict';

const LOG_URL = 'https://localhost/frida-log';
const ROOT_FUNCTION_LIST_PREFIX = '[frida][bridge][root-functions-json] ';
const agentRoot = typeof globalThis !== 'undefined' ? globalThis : this;

const setHookScriptBefore = require('./get_function_names/hook_before_function_names');
const setHookScriptAfter = require('./get_function_names/hook_function_names');
const userRuntimeScript = require('./hermes-bootstrap');

if (typeof ObjC === 'undefined' || !ObjC.available) {
  throw new Error('Objective-C runtime is unavailable');
}

const NSURLSessionTask = ObjC.classes.NSURLSessionTask;
if (!NSURLSessionTask) {
  throw new Error('NSURLSessionTask class not found');
}
const NSString = ObjC.classes.NSString;
if (!NSString) {
  throw new Error('NSString class not found');
}

const NS_DOCUMENT_DIRECTORY = 9;
const NS_USER_DOMAIN_MASK = 1;
const RCT_SOURCE_FILES_CHANGED_COUNT_NOT_BUILT_BY_BUNDLER = -2;

function describeObjCValue(valuePtr) {
  if (valuePtr.isNull()) {
    return 'NULL';
  }

  try {
    return new ObjC.Object(valuePtr).toString();
  } catch (error) {
    return valuePtr.toString();
  }
}

function describeObjCObject(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  try {
    return value.toString();
  } catch (_) {}

  try {
    if (value.handle) {
      return describeObjCValue(value.handle);
    }
  } catch (_) {}

  return String(value);
}

function describeRCTSourceUrl(sourcePtr) {
  if (sourcePtr.isNull()) {
    return 'NULL';
  }

  try {
    const source = new ObjC.Object(sourcePtr);
    const sourceUrl = typeof source.url === 'function' ? source.url() : null;

    if (sourceUrl && typeof sourceUrl.absoluteString === 'function') {
      return sourceUrl.absoluteString().toString();
    }
  } catch (_) {}

  return describeObjCValue(sourcePtr);
}

function logRCTExceptionPayload(exceptionPtr) {
  if (exceptionPtr.isNull()) {
    console.log('  exception: NULL');
    return;
  }

  try {
    const payload = new ObjC.Object(exceptionPtr);
    console.log(`  exceptionClass: ${payload.$className || '(unknown)'}`);

    if (typeof payload.objectForKey_ === 'function') {
      const fields = ['name', 'message', 'originalMessage', 'componentStack', 'stack', 'id', 'isFatal', 'extraData'];
      let loggedField = false;

      fields.forEach((field) => {
        try {
          const value = payload.objectForKey_(NSString.stringWithString_(field));
          if (!value) {
            return;
          }

          const renderedValue = describeObjCObject(value);
          if (renderedValue === 'NULL' || renderedValue === '(null)') {
            return;
          }

          console.log(`  ${field}: ${renderedValue}`);
          loggedField = true;
        } catch (_) {}
      });

      if (loggedField) {
        return;
      }
    }

    console.log(`  exception: ${describeObjCObject(payload)}`);
  } catch (error) {
    console.log(`  exception: ${describeObjCValue(exceptionPtr)}`);
    console.log(`  exceptionLogError: ${error && error.message ? error.message : String(error)}`);
  }
}

function tryAutoExposeRegisteredRootFunctions(message) {
  if (typeof message !== 'string' || message.indexOf(ROOT_FUNCTION_LIST_PREFIX) !== 0) {
    return false;
  }

  try {
    const names = JSON.parse(message.slice(ROOT_FUNCTION_LIST_PREFIX.length));

    if (!Array.isArray(names)) {
      console.log('[frida] root function payload was not an array');
      return true;
    }

    const exposedNames = exposeRegisteredRootFunctions(names);
    console.log(`[frida] auto-exposed root proxies: ${exposedNames.join(', ')}`);
  } catch (error) {
    console.log(`[frida] failed to auto-expose root proxies: ${error && error.message ? error.message : String(error)}`);
  }

  return true;
}


function installExceptionsHook() {
  const exceptionsManagerClass = ObjC.classes.RCTExceptionsManager;
  if (!exceptionsManagerClass) {
    console.log('[frida] RCTExceptionsManager not found');
    return;
  }

  [
    '- reportSoft:stack:exceptionId:extraDataAsJSON:',
    '- reportFatal:stack:exceptionId:extraDataAsJSON:',
    '- reportSoftException:stack:exceptionId:',
    '- reportFatalException:stack:exceptionId:',
    '- reportJsException:stack:exceptionId:isFatal:',
    '- reportException:'
  ].forEach((exceptionMethodName) => {
    const exceptionMethod = exceptionsManagerClass[exceptionMethodName];
    if (!exceptionMethod || !exceptionMethod.implementation) {
      return;
    }

    Interceptor.attach(exceptionMethod.implementation, {
      onEnter(args) {
        console.log(`[frida][RCTExceptionsManager] ${exceptionMethodName}`);

        if (exceptionMethodName === '- reportException:') {
          logRCTExceptionPayload(args[2]);
          return;
        }

        console.log(`  message: ${describeObjCValue(args[2])}`);
        console.log(`  stack: ${describeObjCValue(args[3])}`);
        console.log(`  id: ${args[4]}`);

        if (exceptionMethodName === '- reportJsException:stack:exceptionId:isFatal:') {
          console.log(`  isFatal: ${args[5]}`);
          return;
        }

        if (
          exceptionMethodName === '- reportSoft:stack:exceptionId:extraDataAsJSON:' ||
          exceptionMethodName === '- reportFatal:stack:exceptionId:extraDataAsJSON:'
        ) {
          console.log(`  extra: ${describeObjCValue(args[5])}`);
        }
      }
    });
  });
}

const methodNameNetwork = '- resume';
const methodNetwork = NSURLSessionTask[methodNameNetwork];
if (!methodNetwork || !methodNetwork.implementation) {
  throw new Error(`NSURLSessionTask ${methodNameNetwork} is unavailable`);
}

const resumeOriginal = new NativeFunction(methodNetwork.implementation, 'void', ['pointer', 'pointer']);

Interceptor.replace(methodNetwork.implementation, new NativeCallback(function (taskHandle, selectorHandle) {
  try {
    var task = new ObjC.Object(taskHandle);
    var request = task.currentRequest();
    if (request) {
      var url = request.URL().absoluteString().toString();

      // Intercept frida.log() POSTs — consume them so they never hit the
      // network (Thalia treats the failed request as a fatal Network Error).
      if (url.startsWith(LOG_URL)) {
        var body = request.HTTPBody();
        if (body) {
          var nsstr = NSString.alloc().initWithData_encoding_(body, 4).autorelease();
          if (nsstr) {
            try {
              var obj = JSON.parse(nsstr.toString());
              if (obj && Array.isArray(obj.logs)) {
                obj.logs.forEach(function (entry) {
                  var msg = entry && entry.log ? entry.log : JSON.stringify(entry);

                  if (tryAutoExposeRegisteredRootFunctions(msg)) {
                    return;
                  }

                  console.log(`[frida][hermes] ${msg}`);
                });
              } else if (obj && obj.log) {
                if (tryAutoExposeRegisteredRootFunctions(obj.log)) {
                  return;
                }

                console.log(`[frida][hermes] ${obj.log}`);
              } else {
                console.log(`[frida][hermes] (unknown log format)`);
                console.log(nsstr.toString());
              }
            } catch (_) {
              console.log(`[frida][hermes] (malformed log body)`);
              console.log(nsstr.toString());
            }
          }
        }
        return; // Consume — do not call resumeOriginal
      }
    }
  } catch (e) {
    console.log("Error inspecting request:", e);
  }

  resumeOriginal(taskHandle, selectorHandle);
}, 'void', ['pointer', 'pointer']));

const NS_UTF8_STRING_ENCODING = 4;

let bridgeMethod = null;
let instanceMethod = null;

function createBridgeContext(bridgeHandle, selectorHandle) {
  return {
    mode: 'bridge',
    targetHandle: bridgeHandle,
    selectorHandle,
  };
}

function createInstanceContext(instanceHandle, selectorHandle) {
  return {
    mode: 'instance',
    targetHandle: instanceHandle,
    selectorHandle,
  };
}

function rememberExecutionContext(context) {
  lastExecutionContext = context;
}

function installBridgeHook() {
  const bridgeClass = ObjC.classes.RCTCxxBridge;
  if (!bridgeClass) {
    console.log('[frida] RCTCxxBridge class not found');
    return false;
  }

  const methodName = '- executeApplicationScript:url:async:';
  bridgeMethod = bridgeClass[methodName];
  if (!bridgeMethod || !bridgeMethod.implementation) {
    console.log(`[frida] RCTCxxBridge ${methodName} is unavailable`);
    bridgeMethod = null;
    return false;
  }

  Interceptor.attach(bridgeMethod.implementation, {
    onEnter(args) {
      this.loaderContext = createBridgeContext(args[0], args[1]);
      this.isInjectedInvocation = isInjectingBefore || isInjectingAfter;
      rememberExecutionContext(this.loaderContext);

      if (this.isInjectedInvocation) {
        return;
      }

      console.log('[frida] RCTCxxBridge executeApplicationScript called');
      try {
        const nsurl = new ObjC.Object(args[3]);
        const urlString = nsurl && nsurl.absoluteString ? nsurl.absoluteString().toString() : '(unavailable)';
        console.log('[frida] RCTCxxBridge script URL:', urlString);
      } catch (error) {
        console.log('[frida] Error printing script URL:', error);
      }

      try {
        injectOnceBefore(this.loaderContext);
      } catch (error) {
        console.error('[frida] before injection lookup failed:', error);
      }
    },
    onLeave() {
      if (this.isInjectedInvocation) {
        return;
      }

      setTimeout(() => {
        try {
          injectOnceAfter(this.loaderContext);
        } catch (error) {
          console.error('[frida] after injection lookup failed:', error);
        }
      }, 8000);
    }
  });

  console.log('[frida] legacy RCTCxxBridge executeApplicationScript hook installed');
  return true;
}

function installInstanceHook() {
  const instanceClass = ObjC.classes.RCTInstance;
  if (!instanceClass) {
    console.log('[frida] RCTInstance class not found');
    return false;
  }

  const methodName = '- _loadScriptFromSource:';
  instanceMethod = instanceClass[methodName];
  if (!instanceMethod || !instanceMethod.implementation) {
    console.log(`[frida] RCTInstance ${methodName} is unavailable`);
    instanceMethod = null;
    return false;
  }

  Interceptor.attach(instanceMethod.implementation, {
    onEnter(args) {
      this.loaderContext = createInstanceContext(args[0], args[1]);
      this.isInjectedInvocation = isInjectingBefore || isInjectingAfter;
      rememberExecutionContext(this.loaderContext);

      if (this.isInjectedInvocation) {
        return;
      }

      console.log('[frida] RCTInstance _loadScriptFromSource called');
      try {
        console.log('[frida] RCTInstance source URL:', describeRCTSourceUrl(args[2]));
      } catch (error) {
        console.log('[frida] Error printing RCTInstance source URL:', error);
      }

      try {
        injectOnceBefore(this.loaderContext);
      } catch (error) {
        console.error('[frida] bridgeless before injection failed:', error);
      }
    },
    onLeave() {
      if (this.isInjectedInvocation) {
        return;
      }

      setTimeout(() => {
        try {
          injectOnceAfter(this.loaderContext);
        } catch (error) {
          console.error('[frida] bridgeless after injection failed:', error);
        }
      }, 8000);
    }
  });

  console.log('[frida] bridgeless RCTInstance _loadScriptFromSource hook installed');
  return true;
}
const INJECTION_STEPS_BEFORE = [
  {
    name: 'install-logger',
    url: 'frida://probe-install-logger.js',
    script: `(function () {
      var root = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();
      if (!root.frida) root.frida = {};
      if (!root.frida._logBuffer) root.frida._logBuffer = [];
      root.frida.log = function(msg) {
        root.frida._logBuffer.push({ log: String(msg), timestamp: Date.now() });
      };
      root.frida.flushLogs = function() {
        if (!root.frida._logBuffer || !root.frida._logBuffer.length) return;
        if (typeof fetch === 'function') {
          var logs = root.frida._logBuffer;
          root.frida._logBuffer = [];
          var payload = { logs: logs };
          fetch('${LOG_URL}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(function () {});
          return;
        }
        if (typeof XMLHttpRequest === 'function') {
          var logs = root.frida._logBuffer;
          root.frida._logBuffer = [];
          var payload = { logs: logs };
          var request = new XMLHttpRequest();
          request.open('POST', '${LOG_URL}', true);
          request.setRequestHeader('Content-Type', 'application/json');
          request.send(JSON.stringify(payload));
        }
      };
      if (!root.__fridaRegisteredFunctions) root.__fridaRegisteredFunctions = {};
      root.frida.registerRootFunction = function(name, fn) {
        if (!name || typeof fn !== 'function') {
          return false;
        }

        root.__fridaRegisteredFunctions[String(name)] = fn;
        return true;
      };
      root.frida.listRootFunctions = function() {
        return Object.keys(root.__fridaRegisteredFunctions).sort();
      };
      root.frida.callRootFunctions = function(names, argsByName) {
        var registry = root.__fridaRegisteredFunctions || {};
        var functionNames = Array.isArray(names) && names.length ? names : Object.keys(registry).sort();
        var normalizedArgsByName = argsByName && typeof argsByName === 'object' ? argsByName : {};
        var results = [];

        functionNames.forEach(function(name) {
          var normalizedName = String(name);
          var fn = registry[normalizedName];
          var args = normalizedArgsByName[normalizedName];

          if (!Array.isArray(args)) {
            args = [];
          }

          if (typeof fn !== 'function') {
            results.push({ name: normalizedName, ok: false, error: 'not registered' });
            return;
          }

          try {
            results.push({ name: normalizedName, ok: true, value: fn.apply(root, args) });
          } catch (error) {
            results.push({
              name: normalizedName,
              ok: false,
              error: error && error.stack ? String(error.stack) : String(error)
            });
          }
        });

        return results;
      };
    })();`
  },
  {
    name: 'set-hook-before',
    url: 'frida://probe-set-hook-before.js',
    script: setHookScriptBefore
  },
];

const INJECTION_STEPS_AFTER = [
  {
    name: 'set-hook-after',
    url: 'frida://probe-set-hook-after.js',
    script: setHookScriptAfter
  },
  {
    name: 'hooks',
    url: 'frida://probe-hooks.js',
    script: userRuntimeScript
  },
];

let isInjectingBefore = false;
let hasInjectedBefore = false;
let isInjectingAfter = false;
let hasInjectedAfter = false;
let bridgeInvoker = null;
let instanceInvoker = null;
let lastExecutionContext = null;
let writableScriptDirectory = null;
let pendingRuntimeScripts = [];

function createNSString(value) {
  return ObjC.classes.NSString.stringWithString_(value);
}

function createNSDataFromUtf8(value) {
  return createNSString(value).dataUsingEncoding_(NS_UTF8_STRING_ENCODING);
}

function createNSURL(value) {
  return ObjC.classes.NSURL.URLWithString_(createNSString(value));
}

function createFileURL(value) {
  return ObjC.classes.NSURL.fileURLWithPath_(createNSString(value));
}

function sanitizeScriptName(value) {
  return String(value).replace(/[^0-9A-Za-z_.-]+/g, '-');
}

function getWritableScriptDirectory() {
  if (writableScriptDirectory !== null) {
    return writableScriptDirectory;
  }

  const fileManager = ObjC.classes.NSFileManager.defaultManager();
  const directoryUrl = fileManager.URLsForDirectory_inDomains_(NS_DOCUMENT_DIRECTORY, NS_USER_DOMAIN_MASK).lastObject();
  if (!directoryUrl) {
    throw new Error('Unable to resolve a writable documents directory');
  }

  writableScriptDirectory = directoryUrl.path().toString();
  return writableScriptDirectory;
}

function writeInjectedScriptFile(name, script) {
  const scriptName = sanitizeScriptName(name || 'runtime-script');
  const filePath = `${getWritableScriptDirectory()}/${scriptName}-${Date.now()}.js`;
  const scriptData = createNSDataFromUtf8(script);
  const didWrite = scriptData.writeToFile_atomically_(createNSString(filePath), true);

  if (!didWrite) {
    throw new Error(`Failed to write injected script to ${filePath}`);
  }

  return {
    filePath,
    fileUrl: createFileURL(filePath),
    scriptData,
  };
}

function createRCTSource(fileUrl, scriptData) {
  const sourceClass = ObjC.classes.RCTSource;
  if (!sourceClass) {
    throw new Error('RCTSource class not found');
  }

  const source = sourceClass.alloc().init();
  source.$ivars._url = fileUrl;
  source.$ivars._data = scriptData;
  source.$ivars._length = Number(scriptData.length());
  source.$ivars._filesChangedCount = RCT_SOURCE_FILES_CHANGED_COUNT_NOT_BUILT_BY_BUNDLER;
  return source;
}

function getBridgeInvoker() {
  if (bridgeInvoker !== null) {
    return bridgeInvoker;
  }

  if (bridgeMethod === null) {
    throw new Error('RCTCxxBridge executeApplicationScript hook is unavailable');
  }

  bridgeInvoker = new NativeFunction(bridgeMethod.implementation, 'void', [
    'pointer',
    'pointer',
    'pointer',
    'pointer',
    'bool'
  ]);

  return bridgeInvoker;
}

function getInstanceInvoker() {
  if (instanceInvoker !== null) {
    return instanceInvoker;
  }

  if (instanceMethod === null) {
    throw new Error('RCTInstance _loadScriptFromSource hook is unavailable');
  }

  instanceInvoker = new NativeFunction(instanceMethod.implementation, 'void', [
    'pointer',
    'pointer',
    'pointer'
  ]);

  return instanceInvoker;
}

function getLatestExecutionContext() {
  if (lastExecutionContext === null) {
    throw new Error('React Native script loader context is not available yet');
  }

  if (lastExecutionContext.targetHandle.isNull() || lastExecutionContext.selectorHandle.isNull()) {
    throw new Error('React Native script loader handles are null');
  }

  return {
    mode: lastExecutionContext.mode,
    targetHandle: lastExecutionContext.targetHandle,
    selectorHandle: lastExecutionContext.selectorHandle,
  };
}

function injectScriptWithContext(context, name, script, scriptUrlValue) {
  if (context.mode === 'bridge') {
    const scriptData = createNSDataFromUtf8(script);
    const scriptUrl = createNSURL(scriptUrlValue);

    console.log(`[frida] injecting ${name} via RCTCxxBridge`);
    getBridgeInvoker()(context.targetHandle, context.selectorHandle, scriptData.handle, scriptUrl.handle, 0);
    return;
  }

  if (context.mode === 'instance') {
    const injectedFile = writeInjectedScriptFile(name, script);
    const source = createRCTSource(injectedFile.fileUrl, injectedFile.scriptData);

    console.log(`[frida] injecting ${name} via RCTInstance (${injectedFile.filePath})`);
    getInstanceInvoker()(context.targetHandle, context.selectorHandle, source.handle);
    return;
  }

  throw new Error(`Unknown injection context mode: ${context.mode}`);
}

function drainPendingRuntimeScripts() {
  if (!hasInjectedAfter || pendingRuntimeScripts.length === 0) {
    return;
  }

  const queuedScripts = pendingRuntimeScripts;
  pendingRuntimeScripts = [];

  queuedScripts.forEach((entry) => {
    injectRuntimeScript(entry.name, entry.script);
  });
}

function injectRuntimeScript(name, script, bridgeHandle, selectorHandle) {
  const hasExplicitContext = !!(bridgeHandle && selectorHandle);

  if (!hasInjectedAfter || (!hasExplicitContext && lastExecutionContext === null)) {
    pendingRuntimeScripts.push({ name, script });

    if (!hasInjectedAfter) {
      console.log(`[frida] queued ${name} until after-hook injection completes`);
    } else {
      console.log(`[frida] queued ${name} until a React Native script loader becomes available`);
    }

    return;
  }

  const context = hasExplicitContext
    ? createBridgeContext(bridgeHandle, selectorHandle)
    : getLatestExecutionContext();

  injectScriptWithContext(context, name, script, `frida://runtime-${name}.js`);
}

function buildCallRootFunctionsScript(functionNames, argsByName) {
  const namesJson = Array.isArray(functionNames) ? JSON.stringify(functionNames) : 'null';
  const argsJson = argsByName && typeof argsByName === 'object' ? JSON.stringify(argsByName) : '{}';

  return `(function () {
    var root = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();
    var names = ${namesJson};
    var argsByName = ${argsJson};

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

    if (!root.frida || typeof root.frida.callRootFunctions !== 'function') {
      log('[frida][bridge] root.frida.callRootFunctions is unavailable');
      flush();
      return;
    }

    var results = root.frida.callRootFunctions(names, argsByName);

    for (var index = 0; index < results.length; index++) {
      var result = results[index];

      if (result && result.ok) {
        log('[frida][bridge] call ok: ' + result.name);
      } else if (result) {
        log('[frida][bridge] call failed: ' + result.name + ' :: ' + result.error);
      }
    }

    flush();
  })();`;
}

function buildListRootFunctionsScript() {
  return `(function () {
    var root = typeof globalThis !== 'undefined' ? globalThis : Function('return this')();

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

    var names = [];

    try {
      if (root.frida && typeof root.frida.listRootFunctions === 'function') {
        names = root.frida.listRootFunctions();
      } else if (root.__fridaRegisteredFunctions) {
        names = Object.keys(root.__fridaRegisteredFunctions).sort();
      } else {
        log('[frida][bridge] no registered root functions found');
        flush();
        return;
      }
    } catch (error) {
      log('[frida][bridge] failed to list root functions :: ' + (error && error.stack ? String(error.stack) : String(error)));
      flush();
      return;
    }

    if (!names.length) {
      log('[frida][bridge] registered root functions: 0');
      flush();
      return;
    }

    log('${ROOT_FUNCTION_LIST_PREFIX}' + JSON.stringify(names));
    log('[frida][bridge] registered root functions: ' + names.length);

    for (var index = 0; index < names.length; index++) {
      log('[frida][bridge] root function: ' + names[index]);
    }

    flush();
  })();`;
}

function callRegisteredRootFunctions(functionNames, argsByName) {
  injectRuntimeScript(
    'call-root-functions',
    buildCallRootFunctionsScript(functionNames, argsByName)
  );
}

function listRegisteredRootFunctions() {
  injectRuntimeScript(
    'list-root-functions',
    buildListRootFunctionsScript()
  );
}

function callRegisteredRootFunction(functionName) {
  if (!functionName) {
    throw new Error('functionName is required');
  }

  callRegisteredRootFunctions([String(functionName)]);
}

function exposeRegisteredRootFunction(functionName, alias) {
  if (!functionName) {
    throw new Error('functionName is required');
  }

  const normalizedName = String(functionName);
  const proxyName = alias ? String(alias) : normalizedName;

  agentRoot[proxyName] = function () {
    const argsByName = {};
    argsByName[normalizedName] = Array.prototype.slice.call(arguments);
    callRegisteredRootFunctions([normalizedName], argsByName);
  };

  return proxyName;
}

function exposeRegisteredRootFunctions(functionNames) {
  if (!Array.isArray(functionNames)) {
    throw new Error('functionNames must be an array');
  }

  return functionNames.map((functionName) => exposeRegisteredRootFunction(functionName));
}

function injectOnceBefore(context) {
  if (hasInjectedBefore || isInjectingBefore || !context || context.targetHandle.isNull()) {
    return;
  }

  isInjectingBefore = true;

  try {
    INJECTION_STEPS_BEFORE.forEach((step) => {
      injectScriptWithContext(context, step.name, step.script, step.url);
    });

    hasInjectedBefore = true;
    console.log('[frida] injection complete');
  } catch (error) {
    console.error('[frida] injection failed:', error);
  } finally {
    isInjectingBefore = false;
  }
}

function injectOnceAfter(context) {
  if (hasInjectedAfter || isInjectingAfter || !context || context.targetHandle.isNull()) {
    return;
  }

  isInjectingAfter = true;

  try {
    INJECTION_STEPS_AFTER.forEach((step) => {
      injectScriptWithContext(context, step.name, step.script, step.url);
    });

    hasInjectedAfter = true;
    console.log('[frida] injection complete');
    drainPendingRuntimeScripts();
  } catch (error) {
    console.error('[frida] injection failed:', error);
  } finally {
    isInjectingAfter = false;
  }
}

agentRoot.exposeRegisteredRootFunction = exposeRegisteredRootFunction;
agentRoot.exposeRegisteredRootFunctions = exposeRegisteredRootFunctions;
agentRoot.listRegisteredRootFunctions = listRegisteredRootFunctions;
agentRoot.callRegisteredRootFunctions = callRegisteredRootFunctions;
agentRoot.callRegisteredRootFunction = callRegisteredRootFunction;

exposeRegisteredRootFunctions([
  'logModuleStats',
  'logModuleFunctions',
  'hookFunction'
]);

const installedHookNames = [];

if (installBridgeHook()) {
  installedHookNames.push('RCTCxxBridge');
}

if (installInstanceHook()) {
  installedHookNames.push('RCTInstance');
}

if (installedHookNames.length === 0) {
  throw new Error('No supported React Native script loader hooks were found');
}

if (typeof rpc !== 'undefined') {
  rpc.exports = {
    listrootfunctions() {
      listRegisteredRootFunctions();
      return { injected: true, mode: 'list' };
    },
    callallrootfunctions() {
      callRegisteredRootFunctions();
      return { injected: true, mode: 'all' };
    },
    callrootfunction(functionName) {
      callRegisteredRootFunction(functionName);
      return { injected: true, functionName: String(functionName) };
    },
    callrootfunctions(functionNames, argsByName) {
      callRegisteredRootFunctions(functionNames, argsByName);
      return {
        injected: true,
        functionNames: Array.isArray(functionNames) ? functionNames : null
      };
    }
  };
}

console.log(`[frida] React Native script loader hooks installed: ${installedHookNames.join(', ')}`);
installExceptionsHook();