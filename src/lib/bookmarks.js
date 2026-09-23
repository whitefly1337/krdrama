import { base44 } from "@/api/base44Client";

const GUEST_BOOKMARKS_KEY = "krdrama_guest_bookmarks";

function getGuestBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_BOOKMARKS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setGuestBookmarks(ids) {
  localStorage.setItem(GUEST_BOOKMARKS_KEY, JSON.stringify(ids));
}

export async function isBookmarked(seriesId) {
  if (!seriesId) return false;
  try {
    const me = await base44.auth.me();
    const libs = await base44.entities.UserLibrary.filter({ user_id: me.id, series_id: seriesId });
    return libs.length > 0;
  } catch {
    return getGuestBookmarks().includes(seriesId);
  }
}

export async function toggleBookmarkUtil(seriesId) {
  if (!seriesId) return false;
  try {
    const me = await base44.auth.me();
    const libs = await base44.entities.UserLibrary.filter({ user_id: me.id, series_id: seriesId });
    if (libs.length > 0) {
      await base44.entities.UserLibrary.deleteMany({ user_id: me.id, series_id: seriesId });
      return false;
    }
    await base44.entities.UserLibrary.create({ user_id: me.id, series_id: seriesId });
    return true;
  } catch {
    const ids = getGuestBookmarks();
    const idx = ids.indexOf(seriesId);
    if (idx >= 0) {
      ids.splice(idx, 1);
      setGuestBookmarks(ids);
      return false;
    }
    ids.push(seriesId);
    setGuestBookmarks(ids);
    return true;
  }
}

export async function getBookmarkedSeriesIds() {
  try {
    const me = await base44.auth.me();
    const libs = await base44.entities.UserLibrary.filter({ user_id: me.id });
    return libs.map((l) => l.series_id);
  } catch {
    return getGuestBookmarks();
  }
}