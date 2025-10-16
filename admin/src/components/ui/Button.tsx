import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  ...rest
}) => {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all';
  const styles: Record<string, string> = {
    primary:
      'btn-glow border border-[var(--border)] text-[var(--text)] bg-transparent hover:translate-y-[-1px]',
    secondary:
      'border border-[var(--border)]/70 bg-[var(--panel-2)] text-[var(--text)] hover:border-[var(--accent)]/50',
    ghost: 'text-[var(--text)] hover:bg-[var(--panel-2)]/50',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading && (
        <span className="inline-block h-4 w-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin"></span>
      )}
      <span>{children}</span>
    </button>
  );
};


