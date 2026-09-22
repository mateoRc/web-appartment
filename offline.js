(() => {
  const notice = document.getElementById("offline-notice");
  function updateConnection() {
    const offline = !navigator.onLine;
    notice.hidden = !offline;
    document.documentElement.toggleAttribute("data-offline", offline);
  }
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  updateConnection();
  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {
      // Online viewing still works when storage or service workers are disabled.
    });
  }
})();
