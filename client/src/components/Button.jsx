import React from "react";

export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  disabled = false, 
  onClick, 
  className = "",
  icon,
  type = "button",
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/30";
  
  const variants = {
    primary:
      "rounded-lg text-white shadow-sm bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-tertiary))] hover:shadow-[0_10px_35px_var(--glow-primary)] active:opacity-95",
    success:
      "rounded-full text-white shadow-sm bg-[linear-gradient(135deg,var(--accent-secondary),var(--accent-primary))] hover:shadow-[0_10px_35px_var(--glow-secondary)] active:opacity-95",
    danger:
      "rounded-full bg-[var(--danger)] text-white shadow-sm hover:opacity-95 active:opacity-90",
    ghost:
      "rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:shadow-sm hover:opacity-95",
    ghostDanger:
      "rounded-full bg-[var(--danger-soft)] text-[var(--danger)] hover:opacity-90",
  };
  
  const sizes = {
    sm: "px-3 py-2.5 text-xs sm:py-2 sm:text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm sm:text-base",
    icon: "p-2.5",
  };
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export const IconButton = ({ children, variant = "ghost", disabled = false, onClick, title, className = "", ...props }) => {
  return (
    <Button
      variant={variant}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`shrink-0 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};
