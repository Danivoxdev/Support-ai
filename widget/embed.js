// embed.js — paste this on any website:
// <script src="https://support-ai-lac.vercel.app/widget/embed.js"></script>

(function () {
  var iframe = document.createElement('iframe');
  iframe.src = 'https://support-ai-lac.vercel.app/widget/chat.html';
  iframe.title = 'Safari Funded Support Chat';
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
