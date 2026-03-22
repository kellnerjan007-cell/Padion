/**
 * EAS Build post-install hook.
 * Patches RCTTurboModule.mm to fix crash on iOS 26.
 *
 * Root cause: When a native module throws an NSException in a void async method,
 * React Native calls convertNSExceptionToJSError() which accesses
 * exception.callStackSymbols. On iOS 26, some call stack return addresses point
 * to unmapped memory, causing backtrace_symbols/dladdr to SIGSEGV.
 *
 * Fix: Suppress the ObjC exception in performVoidMethodInvocation instead of
 * trying to convert it. Void async methods have no JS callback to propagate
 * errors to anyway, so suppression is safe.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native',
  'ReactCommon',
  'react',
  'nativemodule',
  'core',
  'platform',
  'ios',
  'ReactCommon',
  'RCTTurboModule.mm'
);

if (!fs.existsSync(filePath)) {
  console.log('[patch-turbomodule] RCTTurboModule.mm not found — skipping patch.');
  console.log('[patch-turbomodule] (This is expected when using pre-built React Native)');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');

// Check if already patched
if (content.includes('iOS 26 fix')) {
  console.log('[patch-turbomodule] Patch already applied — skipping.');
  process.exit(0);
}

// Target: the catch block in performVoidMethodInvocation ONLY.
// Note: performMethodInvocation has "if (isSync)" before the throw — this one does not.
const OLD = `    } @catch (NSException *exception) {
      throw convertNSExceptionToJSError(runtime, exception, std::string{moduleName}, methodNameStr);
    } @finally {
      [retainedObjectsForInvocation removeAllObjects];
    }`;

const NEW = `    } @catch (NSException *exception) {
      // iOS 26 fix: exception.callStackSymbols triggers backtrace_symbols/dladdr
      // which crashes when stack frames reference unmapped memory regions.
      // Void async methods have no JS completion handler, so suppress safely.
      (void)exception;
    } @finally {
      [retainedObjectsForInvocation removeAllObjects];
    }`;

if (!content.includes(OLD)) {
  console.log('[patch-turbomodule] WARNING: Patch target not found — file may have changed.');
  console.log('[patch-turbomodule] Build continues without patch.');
  process.exit(0);
}

content = content.replace(OLD, NEW);
fs.writeFileSync(filePath, content, 'utf8');
console.log('[patch-turbomodule] Successfully patched RCTTurboModule.mm for iOS 26 compatibility.');
