// Editá SOLO este archivo para cambiar la fecha mostrada en el header.
window.LAST_UPDATE = "22/06/2026";

let cb = sessionStorage.getItem('mi_cache_buster_07092026');
if (!cb) {
  cb = new Date().getTime();
  sessionStorage.setItem('mi_cache_buster_07092026', cb);
}
window.CACHE_BUSTER = cb;

window.forceRefreshData = function() {
  sessionStorage.removeItem('mi_cache_buster_07092026');

  if (typeof window.clearDataCache === 'function') {
    window.clearDataCache().finally(() => window.location.reload());
  } else {
    window.location.reload();
  }
};
