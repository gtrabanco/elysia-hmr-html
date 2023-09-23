export function clientSSECode(
	hmrEndpoint: string,
	hmrEventName: string,
	allowRefreshFromAnotherWindow = false,
) {
	const hmrCode = /* html */ `
  <script type="module">
  (function() {
    let hmrSource = undefined;
    window.addEventListener('load', () => {
      hmrSource = new EventSource("${hmrEndpoint}");
      hmrSource.addEventListener("${hmrEventName}", (event) => {
        const data = JSON.parse(event.data);
        if(data === "*" || data === window.location.pathname) {
          window.location.reload()
        }
      });
    })

    window.addEventListener("unload", () => {
      if(hmrSource) hmrSource.close();
    });
  })()
  </script>
  `;
	if (!allowRefreshFromAnotherWindow) return hmrCode;

	const broadcastChannelCode = /* html */ `
  <script type="module">
  (function() {
    const channel = new BroadcastChannel("${hmrEventName}");
    channel.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if(data === "*" || data === window.location.pathname) {
        window.location.reload()
      }
    });
    window.addEventListener("unload", () => {
      channel.close();
    });
  })()
  </script>
  `;

	return hmrCode + broadcastChannelCode;
}
