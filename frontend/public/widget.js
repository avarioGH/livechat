(function() {
  // Avario LiveChat Embed Script
  const scriptTag = document.currentScript;
  const tenantId = scriptTag.getAttribute('data-tenant-id');

  if (!tenantId) {
    console.error('Avario LiveChat: Missing data-tenant-id attribute on script tag.');
    return;
  }

  // Define the hosted widget URL (change this to production URL later)
  const widgetUrl = `http://localhost:3000/widget?tenantId=${tenantId}`;

  // Create an iframe to hold the Next.js widget app
  const iframe = document.createElement('iframe');
  iframe.src = widgetUrl;
  iframe.style.position = 'fixed';
  iframe.style.bottom = '0';
  iframe.style.right = '0';
  iframe.style.width = '400px';
  iframe.style.height = '600px'; // Make it large enough for the chat window
  iframe.style.border = 'none';
  iframe.style.zIndex = '999999';
  iframe.style.pointerEvents = 'none'; // Will handle pointer events inside via postMessage if needed, or just allow it.
  
  // To allow clicking through the transparent parts of the iframe, it's better to toggle width/height based on state
  // But for this simple implementation, we'll allow all pointer events and the widget background is transparent.
  iframe.style.pointerEvents = 'auto'; 
  iframe.style.backgroundColor = 'transparent';
  iframe.allowTransparency = 'true';

  // Append to body
  document.body.appendChild(iframe);
})();
