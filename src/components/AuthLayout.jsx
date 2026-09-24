import React from "react";
import { ChevronLeft } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, onBack, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="absolute left-4 top-[calc(env(safe-area-inset-top)+1rem)] text-foreground"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
