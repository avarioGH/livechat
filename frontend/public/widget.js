(function() {
  // Avario LiveChat Embed Script

  // 1. Check for configuration object
  if (!window.AvarioLiveChat || !window.AvarioLiveChat.siteId) {
    console.error('Avario LiveChat: Missing window.AvarioLiveChat.siteId configuration.');
    return;
  }

  const siteId = window.AvarioLiveChat.siteId;

  // 2. Determine the host URL dynamically based on where this script is loaded from
  let hostUrl = 'http://localhost:3000';
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.includes('widget.js')) {
      const url = new URL(scripts[i].src);
      hostUrl = url.origin;
      break;
    }
  }

  const widgetUrl = `${hostUrl}/widget?siteId=${siteId}`;

  // 3. Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = widgetUrl;
  iframe.id = 'avario-livechat-iframe';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '70px'; // initially closed
  iframe.style.height = '70px'; 
  iframe.style.border = 'none';
  iframe.style.zIndex = '2147483647'; // Max z-index
  iframe.style.pointerEvents = 'auto'; 
  iframe.style.backgroundColor = 'transparent';
  iframe.allowTransparency = 'true';
  iframe.style.display = 'block';
  iframe.style.borderRadius = '16px';
  iframe.style.boxShadow = 'none';

  // Responsive mobile behavior
  const applyMobileStyles = () => {
    if (window.innerWidth <= 480) {
      if (iframe.style.width === '100%') {
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.borderRadius = '0';
      }
    }
  };
  window.addEventListener('resize', applyMobileStyles);

  // Handle messages from the iframe
  window.addEventListener('message', (event) => {
    if (!event.origin.includes(hostUrl)) return;

    if (event.data.type === 'AVARIO_WIDGET_CLOSE') {
      iframe.style.width = '70px';
      iframe.style.height = '70px';
      iframe.style.boxShadow = 'none';
      iframe.style.bottom = '20px';
      iframe.style.right = '20px';
      iframe.style.borderRadius = '16px';
    } else if (event.data.type === 'AVARIO_WIDGET_OPEN') {
      if (window.innerWidth <= 480) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.borderRadius = '0';
      } else {
        iframe.style.width = '400px';
        iframe.style.height = '600px';
      }
      iframe.style.boxShadow = '0 10px 40px -10px rgba(0,0,0,0.3)';
    }
  });

  // Append to body
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    document.body.appendChild(iframe);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(iframe);
    });
  }

  // Provide JavaScript API as requested
  window.AvarioLiveChat.open = () => iframe.contentWindow.postMessage({ type: 'CMD_OPEN' }, '*');
  window.AvarioLiveChat.close = () => iframe.contentWindow.postMessage({ type: 'CMD_CLOSE' }, '*');
  window.AvarioLiveChat.identify = (user) => iframe.contentWindow.postMessage({ type: 'CMD_IDENTIFY', user }, '*');
})();
