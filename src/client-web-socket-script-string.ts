export function clientWebSocketScriptString(
	websocketUrlWithoutScheme: string,
	refeshEvent = "refresh",
) {
	return `
    <!-- HMR Client WebSocket script -->
    <script>
      window.addEventListener('load', () => {
        const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(\`\${ scheme }://${websocketUrlWithoutScheme}\`);
        ws.addEventListener('open', () => {
          // Send current pathname to server
          ws.send(window.location.pathname);
        });
        ws.addEventListener('${refeshEvent}', (event) => {
          // reload only if all or the current pathname is received
          if (event.data === window.location.pathname || event.data === 'all')
            window.location.reload();
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
