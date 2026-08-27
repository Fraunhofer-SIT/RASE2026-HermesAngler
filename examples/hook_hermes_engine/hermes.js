const mod = Process.findModuleByName("hermes");

function safeHexdump(ptr, length) {
  try {
    return hexdump(ptr, {
      offset: 0,
      length,
      header: false,
      ansi: false
    });
  } catch (error) {
    return `<hexdump failed: ${error}>`;
  }
}

function logJsiValueInstance(symbolName, valuePtr) {
  console.log(`[${symbolName}] this:`, valuePtr);

  if (valuePtr.isNull()) {
    console.log(`[${symbolName}] this is NULL`);
    return;
  }

  console.log(`[${symbolName}] this bytes:\n${safeHexdump(valuePtr, 0x10)}`);
}

// _ZN6hermes2vm12CrashManagerD0Ev
// hermes::vm::CrashManager::~CrashManager()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm12CrashManagerD0Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm12CrashManagerD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm12CrashManagerD0Ev] returned:', retval);
  }
});

// _ZN6hermes2vm12CrashManagerD1Ev
// hermes::vm::CrashManager::~CrashManager()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm12CrashManagerD1Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm12CrashManagerD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm12CrashManagerD1Ev] returned:', retval);
  }
});

// _ZN6hermes2vm12CrashManagerD2Ev
// hermes::vm::CrashManager::~CrashManager()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm12CrashManagerD2Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm12CrashManagerD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm12CrashManagerD2Ev] returned:', retval);
  }
});

// _ZN6hermes2vm15NopCrashManagerD0Ev
// hermes::vm::NopCrashManager::~NopCrashManager()
/*
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm15NopCrashManagerD0Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm15NopCrashManagerD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm15NopCrashManagerD0Ev] returned:', retval);
  }
});
*/

// _ZN6hermes2vm15NopCrashManagerD1Ev
// hermes::vm::NopCrashManager::~NopCrashManager()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm15NopCrashManagerD1Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm15NopCrashManagerD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm15NopCrashManagerD1Ev] returned:', retval);
  }
});

// _ZN6hermes2vm15NopCrashManagerD2Ev
// hermes::vm::NopCrashManager::~NopCrashManager()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm15NopCrashManagerD2Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm15NopCrashManagerD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm15NopCrashManagerD2Ev] returned:', retval);
  }
});

// _ZN6hermes2vm17GCTripwireContextD0Ev
// hermes::vm::GCTripwireContext::~GCTripwireContext()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm17GCTripwireContextD0Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm17GCTripwireContextD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm17GCTripwireContextD0Ev] returned:', retval);
  }
});

// _ZN6hermes2vm17GCTripwireContextD1Ev
// hermes::vm::GCTripwireContext::~GCTripwireContext()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm17GCTripwireContextD1Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm17GCTripwireContextD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm17GCTripwireContextD1Ev] returned:', retval);
  }
});

// _ZN6hermes2vm17GCTripwireContextD2Ev
// hermes::vm::GCTripwireContext::~GCTripwireContext()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm17GCTripwireContextD2Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm17GCTripwireContextD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm17GCTripwireContextD2Ev] returned:', retval);
  }
});

// _ZN6hermes2vm18JSOutOfMemoryErrorD0Ev
// hermes::vm::JSOutOfMemoryError::~JSOutOfMemoryError()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm18JSOutOfMemoryErrorD0Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm18JSOutOfMemoryErrorD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm18JSOutOfMemoryErrorD0Ev] returned:', retval);
  }
});

// _ZN6hermes2vm18JSOutOfMemoryErrorD1Ev
// hermes::vm::JSOutOfMemoryError::~JSOutOfMemoryError()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm18JSOutOfMemoryErrorD1Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm18JSOutOfMemoryErrorD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm18JSOutOfMemoryErrorD1Ev] returned:', retval);
  }
});

// _ZN6hermes2vm18JSOutOfMemoryErrorD2Ev
// hermes::vm::JSOutOfMemoryError::~JSOutOfMemoryError()
Interceptor.attach(mod.getExportByName("_ZN6hermes2vm18JSOutOfMemoryErrorD2Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes2vm18JSOutOfMemoryErrorD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes2vm18JSOutOfMemoryErrorD2Ev] returned:', retval);
  }
});

// _ZN6hermes6BufferD0Ev
// hermes::Buffer::~Buffer()
/*
Interceptor.attach(mod.getExportByName("_ZN6hermes6BufferD0Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes6BufferD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes6BufferD0Ev] returned:', retval);
  }
});
*/

// _ZN6hermes6BufferD1Ev
// hermes::Buffer::~Buffer()
Interceptor.attach(mod.getExportByName("_ZN6hermes6BufferD1Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes6BufferD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes6BufferD1Ev] returned:', retval);
  }
});

// _ZN6hermes6BufferD2Ev
// hermes::Buffer::~Buffer()
/*
Interceptor.attach(mod.getExportByName("_ZN6hermes6BufferD2Ev"), {
  onEnter(args) {
    console.log('[_ZN6hermes6BufferD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN6hermes6BufferD2Ev] returned:', retval);
  }
});
*/

// _ZN8facebook3jsi10HostObject16getPropertyNamesERNS0_7RuntimeE
// facebook::jsi::HostObject::getPropertyNames(facebook::jsi::Runtime&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi10HostObject16getPropertyNamesERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi10HostObject16getPropertyNamesERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi10HostObject16getPropertyNamesERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZN8facebook3jsi10HostObject3getERNS0_7RuntimeERKNS0_10PropNameIDE
// facebook::jsi::HostObject::get(facebook::jsi::Runtime&, facebook::jsi::PropNameID const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi10HostObject3getERNS0_7RuntimeERKNS0_10PropNameIDE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi10HostObject3getERNS0_7RuntimeERKNS0_10PropNameIDE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi10HostObject3getERNS0_7RuntimeERKNS0_10PropNameIDE] returned:', retval);
  }
});

// _ZN8facebook3jsi10HostObject3setERNS0_7RuntimeERKNS0_10PropNameIDERKNS0_5ValueE
// facebook::jsi::HostObject::set(facebook::jsi::Runtime&, facebook::jsi::PropNameID const&, facebook::jsi::Value const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi10HostObject3setERNS0_7RuntimeERKNS0_10PropNameIDERKNS0_5ValueE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi10HostObject3setERNS0_7RuntimeERKNS0_10PropNameIDERKNS0_5ValueE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi10HostObject3setERNS0_7RuntimeERKNS0_10PropNameIDERKNS0_5ValueE] returned:', retval);
  }
});

// _ZN8facebook3jsi10HostObjectD0Ev
// facebook::jsi::HostObject::~HostObject()
/*
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi10HostObjectD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi10HostObjectD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi10HostObjectD0Ev] returned:', retval);
  }
});
*/

// _ZN8facebook3jsi10HostObjectD1Ev
// facebook::jsi::HostObject::~HostObject()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi10HostObjectD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi10HostObjectD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi10HostObjectD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi10HostObjectD2Ev
// facebook::jsi::HostObject::~HostObject()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi10HostObjectD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi10HostObjectD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi10HostObjectD2Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi11NativeStateD0Ev
// facebook::jsi::NativeState::~NativeState()
/*
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi11NativeStateD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi11NativeStateD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi11NativeStateD0Ev] returned:', retval);
  }
});
*/

// _ZN8facebook3jsi11NativeStateD1Ev
// facebook::jsi::NativeState::~NativeState()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi11NativeStateD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi11NativeStateD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi11NativeStateD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi11NativeStateD2Ev
// facebook::jsi::NativeState::~NativeState()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi11NativeStateD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi11NativeStateD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi11NativeStateD2Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi12JSIExceptionD0Ev
// facebook::jsi::JSIException::~JSIException()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi12JSIExceptionD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi12JSIExceptionD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi12JSIExceptionD0Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi12JSIExceptionD1Ev
// facebook::jsi::JSIException::~JSIException()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi12JSIExceptionD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi12JSIExceptionD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi12JSIExceptionD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi12JSIExceptionD2Ev
// facebook::jsi::JSIException::~JSIException()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi12JSIExceptionD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi12JSIExceptionD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi12JSIExceptionD2Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi13MutableBufferD0Ev
// facebook::jsi::MutableBuffer::~MutableBuffer()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi13MutableBufferD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi13MutableBufferD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi13MutableBufferD0Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi13MutableBufferD1Ev
// facebook::jsi::MutableBuffer::~MutableBuffer()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi13MutableBufferD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi13MutableBufferD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi13MutableBufferD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi13MutableBufferD2Ev
// facebook::jsi::MutableBuffer::~MutableBuffer()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi13MutableBufferD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi13MutableBufferD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi13MutableBufferD2Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi18JSINativeExceptionD0Ev
// facebook::jsi::JSINativeException::~JSINativeException()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi18JSINativeExceptionD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi18JSINativeExceptionD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi18JSINativeExceptionD0Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi18JSINativeExceptionD1Ev
// facebook::jsi::JSINativeException::~JSINativeException()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi18JSINativeExceptionD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi18JSINativeExceptionD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi18JSINativeExceptionD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi18JSINativeExceptionD2Ev
// facebook::jsi::JSINativeException::~JSINativeException()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi18JSINativeExceptionD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi18JSINativeExceptionD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi18JSINativeExceptionD2Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi18PreparedJavaScriptD0Ev
// facebook::jsi::PreparedJavaScript::~PreparedJavaScript()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi18PreparedJavaScriptD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi18PreparedJavaScriptD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi18PreparedJavaScriptD0Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi18PreparedJavaScriptD1Ev
// facebook::jsi::PreparedJavaScript::~PreparedJavaScript()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi18PreparedJavaScriptD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi18PreparedJavaScriptD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi18PreparedJavaScriptD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi18PreparedJavaScriptD2Ev
// facebook::jsi::PreparedJavaScript::~PreparedJavaScript()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi18PreparedJavaScriptD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi18PreparedJavaScriptD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi18PreparedJavaScriptD2Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi5Array18createWithElementsERNS0_7RuntimeESt16initializer_listINS0_5ValueEE
// facebook::jsi::Array::createWithElements(facebook::jsi::Runtime&, std::initializer_list<facebook::jsi::Value>)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi5Array18createWithElementsERNS0_7RuntimeESt16initializer_listINS0_5ValueEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi5Array18createWithElementsERNS0_7RuntimeESt16initializer_listINS0_5ValueEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi5Array18createWithElementsERNS0_7RuntimeESt16initializer_listINS0_5ValueEE] returned:', retval);
  }
});

// _ZN8facebook3jsi5Value12strictEqualsERNS0_7RuntimeERKS1_S5_
// facebook::jsi::Value::strictEquals(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi5Value12strictEqualsERNS0_7RuntimeERKS1_S5_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi5Value12strictEqualsERNS0_7RuntimeERKS1_S5_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi5Value12strictEqualsERNS0_7RuntimeERKS1_S5_] returned:', retval);
  }
});

// _ZN8facebook3jsi5ValueC1EOS1_
// facebook::jsi::Value::Value(facebook::jsi::Value&&)
/*
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi5ValueC1EOS1_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi5ValueC1EOS1_] called');
    logJsiValueInstance('_ZN8facebook3jsi5ValueC1EOS1_', args[0]);
    logJsiValueInstance('_ZN8facebook3jsi5ValueC1EOS1_', args[1]);

  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi5ValueC1EOS1_] returned:', retval);
  }
});
/*

// _ZN8facebook3jsi5ValueC1ERNS0_7RuntimeERKS1_
// facebook::jsi::Value::Value(facebook::jsi::Runtime&, facebook::jsi::Value const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi5ValueC1ERNS0_7RuntimeERKS1_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi5ValueC1ERNS0_7RuntimeERKS1_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi5ValueC1ERNS0_7RuntimeERKS1_] returned:', retval);
  }
});

// _ZN8facebook3jsi5ValueC2EOS1_
// facebook::jsi::Value::Value(facebook::jsi::Value&&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi5ValueC2EOS1_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi5ValueC2EOS1_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi5ValueC2EOS1_] returned:', retval);
  }
});

// _ZN8facebook3jsi5ValueC2ERNS0_7RuntimeERKS1_
// facebook::jsi::Value::Value(facebook::jsi::Runtime&, facebook::jsi::Value const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi5ValueC2ERNS0_7RuntimeERKS1_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi5ValueC2ERNS0_7RuntimeERKS1_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi5ValueC2ERNS0_7RuntimeERKS1_] returned:', retval);
  }
});

// _ZN8facebook3jsi5ValueD1Ev
// facebook::jsi::Value::~Value()
/*
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi5ValueD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi5ValueD1Ev] called');
    logJsiValueInstance('_ZN8facebook3jsi5ValueD1Ev', args[0]);
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi5ValueD1Ev] returned:', retval);
  }
});
*/

// _ZN8facebook3jsi5ValueD2Ev
// facebook::jsi::Value::~Value()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi5ValueD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi5ValueD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi5ValueD2Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi6BufferD0Ev
// facebook::jsi::Buffer::~Buffer()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi6BufferD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi6BufferD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi6BufferD0Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi6BufferD1Ev
// facebook::jsi::Buffer::~Buffer()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi6BufferD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi6BufferD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi6BufferD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi6BufferD2Ev
// facebook::jsi::Buffer::~Buffer()
/*
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi6BufferD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi6BufferD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi6BufferD2Ev] returned:', retval);
  }
});
*/

// _ZN8facebook3jsi7JSError8setValueERNS0_7RuntimeEONS0_5ValueE
// facebook::jsi::JSError::setValue(facebook::jsi::Runtime&, facebook::jsi::Value&&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSError8setValueERNS0_7RuntimeEONS0_5ValueE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSError8setValueERNS0_7RuntimeEONS0_5ValueE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSError8setValueERNS0_7RuntimeEONS0_5ValueE] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC1ENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERNS0_7RuntimeEONS0_5ValueE
// facebook::jsi::JSError::JSError(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >, facebook::jsi::Runtime&, facebook::jsi::Value&&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC1ENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERNS0_7RuntimeEONS0_5ValueE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC1ENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERNS0_7RuntimeEONS0_5ValueE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC1ENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERNS0_7RuntimeEONS0_5ValueE] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC1EONS0_5ValueENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_
// facebook::jsi::JSError::JSError(facebook::jsi::Value&&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC1EONS0_5ValueENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC1EONS0_5ValueENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC1EONS0_5ValueENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE
// facebook::jsi::JSError::JSError(facebook::jsi::Runtime&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_
// facebook::jsi::JSError::JSError(facebook::jsi::Runtime&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeEONS0_5ValueE
// facebook::jsi::JSError::JSError(facebook::jsi::Runtime&, facebook::jsi::Value&&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeEONS0_5ValueE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeEONS0_5ValueE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC1ERNS0_7RuntimeEONS0_5ValueE] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC2ENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERNS0_7RuntimeEONS0_5ValueE
// facebook::jsi::JSError::JSError(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >, facebook::jsi::Runtime&, facebook::jsi::Value&&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC2ENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERNS0_7RuntimeEONS0_5ValueE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC2ENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERNS0_7RuntimeEONS0_5ValueE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC2ENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEERNS0_7RuntimeEONS0_5ValueE] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC2EONS0_5ValueENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_
// facebook::jsi::JSError::JSError(facebook::jsi::Value&&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC2EONS0_5ValueENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC2EONS0_5ValueENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC2EONS0_5ValueENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE
// facebook::jsi::JSError::JSError(facebook::jsi::Runtime&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_
// facebook::jsi::JSError::JSError(facebook::jsi::Runtime&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeENSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEESA_] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeEONS0_5ValueE
// facebook::jsi::JSError::JSError(facebook::jsi::Runtime&, facebook::jsi::Value&&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeEONS0_5ValueE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeEONS0_5ValueE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorC2ERNS0_7RuntimeEONS0_5ValueE] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorD0Ev
// facebook::jsi::JSError::~JSError()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorD0Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorD1Ev
// facebook::jsi::JSError::~JSError()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi7JSErrorD2Ev
// facebook::jsi::JSError::~JSError()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7JSErrorD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7JSErrorD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7JSErrorD2Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi7PointeraSEOS1_
// facebook::jsi::Pointer::operator=(facebook::jsi::Pointer&&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7PointeraSEOS1_"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7PointeraSEOS1_] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7PointeraSEOS1_] returned:', retval);
  }
});

// _ZN8facebook3jsi7Runtime15instrumentationEv
// facebook::jsi::Runtime::instrumentation()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7Runtime15instrumentationEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7Runtime15instrumentationEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7Runtime15instrumentationEv] returned:', retval);
  }
});

// _ZN8facebook3jsi7Runtime23createValueFromJsonUtf8EPKhm
// facebook::jsi::Runtime::createValueFromJsonUtf8(unsigned char const*, unsigned long)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7Runtime23createValueFromJsonUtf8EPKhm"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7Runtime23createValueFromJsonUtf8EPKhm] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7Runtime23createValueFromJsonUtf8EPKhm] returned:', retval);
  }
});

// _ZN8facebook3jsi7Runtime5utf16ERKNS0_10PropNameIDE
// facebook::jsi::Runtime::utf16(facebook::jsi::PropNameID const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7Runtime5utf16ERKNS0_10PropNameIDE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7Runtime5utf16ERKNS0_10PropNameIDE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7Runtime5utf16ERKNS0_10PropNameIDE] returned:', retval);
  }
});

// _ZN8facebook3jsi7Runtime5utf16ERKNS0_6StringE
// facebook::jsi::Runtime::utf16(facebook::jsi::String const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7Runtime5utf16ERKNS0_6StringE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7Runtime5utf16ERKNS0_6StringE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7Runtime5utf16ERKNS0_6StringE] returned:', retval);
  }
});

// _ZN8facebook3jsi7Runtime8popScopeEPNS1_10ScopeStateE
// facebook::jsi::Runtime::popScope(facebook::jsi::Runtime::ScopeState*)
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7Runtime8popScopeEPNS1_10ScopeStateE"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7Runtime8popScopeEPNS1_10ScopeStateE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7Runtime8popScopeEPNS1_10ScopeStateE] returned:', retval);
  }
});

// _ZN8facebook3jsi7Runtime9pushScopeEv
// facebook::jsi::Runtime::pushScope()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7Runtime9pushScopeEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7Runtime9pushScopeEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7Runtime9pushScopeEv] returned:', retval);
  }
});

// _ZN8facebook3jsi7RuntimeD0Ev
// facebook::jsi::Runtime::~Runtime()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7RuntimeD0Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7RuntimeD0Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7RuntimeD0Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi7RuntimeD1Ev
// facebook::jsi::Runtime::~Runtime()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7RuntimeD1Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7RuntimeD1Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7RuntimeD1Ev] returned:', retval);
  }
});

// _ZN8facebook3jsi7RuntimeD2Ev
// facebook::jsi::Runtime::~Runtime()
Interceptor.attach(mod.getExportByName("_ZN8facebook3jsi7RuntimeD2Ev"), {
  onEnter(args) {
    console.log('[_ZN8facebook3jsi7RuntimeD2Ev] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook3jsi7RuntimeD2Ev] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime11getDebuggerEv
// facebook::hermes::HermesRuntime::getDebugger()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime11getDebuggerEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime11getDebuggerEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime11getDebuggerEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime11loadSegmentENSt3__110unique_ptrIKNS_3jsi6BufferENS2_14default_deleteIS6_EEEERKNS4_5ValueE
// facebook::hermes::HermesRuntime::loadSegment(std::__1::unique_ptr<facebook::jsi::Buffer const, std::__1::default_delete<facebook::jsi::Buffer const> >, facebook::jsi::Value const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime11loadSegmentENSt3__110unique_ptrIKNS_3jsi6BufferENS2_14default_deleteIS6_EEEERKNS4_5ValueE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime11loadSegmentENSt3__110unique_ptrIKNS_3jsi6BufferENS2_14default_deleteIS6_EEEERKNS4_5ValueE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime11loadSegmentENSt3__110unique_ptrIKNS_3jsi6BufferENS2_14default_deleteIS6_EEEERKNS4_5ValueE] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime14getObjectForIDEy
// facebook::hermes::HermesRuntime::getObjectForID(unsigned long long)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime14getObjectForIDEy"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime14getObjectForIDEy] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime14getObjectForIDEy] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime14watchTimeLimitEj
// facebook::hermes::HermesRuntime::watchTimeLimit(unsigned int)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime14watchTimeLimitEj"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime14watchTimeLimitEj] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime14watchTimeLimitEj] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime15setFatalHandlerEPFvRKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE
// facebook::hermes::HermesRuntime::setFatalHandler(void (*)(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> > const&))
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime15setFatalHandlerEPFvRKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime15setFatalHandlerEPFvRKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime15setFatalHandlerEPFvRKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime16isHermesBytecodeEPKhm
// facebook::hermes::HermesRuntime::isHermesBytecode(unsigned char const*, unsigned long)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime16isHermesBytecodeEPKhm"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime16isHermesBytecodeEPKhm] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime16isHermesBytecodeEPKhm] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime16unwatchTimeLimitEv
// facebook::hermes::HermesRuntime::unwatchTimeLimit()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime16unwatchTimeLimitEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime16unwatchTimeLimitEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime16unwatchTimeLimitEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime18getBytecodeVersionEv
// facebook::hermes::HermesRuntime::getBytecodeVersion()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime18getBytecodeVersionEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime18getBytecodeVersionEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime18getBytecodeVersionEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime19asyncTriggerTimeoutEv
// facebook::hermes::HermesRuntime::asyncTriggerTimeout()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime19asyncTriggerTimeoutEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime19asyncTriggerTimeoutEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime19asyncTriggerTimeoutEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime19getBytecodeEpilogueEPKhm
// facebook::hermes::HermesRuntime::getBytecodeEpilogue(unsigned char const*, unsigned long)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime19getBytecodeEpilogueEPKhm"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime19getBytecodeEpilogueEPKhm] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime19getBytecodeEpilogueEPKhm] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime20getExecutedFunctionsEv
// facebook::hermes::HermesRuntime::getExecutedFunctions()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime20getExecutedFunctionsEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime20getExecutedFunctionsEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime20getExecutedFunctionsEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime20registerForProfilingEv
// facebook::hermes::HermesRuntime::registerForProfiling()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime20registerForProfilingEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime20registerForProfilingEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime20registerForProfilingEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime21getIOTrackingInfoJSONEv
// facebook::hermes::HermesRuntime::getIOTrackingInfoJSON()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime21getIOTrackingInfoJSONEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime21getIOTrackingInfoJSONEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime21getIOTrackingInfoJSONEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime22dumpSampledTraceToFileERKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE
// facebook::hermes::HermesRuntime::dumpSampledTraceToFile(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> > const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime22dumpSampledTraceToFileERKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime22dumpSampledTraceToFileERKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime22dumpSampledTraceToFileERKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime22enableSamplingProfilerEd
// facebook::hermes::HermesRuntime::enableSamplingProfiler(double)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime22enableSamplingProfilerEd"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime22enableSamplingProfilerEd] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime22enableSamplingProfilerEd] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime22prefetchHermesBytecodeEPKhm
// facebook::hermes::HermesRuntime::prefetchHermesBytecode(unsigned char const*, unsigned long)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime22prefetchHermesBytecodeEPKhm"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime22prefetchHermesBytecodeEPKhm] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime22prefetchHermesBytecodeEPKhm] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime22unregisterForProfilingEv
// facebook::hermes::HermesRuntime::unregisterForProfiling()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime22unregisterForProfilingEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime22unregisterForProfilingEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime22unregisterForProfilingEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime23disableSamplingProfilerEv
// facebook::hermes::HermesRuntime::disableSamplingProfiler()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime23disableSamplingProfilerEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime23disableSamplingProfilerEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime23disableSamplingProfilerEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime24dumpSampledTraceToStreamERNSt3__113basic_ostreamIcNS2_11char_traitsIcEEEE
// facebook::hermes::HermesRuntime::dumpSampledTraceToStream(std::__1::basic_ostream<char, std::__1::char_traits<char> >&)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime24dumpSampledTraceToStreamERNSt3__113basic_ostreamIcNS2_11char_traitsIcEEEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime24dumpSampledTraceToStreamERNSt3__113basic_ostreamIcNS2_11char_traitsIcEEEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime24dumpSampledTraceToStreamERNSt3__113basic_ostreamIcNS2_11char_traitsIcEEEE] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime25hermesBytecodeSanityCheckEPKhmPNSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE
// facebook::hermes::HermesRuntime::hermesBytecodeSanityCheck(unsigned char const*, unsigned long, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> >*)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime25hermesBytecodeSanityCheckEPKhmPNSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime25hermesBytecodeSanityCheckEPKhmPNSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime25hermesBytecodeSanityCheckEPKhmPNSt3__112basic_stringIcNS4_11char_traitsIcEENS4_9allocatorIcEEEE] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime26enableCodeCoverageProfilerEv
// facebook::hermes::HermesRuntime::enableCodeCoverageProfiler()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime26enableCodeCoverageProfilerEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime26enableCodeCoverageProfilerEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime26enableCodeCoverageProfilerEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime27disableCodeCoverageProfilerEv
// facebook::hermes::HermesRuntime::disableCodeCoverageProfiler()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime27disableCodeCoverageProfilerEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime27disableCodeCoverageProfilerEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime27disableCodeCoverageProfilerEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime29isCodeCoverageProfilerEnabledEv
// facebook::hermes::HermesRuntime::isCodeCoverageProfilerEnabled()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime29isCodeCoverageProfilerEnabledEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime29isCodeCoverageProfilerEnabledEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime29isCodeCoverageProfilerEnabledEv] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime31evaluateJavaScriptWithSourceMapERKNSt3__110shared_ptrIKNS_3jsi6BufferEEES9_RKNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE
// facebook::hermes::HermesRuntime::evaluateJavaScriptWithSourceMap(std::__1::shared_ptr<facebook::jsi::Buffer const> const&, std::__1::shared_ptr<facebook::jsi::Buffer const> const&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> > const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime31evaluateJavaScriptWithSourceMapERKNSt3__110shared_ptrIKNS_3jsi6BufferEEES9_RKNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime31evaluateJavaScriptWithSourceMapERKNSt3__110shared_ptrIKNS_3jsi6BufferEEES9_RKNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime31evaluateJavaScriptWithSourceMapERKNSt3__110shared_ptrIKNS_3jsi6BufferEEES9_RKNS2_12basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE] returned:', retval);
  }
});

// _ZN8facebook6hermes13HermesRuntime36sampledTraceToStreamInDevToolsFormatERNSt3__113basic_ostreamIcNS2_11char_traitsIcEEEE
// facebook::hermes::HermesRuntime::sampledTraceToStreamInDevToolsFormat(std::__1::basic_ostream<char, std::__1::char_traits<char> >&)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes13HermesRuntime36sampledTraceToStreamInDevToolsFormatERNSt3__113basic_ostreamIcNS2_11char_traitsIcEEEE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes13HermesRuntime36sampledTraceToStreamInDevToolsFormatERNSt3__113basic_ostreamIcNS2_11char_traitsIcEEEE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes13HermesRuntime36sampledTraceToStreamInDevToolsFormatERNSt3__113basic_ostreamIcNS2_11char_traitsIcEEEE] returned:', retval);
  }
});

// _ZN8facebook6hermes17makeHermesRuntimeERKN6hermes2vm13RuntimeConfigE
// facebook::hermes::makeHermesRuntime(hermes::vm::RuntimeConfig const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes17makeHermesRuntimeERKN6hermes2vm13RuntimeConfigE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes17makeHermesRuntimeERKN6hermes2vm13RuntimeConfigE] called');
    //logJsiValueInstance("[_ZN8facebook6hermes17makeHermesRuntimeERKN6hermes2vm13RuntimeConfigE] arg0", args[0]);
    //logJsiValueInstance("[_ZN8facebook6hermes17makeHermesRuntimeERKN6hermes2vm13RuntimeConfigE] arg1", args[1]);


  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes17makeHermesRuntimeERKN6hermes2vm13RuntimeConfigE] returned:', retval);
  }
});

// _ZN8facebook6hermes27hardenedHermesRuntimeConfigEv
// facebook::hermes::hardenedHermesRuntimeConfig()
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes27hardenedHermesRuntimeConfigEv"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes27hardenedHermesRuntimeConfigEv] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes27hardenedHermesRuntimeConfigEv] returned:', retval);
  }
});

// _ZN8facebook6hermes27makeThreadSafeHermesRuntimeERKN6hermes2vm13RuntimeConfigE
// facebook::hermes::makeThreadSafeHermesRuntime(hermes::vm::RuntimeConfig const&)
Interceptor.attach(mod.getExportByName("_ZN8facebook6hermes27makeThreadSafeHermesRuntimeERKN6hermes2vm13RuntimeConfigE"), {
  onEnter(args) {
    console.log('[_ZN8facebook6hermes27makeThreadSafeHermesRuntimeERKN6hermes2vm13RuntimeConfigE] called');
  },
  onLeave(retval) {
    console.log('[_ZN8facebook6hermes27makeThreadSafeHermesRuntimeERKN6hermes2vm13RuntimeConfigE] returned:', retval);
  }
});

// _ZNK8facebook3jsi5Value6asBoolEv
// facebook::jsi::Value::asBool() const
Interceptor.attach(mod.getExportByName("_ZNK8facebook3jsi5Value6asBoolEv"), {
  onEnter(args) {
    console.log('[_ZNK8facebook3jsi5Value6asBoolEv] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook3jsi5Value6asBoolEv] returned:', retval);
  }
});

// _ZNK8facebook3jsi5Value8asNumberEv
// facebook::jsi::Value::asNumber() const
/*
Interceptor.attach(mod.getExportByName("_ZNK8facebook3jsi5Value8asNumberEv"), {
  onEnter(args) {
    console.log('[_ZNK8facebook3jsi5Value8asNumberEv] called');
    //logJsiValueInstance("[_ZNK8facebook3jsi5Value8asNumberEv] this", args[0]);
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook3jsi5Value8asNumberEv] returned:', retval);
    logJsiValueInstance("[_ZNK8facebook3jsi5Value8asNumberEv] ret", retval);
  }
});
*/

// _ZNK8facebook3jsi5Value8toStringERNS0_7RuntimeE
// facebook::jsi::Value::toString(facebook::jsi::Runtime&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook3jsi5Value8toStringERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook3jsi5Value8toStringERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook3jsi5Value8toStringERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNK8facebook3jsi6BigInt7asInt64ERNS0_7RuntimeE
// facebook::jsi::BigInt::asInt64(facebook::jsi::Runtime&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook3jsi6BigInt7asInt64ERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook3jsi6BigInt7asInt64ERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook3jsi6BigInt7asInt64ERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNK8facebook3jsi6BigInt8asUint64ERNS0_7RuntimeE
// facebook::jsi::BigInt::asUint64(facebook::jsi::Runtime&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook3jsi6BigInt8asUint64ERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook3jsi6BigInt8asUint64ERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook3jsi6BigInt8asUint64ERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNK8facebook3jsi6Object19getPropertyAsObjectERNS0_7RuntimeEPKc
// facebook::jsi::Object::getPropertyAsObject(facebook::jsi::Runtime&, char const*) const
/*
Interceptor.attach(mod.getExportByName("_ZNK8facebook3jsi6Object19getPropertyAsObjectERNS0_7RuntimeEPKc"), {
  onEnter(args) {
    console.log('[_ZNK8facebook3jsi6Object19getPropertyAsObjectERNS0_7RuntimeEPKc] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook3jsi6Object19getPropertyAsObjectERNS0_7RuntimeEPKc] returned:', retval);
  }
});
*/

// _ZNK8facebook3jsi6Object21getPropertyAsFunctionERNS0_7RuntimeEPKc
// facebook::jsi::Object::getPropertyAsFunction(facebook::jsi::Runtime&, char const*) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook3jsi6Object21getPropertyAsFunctionERNS0_7RuntimeEPKc"), {
  onEnter(args) {
    console.log('[_ZNK8facebook3jsi6Object21getPropertyAsFunctionERNS0_7RuntimeEPKc] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook3jsi6Object21getPropertyAsFunctionERNS0_7RuntimeEPKc] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi10PropNameIDE
// facebook::hermes::HermesRuntime::getUniqueID(facebook::jsi::PropNameID const&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi10PropNameIDE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi10PropNameIDE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi10PropNameIDE] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi5ValueE
// facebook::hermes::HermesRuntime::getUniqueID(facebook::jsi::Value const&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi5ValueE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi5ValueE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi5ValueE] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6BigIntE
// facebook::hermes::HermesRuntime::getUniqueID(facebook::jsi::BigInt const&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6BigIntE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6BigIntE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6BigIntE] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6ObjectE
// facebook::hermes::HermesRuntime::getUniqueID(facebook::jsi::Object const&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6ObjectE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6ObjectE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6ObjectE] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6StringE
// facebook::hermes::HermesRuntime::getUniqueID(facebook::jsi::String const&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6StringE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6StringE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6StringE] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6SymbolE
// facebook::hermes::HermesRuntime::getUniqueID(facebook::jsi::Symbol const&) const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6SymbolE"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6SymbolE] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime11getUniqueIDERKNS_3jsi6SymbolE] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime14getGCExecTraceEv
// facebook::hermes::HermesRuntime::getGCExecTrace() const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime14getGCExecTraceEv"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime14getGCExecTraceEv] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime14getGCExecTraceEv] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime18getVMRuntimeUnsafeEv
// facebook::hermes::HermesRuntime::getVMRuntimeUnsafe() const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime18getVMRuntimeUnsafeEv"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime18getVMRuntimeUnsafeEv] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime18getVMRuntimeUnsafeEv] returned:', retval);
  }
});

// _ZNK8facebook6hermes13HermesRuntime23rootsListLengthForTestsEv
// facebook::hermes::HermesRuntime::rootsListLengthForTests() const
Interceptor.attach(mod.getExportByName("_ZNK8facebook6hermes13HermesRuntime23rootsListLengthForTestsEv"), {
  onEnter(args) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime23rootsListLengthForTestsEv] called');
  },
  onLeave(retval) {
    console.log('[_ZNK8facebook6hermes13HermesRuntime23rootsListLengthForTestsEv] returned:', retval);
  }
});

// _ZNKR8facebook3jsi5Value8asBigIntERNS0_7RuntimeE
// facebook::jsi::Value::asBigInt(facebook::jsi::Runtime&) const &
Interceptor.attach(mod.getExportByName("_ZNKR8facebook3jsi5Value8asBigIntERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNKR8facebook3jsi5Value8asBigIntERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNKR8facebook3jsi5Value8asBigIntERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNKR8facebook3jsi5Value8asObjectERNS0_7RuntimeE
// facebook::jsi::Value::asObject(facebook::jsi::Runtime&) const &
/*
Interceptor.attach(mod.getExportByName("_ZNKR8facebook3jsi5Value8asObjectERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNKR8facebook3jsi5Value8asObjectERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNKR8facebook3jsi5Value8asObjectERNS0_7RuntimeE] returned Object:', retval);
  }
});
*/

// _ZNKR8facebook3jsi5Value8asStringERNS0_7RuntimeE
// facebook::jsi::Value::asString(facebook::jsi::Runtime&) const &
Interceptor.attach(mod.getExportByName("_ZNKR8facebook3jsi5Value8asStringERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNKR8facebook3jsi5Value8asStringERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNKR8facebook3jsi5Value8asStringERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNKR8facebook3jsi5Value8asSymbolERNS0_7RuntimeE
// facebook::jsi::Value::asSymbol(facebook::jsi::Runtime&) const &
Interceptor.attach(mod.getExportByName("_ZNKR8facebook3jsi5Value8asSymbolERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNKR8facebook3jsi5Value8asSymbolERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNKR8facebook3jsi5Value8asSymbolERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNKR8facebook3jsi6Object10asFunctionERNS0_7RuntimeE
// facebook::jsi::Object::asFunction(facebook::jsi::Runtime&) const &
Interceptor.attach(mod.getExportByName("_ZNKR8facebook3jsi6Object10asFunctionERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNKR8facebook3jsi6Object10asFunctionERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNKR8facebook3jsi6Object10asFunctionERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNKR8facebook3jsi6Object7asArrayERNS0_7RuntimeE
// facebook::jsi::Object::asArray(facebook::jsi::Runtime&) const &
Interceptor.attach(mod.getExportByName("_ZNKR8facebook3jsi6Object7asArrayERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNKR8facebook3jsi6Object7asArrayERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNKR8facebook3jsi6Object7asArrayERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNO8facebook3jsi5Value8asBigIntERNS0_7RuntimeE
// facebook::jsi::Value::asBigInt(facebook::jsi::Runtime&) &&
Interceptor.attach(mod.getExportByName("_ZNO8facebook3jsi5Value8asBigIntERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNO8facebook3jsi5Value8asBigIntERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNO8facebook3jsi5Value8asBigIntERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNO8facebook3jsi5Value8asObjectERNS0_7RuntimeE
// facebook::jsi::Value::asObject(facebook::jsi::Runtime&) &&
Interceptor.attach(mod.getExportByName("_ZNO8facebook3jsi5Value8asObjectERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNO8facebook3jsi5Value8asObjectERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNO8facebook3jsi5Value8asObjectERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNO8facebook3jsi5Value8asStringERNS0_7RuntimeE
// facebook::jsi::Value::asString(facebook::jsi::Runtime&) &&
Interceptor.attach(mod.getExportByName("_ZNO8facebook3jsi5Value8asStringERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNO8facebook3jsi5Value8asStringERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNO8facebook3jsi5Value8asStringERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNO8facebook3jsi5Value8asSymbolERNS0_7RuntimeE
// facebook::jsi::Value::asSymbol(facebook::jsi::Runtime&) &&
Interceptor.attach(mod.getExportByName("_ZNO8facebook3jsi5Value8asSymbolERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNO8facebook3jsi5Value8asSymbolERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNO8facebook3jsi5Value8asSymbolERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNO8facebook3jsi6Object10asFunctionERNS0_7RuntimeE
// facebook::jsi::Object::asFunction(facebook::jsi::Runtime&) &&
Interceptor.attach(mod.getExportByName("_ZNO8facebook3jsi6Object10asFunctionERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNO8facebook3jsi6Object10asFunctionERNS0_7RuntimeE] called');
    var pointer = ptr(args[0]).readPointer();
    console.log('[_ZNO8facebook3jsi6Object10asFunctionERNS0_7RuntimeE] arg0:', args[0]);
    console.log('[_ZNO8facebook3jsi6Object10asFunctionERNS0_7RuntimeE] arg1:', args[1]);
    var pointer2 = ptr(pointer).readPointer();
    console.log('[_ZNO8facebook3jsi6Object10asFunctionERNS0_7RuntimeE] pointer:', pointer);

    logJsiValueInstance("[_ZNO8facebook3jsi6Object10asFunctionERNS0_7RuntimeE] pointer2", pointer2);

  },
  onLeave(retval) {
    console.log('[_ZNO8facebook3jsi6Object10asFunctionERNS0_7RuntimeE] returned:', retval);
  }
});

// _ZNO8facebook3jsi6Object7asArrayERNS0_7RuntimeE
// facebook::jsi::Object::asArray(facebook::jsi::Runtime&) &&
Interceptor.attach(mod.getExportByName("_ZNO8facebook3jsi6Object7asArrayERNS0_7RuntimeE"), {
  onEnter(args) {
    console.log('[_ZNO8facebook3jsi6Object7asArrayERNS0_7RuntimeE] called');
  },
  onLeave(retval) {
    console.log('[_ZNO8facebook3jsi6Object7asArrayERNS0_7RuntimeE] returned:', retval);
  }
});
