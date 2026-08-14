// embed.js — paste this on any website:
//
// Basic (uses default Safari Funded colors):
// <script src="https://support-ai-lac.vercel.app/widget/embed.js"></script>
//
// Customized for a client's own brand:
// <script src="https://support-ai-lac.vercel.app/widget/embed.js"
//         data-business-name="Acme Corp"
//         data-primary-color="#0B0E1A"
//         data-accent-color="#C9A227">
// </script>

(function () {
  // Read this <script> tag's own attributes, so each client can set their own branding
  // without ever touching the widget's code.
  var thisScript = document.currentScript;
  var businessName = thisScript.getAttribute('data-business-name') || 'Safari Funded';
  var primaryColor = thisScript.getAttribute('data-primary-color') || '';
  var accentColor = thisScript.getAttribute('data-accent-color') || '';

  var params = new URLSearchParams();
  params.set('name', businessName);
  if (primaryColor) params.set('primary', primaryColor);
  if (accentColor) params.set('accent', accentColor);

  var iframe = document.createElement('iframe');
  iframe.src = 'https://support-ai-lac.vercel.app/widget/chat.html?' + params.toString();
  iframe.title = businessName + ' Support Chat';
  iframe.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:70px;height:70px;' +
    'border:none;z-index:999999;background:transparent;' +
    'transition:width 0.2s ease, height 0.2s ease;';
  iframe.setAttribute('scrolling', 'no');
  document.body.appendChild(iframe);

  // Listen for the widget telling us to grow/shrink the iframe
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'supportflow-resize') {
      iframe.style.width = event.data.width;
      iframe.style.height = event.data.height;
    }
  });
})();
