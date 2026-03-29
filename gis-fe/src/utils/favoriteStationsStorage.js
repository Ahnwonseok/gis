const STORAGE_KEY = 'gis-favorite-stations-v1';

function normalizeId(id) {
  return id == null ? '' : String(id);
}

export function getFavoriteStations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && x.stationID != null && x.stationID !== '');
  } catch {
    return [];
  }
}

export function isFavoriteStation(stationID) {
  if (stationID == null || stationID === '') return false;
  const id = normalizeId(stationID);
  return getFavoriteStations().some((x) => normalizeId(x.stationID) === id);
}

export function addFavoriteStation({ stationID, stationName, direction }) {
  if (stationID == null || stationID === '') return false;
  const id = normalizeId(stationID);
  const others = getFavoriteStations().filter((x) => normalizeId(x.stationID) !== id);
  const next = [
    {
      stationID,
      stationName: stationName || '정류장',
      direction: direction || '',
      addedAt: Date.now(),
    },
    ...others,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return true;
}

export function removeFavoriteStation(stationID) {
  if (stationID == null || stationID === '') return;
  const id = normalizeId(stationID);
  const next = getFavoriteStations().filter((x) => normalizeId(x.stationID) !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** @returns {boolean} true if now favorited */
export function toggleFavoriteStation({ stationID, stationName, direction }) {
  if (stationID == null || stationID === '') return false;
  if (isFavoriteStation(stationID)) {
    removeFavoriteStation(stationID);
    return false;
  }
  addFavoriteStation({ stationID, stationName, direction });
  return true;
}
