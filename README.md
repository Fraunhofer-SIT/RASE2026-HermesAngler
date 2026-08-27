## Structure

```
hooks.js                    YOUR editable hook file (just your hooks, nothing else)
run-frida-agent.ps1         Compile + launch script
core/                      Framework internals (don't edit)
  frida-agent.js              Main Frida agent (ObjC hooks + script injection)
  frida-agent.bundle.js       Compiled bundle (auto-generated, don't edit)
  hermes-bootstrap.js         Plumbing (logging, retries, version detection)
  get_function_names/         Core hook engine
    hook_before_function_names.js   Injected before bundle — wraps Metro __d/__r
    hook_function_names.js          Injected after bundle — registers hookFunction()
examples/                   Ready-to-copy example scripts
  hook-xhr.js               Hook XMLHttpRequest to log network traffic
  get_engine_info/          Dump Hermes engine internals
  hook_hermes_engine/       Native Hermes/JSI interceptor hooks
  hook_single_function/     Standalone single-function hook (older approach)
logs/                       Frida session logs (auto-generated)
```

### Quick start

```powershell
# 1. Run with the default script (logs RN version, no hooks):
.\run-frida-agent.ps1 -BundleId <your.bundle.id>

# 2. To use an example, copy it over the root script:
Copy-Item .\examples\hook-xhr.js .\hooks.js
.\run-frida-agent.ps1 -BundleId <your.bundle.id>

# 3. To write your own hooks, edit hooks.js:
#    It exports a single function — put your hookFunction() calls there.
```

### hooks.js

This is the only file you edit. It exports a single function that receives `hookFunction` and has access to helper functions. All plumbing (logging, retries, version detection) is handled by `core/hermes-bootstrap.js` - you never see it.

```javascript
module.exports = function markUserSection(hookFunction) {
  hookFunction(123, 'someFunctionName');
};
```

Available helpers inside the function:
- `hookFunction(moduleId, functionName)` — wraps a function with a logging wrapper
- `getModuleExport(moduleId)` — returns a module's export object
- `log(msg)` / `flush()` — log to the Frida console
- `previewValue(value)` — safe string preview of any value

## How the Repo Works
This is a Frida-based React Native instrumentation framework for hooking JavaScript functions inside a running Hermes/RN app on iOS. The architecture has two layers: a Frida/ObjC agent (runs outside Hermes, has native access) and injected Hermes runtime scripts (run inside the JS engine, can touch Metro modules).

run-frida-agent.ps1
  └─ frida-compile core/frida-agent.js → core/frida-agent.bundle.js
  └─ frida -D <device> -f <bundle-id> -l core/frida-agent.bundle.js
       └─ frida-agent.js  (Frida/ObjC layer)
            ├─ Hooks NSURLSessionTask -resume  → captures Hermes console.log output (POSTed to https://localhost/frida-log)
            ├─ Hooks RCTCxxBridge -executeApplicationScript:url:async:  (legacy bridge)
            ├─ Hooks RCTInstance -_loadScriptFromSource:  (bridgeless / new arch)
            │
            ├─ BEFORE bundle loads, injects:
            │    1. install-logger        → sets up root.frida.log() / root.frida.flushLogs()
            │    2. hook_before_function_names.js  → wraps Metro __d/__r to capture ALL modules
            │
            └─ AFTER bundle loads (8s delay), injects:
                 3. hook_function_names.js  → registers hookFunction(), forceRequireModule(), etc.
                 4. hermes-bootstrap.js → imports ../../hooks.js, inlines it, injects into Hermes

## Finding a Module by Function Name and Hooking It

The agent auto-exposes these Frida REPL proxies (defined in `frida-agent.js` → `exposeRegisteredRootFunctions`):

| Proxy | What it does |
|---|---|
| `logModuleStats()` | Prints counts: how many modules defined / required / executed |
| `logModuleFunctions(batchSize)` | Dumps every module's exported function names as `[functions][after] M:<id> fn=[name(arity), ...]` |
| `hookFunction(moduleId, functionName)` | Wraps a function in a module with a logging wrapper |

`forceRequireModule(moduleId)` is also registered as a root function but is not auto-exposed as a top-level REPL proxy. To call it, use `callRegisteredRootFunction('forceRequireModule', [123])` from the Frida REPL.

### Step-by-step example: hooking a function by name

**Goal:** You know a function name exists somewhere in the bundle (from static analysis), but you don't know which Metro module ID contains it.

#### 1. Launch the agent

```powershell
.\run-frida-agent.ps1 -BundleId <your.bundle.id>
```

This compiles `frida-agent.bundle.js` and spawns the app with Frida attached. Wait for the console to show:

```
[frida] legacy RCTCxxBridge executeApplicationScript hook installed
[frida] bridgeless RCTInstance _loadScriptFromSource hook installed
[frida] React Native script loader hooks installed: RCTCxxBridge, RCTInstance
[frida][hermes] [hook-function-names] registered functions: 3
[frida][hermes] [hook-function-names] function: hookFunction()
[frida][hermes] [hook-function-names] function: logModuleFunctions()
[frida][hermes] [hook-function-names] function: logModuleStats()
[frida][hermes] [user-runtime] ready
```

The post-bundle delay must elapse before the REPL proxies are live.

#### 2. Dump all function names

In the Frida REPL prompt, type:

```javascript
logModuleFunctions()
```

This iterates every executed module in `root.moduleExportsMap` and logs lines like:

```
[frida][hermes] [functions][after] M:1 fn=[_interopRequireDefault(1), default(1)]
[frida][hermes] [functions][after] M:2 fn=[BaseButton [lazy], BorderlessButton [lazy], ...]
[frida][hermes] [functions][after] M:16 fn=[Component(3), PureComponent(3), ...]
...
```

#### 3. Search the output for your function name

The Frida REPL output is captured in the terminal. To search it, redirect to a file or use PowerShell:

> **Tip:** If `logModuleFunctions()` produces too much output, pass a batch size to control pacing:
> ```javascript
> logModuleFunctions(10)
> ```
> Output is also saved to `./logs/frida-<timestamp>.log` by `run-frida-agent.ps1`, so you can grep offline:
> ```powershell
> Select-String -Path .\logs\frida-*.log -Pattern 'yourFunctionName'
> ```

Once you find the module ID, note all the function names and their arities from the dump.

#### 4. Hook the function

Now that you know the module ID, call `hookFunction` in the REPL:

```javascript
hookFunction(123, 'someFunctionName')
```

Verified output:

```
[frida][hermes] [hook][ok] M:123 someFunctionName hooked
```

Repeat for any other functions in the same module.

#### 5. Trigger the function and observe logs

Use the app normally (e.g., perform a login or API call). Each time the hooked function is called you'll see:

```
[frida][hermes] [hook][call] M:123 someFunctionName args=1
```

#### 6. (Optional) Make the hook permanent

Instead of typing REPL commands every run, edit `hooks.js` and add `hookFunction()` calls:

```javascript
module.exports = function markUserSection(hookFunction) {
  hookFunction(123, 'someFunctionName');
};
```

The loader handles retries and bootstrap automatically on every launch.

### What if the module isn't loaded yet?

If `logModuleFunctions()` doesn't show your function, the module may not have been required by the app yet. Two options:

1. **Navigate the app** to the screen that uses the feature (e.g., the login screen), then re-run `logModuleFunctions()`.
2. **Force-require** the module if you know its ID:
   ```javascript
   forceRequireModule(123)
   ```
   Then hook it. Note: force-requiring can crash the app if the module has unmet dependencies.