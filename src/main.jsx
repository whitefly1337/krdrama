import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'
import { config } from '@/lib/config'

const root = ReactDOM.createRoot(document.getElementById('root'))

function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-200">
      <div className="max-w-md space-y-4">
        <h1 className="text-xl font-bold text-white">Supabase is not configured</h1>
        <p className="text-sm text-zinc-400">
          Create <code className="text-rose-300">.env.local</code> in the project root (copy
          <code className="text-rose-300"> .env.example</code>) and set:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-black/60 p-3 text-xs text-zinc-300">
{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
        <p className="text-sm text-zinc-400">Then restart <code className="text-rose-300">npm run dev</code>.</p>
      </div>
    </div>
  )
}

// Without Supabase keys the app can't start; show how to fix it instead of a
// blank page. App is loaded lazily so the Supabase client isn't created early.
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  root.render(<SetupRequired />)
} else {
  Promise.all([import('@/App.jsx'), import('@/lib/native')]).then(
    ([{ default: App }, { initNativeShell }]) => {
      initNativeShell()
      root.render(<App />)
    }
  )
}
