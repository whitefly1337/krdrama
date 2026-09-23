import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-600 mb-4 shadow-lg shadow-rose-600/20">
            <Icon className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-zinc-400 mt-1.5 text-sm">{subtitle}</p>}
        </div>
        <div className="bg-zinc-900/60 rounded-2xl border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-zinc-400 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}