import React from "react";

export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] shadow-[var(--shadow-soft)] backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h2 className={`text-xl font-semibold tracking-tight text-[var(--text-primary)] ${className}`} {...props}>
      {children}
    </h2>
  );
};

export const CardDescription = ({ children, className = "", ...props }) => {
  return (
    <p className={`mt-1 text-sm text-[var(--text-secondary)] ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`px-4 pb-4 sm:px-6 sm:pb-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const InfoCard = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)]/70 p-3 ${className}`}
      {...props}
    >
      <div className="flex items-start gap-2">
        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-xs text-[var(--text-secondary)]">{children}</div>
      </div>
    </div>
  );
};
