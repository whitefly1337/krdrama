const GUEST_UID_KEY = "krdrama_guest_uid";

export function getGuestUid() {
  let uid = localStorage.getItem(GUEST_UID_KEY);
  if (!uid) {
    uid = String(Math.floor(Math.random() * 900000000) + 100000000);
    localStorage.setItem(GUEST_UID_KEY, uid);
  }
  return uid;
}