const GUEST_UID_KEY = "krdrama_guest_uid";
const COINS_FIRST_ENTRY = 35;

export function getGuestUid() {
  let uid = localStorage.getItem(GUEST_UID_KEY);
  if (!uid) {
    uid = String(Math.floor(Math.random() * 900000000) + 100000000);
    localStorage.setItem(GUEST_UID_KEY, uid);
    // Award first-entry bonus tied to this UID
    localStorage.setItem(`krdrama_coin_balance_${uid}`, String(COINS_FIRST_ENTRY));
  }
  return uid;
}