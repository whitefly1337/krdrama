import { Link, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// UI guard only; the real protection is RLS (private.is_admin()) on the tables
// and storage buckets.
export default function AdminRoute() {
  const { isAdmin, profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-rose-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <ShieldAlert className="h-10 w-10 text-zinc-500" />
        <p className="text-lg font-semibold text-white">Admins only</p>
        <Link to="/" className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">Back to Home</Link>
      </div>
    );
  }

  return <Outlet />;
}
