import { createClientFromRequest } from 'npm:@base44/sdk@0.8.50';
import { getOrCreateWallet, COINS_PER_AD } from "../../shared/coins.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const wallet = await getOrCreateWallet(base44, user.id);
    const newBalance = (wallet.balance || 0) + COINS_PER_AD;
    await base44.asServiceRole.entities.UserWallet.update(wallet.id, { balance: newBalance });
    await base44.asServiceRole.entities.CoinTransaction.create({
      user_id: user.id,
      amount: COINS_PER_AD,
      type: "earned",
      reason: "ad_reward",
      ref_id: null
    });
    return Response.json({ success: true, balance: newBalance, awarded: COINS_PER_AD });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}