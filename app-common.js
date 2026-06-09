export function getRoomFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("room") || "default-room").trim();
}

export function buildPresenterLink(room) {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/[^/]*$/, "presenter.html");
  url.search = `?room=${encodeURIComponent(room)}`;
  return url.toString();
}

export function buildMobileLink(room) {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/[^/]*$/, "mobile.html");
  url.search = `?room=${encodeURIComponent(room)}`;
  return url.toString();
}

export function formatTime(ts = Date.now()) {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadLocal(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
