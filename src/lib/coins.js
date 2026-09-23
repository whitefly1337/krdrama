import { getGuestUid } from "./guest";

export const COINS_PER_AD = 10;
export const COINS_PER_EPISODE = 50;
export const COINS_FIRST_ENTRY = 35;

const BALANCE_KEY = "krdrama_coin_balance";
const UNLOCKS_KEY = "krdrama_episode_unlocks";

function balKey() {
  return `${BALANCE_KEY}_${getGuestUid()}`;
}

function unlKey() {
  return `${UNLOCKS_KEY}_${getGuestUid()}`;
}

export function getBalance() {
  return parseInt(localStorage.getItem(balKey()) || "0", 10);
}

export function addCoins(amount) {
  const newBalance = getBalance() + amount;
  localStorage.setItem(balKey(), String(newBalance));
  return newBalance;
}

export function spendCoins(amount, episodeId) {
  if (getBalance() < amount) return { success: false, error: "Not enough coins" };
  const newBalance = addCoins(-amount);
  const unlocks = getUnlockedEpisodes();
  unlocks.add(episodeId);
  localStorage.setItem(unlKey(), JSON.stringify([...unlocks]));
  return { success: true, balance: newBalance };
}

export function getUnlockedEpisodes() {
  const raw = localStorage.getItem(unlKey());
  return new Set(raw ? JSON.parse(raw) : []);
}

export function isEpisodeUnlocked(episodeId) {
  return getUnlockedEpisodes().has(episodeId);
}