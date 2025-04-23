export function clientWebSocketScriptString(
	websocketUrlWithoutScheme: string,
	refeshEvent = "refresh",
) {
	return `
    <!-- HMR Client WebSocket script -->
    <script>
      window.addEventListener('load', () => {
        const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = new URL(\`${websocketUrlWithoutScheme}\`, window.location.origin);
        wsUrl.protocol = scheme;
        const ws = new WebSocket(wsUrl.href);
        ws.addEventListener('open', () => {
          // Send current pathname to server
          ws.send(window.location.pathname);
        });
        ws.addEventListener('message', (event) => {
          // reload only if all or the current pathname is received
          const { type, data } = JSON.parse(event.data ?? "{}");
          const isValidEventType = type === "${refeshEvent}";
          const isValidPath = data === '*' || data === window.location.pathname;
          if (isValidEventType && isValidPath) {
            console.log('[HMR] Reloading page...');
            window.location.reload();
          }
        });
        window.addEventListener("beforeunload", () => {
          if(ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        });
      });
    </script>
    <!-- HMR Client WebSocket script end -->`;
}
