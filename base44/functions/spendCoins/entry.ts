import { createClientFromRequest } from 'npm:@base44/sdk@0.8.50';
import { getOrCreateWallet, COINS_PER_EPISODE } from "../../shared/coins.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const episodeId = body.episode_id;
    if (!episodeId) return Response.json({ error: 'episode_id required' }, { status: 400 });

    // Check if already unlocked
    const existing = await base44.asServiceRole.entities.EpisodeUnlock.filter({ user_id: user.id, episode_id: episodeId });
    if (existing.length > 0) {
      return Response.json({ success: true, alreadyUnlocked: true });
    }

    const wallet = await getOrCreateWallet(base44, user.id);
    if ((wallet.balance || 0) < COINS_PER_EPISODE) {
      return Response.json({ success: false, error: 'Insufficient balance', balance: wallet.balance || 0, cost: COINS_PER_EPISODE });
    }

    const newBalance = (wallet.balance || 0) - COINS_PER_EPISODE;
    await base44.asServiceRole.entities.UserWallet.update(wallet.id, { balance: newBalance });
    await base44.asServiceRole.entities.EpisodeUnlock.create({ user_id: user.id, episode_id: episodeId });
    await base44.asServiceRole.entities.CoinTransaction.create({
      user_id: user.id,
      amount: COINS_PER_EPISODE,
      type: "spent",
      reason: "episode_unlock",
      ref_id: episodeId
    });
    return Response.json({ success: true, balance: newBalance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}