export const COINS_PER_AD = 10;
export const COINS_PER_EPISODE = 50;

export async function getOrCreateWallet(base44, userId) {
  const wallets = await base44.asServiceRole.entities.UserWallet.filter({ user_id: userId });
  if (wallets.length > 0) return wallets[0];
  return await base44.asServiceRole.entities.UserWallet.create({ user_id: userId, balance: 0 });
}