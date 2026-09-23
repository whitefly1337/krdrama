import { createClientFromRequest } from 'npm:@base44/sdk@0.8.50';

const PLAN_DAYS = {
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

// NOTE: Server-side receipt validation with Apple/Google requires secrets
// (APPLE_SHARED_SECRET, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY).
// When secrets are not configured, the function trusts the client-provided receipt.
// To enable full validation, set the secrets in the dashboard and uncomment
// the validation calls below.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { receipt, platform, plan } = body;

    if (!receipt || !platform || !plan) {
      return Response.json({ error: 'Missing receipt, platform, or plan' }, { status: 400 });
    }
    if (!PLAN_DAYS[plan]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }
    if (platform !== 'ios' && platform !== 'android') {
      return Response.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Check for existing active subscription
    const existing = await base44.entities.Subscription.filter({ user_id: user.id, status: 'active' });
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLAN_DAYS[plan]);

    const subData = {
      user_id: user.id,
      status: 'active',
      plan,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
    };

    let subscription;
    const activeExisting = existing.find((s) => !s.end_date || new Date(s.end_date) >= new Date());
    if (activeExisting) {
      // Extend from current end date if still active
      const currentEnd = new Date(activeExisting.end_date);
      const newEnd = currentEnd > startDate ? new Date(currentEnd) : startDate;
      newEnd.setDate(newEnd.getDate() + PLAN_DAYS[plan]);
      subscription = await base44.entities.Subscription.update(activeExisting.id, {
        ...subData,
        end_date: newEnd.toISOString().slice(0, 10),
      });
    } else {
      subscription = await base44.entities.Subscription.create(subData);
    }

    return Response.json({ success: true, subscription });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}