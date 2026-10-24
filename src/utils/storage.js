import { DEFAULT_CIRCLES } from "../data/defaultCircles.js";

const STORAGE_KEY = "gp_circles_v2";
const ACTIVE_ID_KEY = "gp_active_circle_id";

export function loadCircles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveCircles(DEFAULT_CIRCLES);
      return DEFAULT_CIRCLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CIRCLES;
  } catch (e) {
    console.error("Failed to load circles from storage", e);
    return DEFAULT_CIRCLES;
  }
}

export function saveCircles(circles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(circles));
  } catch (e) {
    console.error("Failed to save circles", e);
  }
}

export function getActiveCircle() {
  const circles = loadCircles();

  // 1. Check if URL contains encoded circle data ?data=...
  const urlParams = new URLSearchParams(window.location.search);
  const dataParam = urlParams.get("data");
  if (dataParam) {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(dataParam))));
      if (decoded && decoded.id && decoded.name) {
        // Upsert into local storage if not present
        const existingIdx = circles.findIndex((c) => c.id === decoded.id);
        if (existingIdx >= 0) {
          circles[existingIdx] = decoded;
        } else {
          circles.unshift(decoded);
        }
        saveCircles(circles);
        setActiveCircleId(decoded.id);
        return decoded;
      }
    } catch (err) {
      console.warn("Invalid data in URL query param", err);
    }
  }

  // 2. Check if URL contains ?circle=<id>
  const circleIdParam = urlParams.get("circle");
  if (circleIdParam) {
    const found = circles.find((c) => c.id === circleIdParam);
    if (found) {
      setActiveCircleId(found.id);
      return found;
    }
  }

  // 3. Check active circle id in localStorage
  const savedActiveId = localStorage.getItem(ACTIVE_ID_KEY);
  if (savedActiveId) {
    const found = circles.find((c) => c.id === savedActiveId);
    if (found) return found;
  }

  return circles[0];
}

export function setActiveCircleId(id) {
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

export function updateCircle(updatedCircle) {
  const circles = loadCircles();
  const idx = circles.findIndex((c) => c.id === updatedCircle.id);
  if (idx >= 0) {
    circles[idx] = updatedCircle;
  } else {
    circles.unshift(updatedCircle);
  }
  saveCircles(circles);
}

export function getShareableUrl(circle) {
  const base = window.location.origin + window.location.pathname;
  try {
    const jsonStr = JSON.stringify(circle);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return `${base}?data=${b64}`;
  } catch (e) {
    return `${base}?circle=${encodeURIComponent(circle.id)}`;
  }
}
