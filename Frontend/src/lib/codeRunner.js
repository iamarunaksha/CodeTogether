// ================================================
// Frontend/src/lib/codeRunner.js
// Sandboxed JavaScript execution engine
// ================================================

/**
 * Execute JavaScript code inside a sandboxed iframe.
 *
 * @param {string} code - The user's JavaScript code to execute
 * @param {function} onOutput - Callback for each console output
 *   Called with: { type: 'log'|'error'|'warn'|'info', args: string[] }
 * @param {function} onComplete - Called when execution finishes
 * @param {number} timeout - Max execution time in ms (default 5000)
 * @returns {function} cleanup - Call this to abort execution
 */
export function executeCode(code, onOutput, onComplete, timeout = 5000) {
  // 1. BUILD the HTML document that will run inside the iframe.
  //    We intercept console.log/error/warn/info and forward them
  //    to the parent window via postMessage.
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>CodeTogether Runner</title></head>
    <body>
    <script>
      // Override console methods to send output to parent
      ['log', 'error', 'warn', 'info'].forEach(method => {
        const original = console[method];
        console[method] = (...args) => {
          parent.postMessage({
            type: 'console',
            method: method,
            args: args.map(arg => {
              try {
                if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
                return String(arg);
              } catch (e) {
                return String(arg);
              }
            })
          }, '*');
          original.apply(console, args);
        };
      });

      // Catch runtime errors (ReferenceError, TypeError, etc.)
      window.onerror = (message, source, lineno, colno, error) => {
        parent.postMessage({
          type: 'console',
          method: 'error',
          args: [error ? error.toString() : message]
        }, '*');
        return true;  // Prevent default error handling
      };

      // Catch unhandled promise rejections
      window.onunhandledrejection = (event) => {
        parent.postMessage({
          type: 'console',
          method: 'error',
          args: ['Unhandled Promise Rejection: ' + event.reason]
        }, '*');
      };

      // Signal that execution is complete
      try {
        ${code}
        parent.postMessage({ type: 'complete' }, '*');
      } catch (err) {
        parent.postMessage({
          type: 'console',
          method: 'error',
          args: [err.toString()]
        }, '*');
        parent.postMessage({ type: 'complete' }, '*');
      }
    </script>
    </body>
    </html>
  `;

  // 2. CREATE a Blob URL from the HTML string.
  //    A Blob is an in-memory "file". createObjectURL gives it a URL
  //    like blob:http://localhost:5173/abc-123 that the iframe can load.
  const blob = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  // 3. CREATE the sandboxed iframe.
  //    'allow-scripts' lets the iframe run JavaScript.
  //    WITHOUT 'allow-same-origin', it CANNOT access our page's
  //    cookies, localStorage, DOM, or anything else.
  const iframe = document.createElement('iframe');
  iframe.sandbox = 'allow-scripts';
  iframe.style.display = 'none';   // Invisible — it's just an execution engine
  iframe.src = blobUrl;
  document.body.appendChild(iframe);

  // 4. LISTEN for messages from the iframe
  const handleMessage = (event) => {
    // Security: Only accept messages from our blob URL
    if (event.source !== iframe.contentWindow) return;

    if (event.data.type === 'console') {
      onOutput({
        type: event.data.method,
        args: event.data.args,
      });
    } else if (event.data.type === 'complete') {
      cleanup();
      onComplete();
    }
  };

  window.addEventListener('message', handleMessage);

  // 5. TIMEOUT — kill the iframe if it runs too long (infinite loop protection)
  const timeoutId = setTimeout(() => {
    onOutput({
      type: 'error',
      args: ['⏱ Execution timed out after ' + (timeout / 1000) + 's (possible infinite loop)'],
    });
    cleanup();
    onComplete();
  }, timeout);

  // 6. CLEANUP function — removes everything
  function cleanup() {
    clearTimeout(timeoutId);
    window.removeEventListener('message', handleMessage);
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    URL.revokeObjectURL(blobUrl);
  }

  // Return the cleanup function so the caller can abort if needed
  return cleanup;
}