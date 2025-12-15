import React from 'react';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'neutral';

interface ButtonProps {
  variant?: Variant;
  as?: 'button' | 'a';
  href?: string;
  disabled?: boolean;
  className?: string;
  size?: 'default' | 'icon';
  [key: string]: any;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--focus-ring-color)] shadow-md hover:shadow-lg',
  secondary:
    'bg-white text-[var(--color-primary)] border border-[var(--color-secondary-border)] hover:bg-[var(--color-secondary-bg-hover)] focus-visible:ring-[var(--focus-ring-color)] shadow-sm',
  tertiary:
    'bg-transparent text-[var(--color-primary)] underline-offset-2 hover:text-[var(--color-primary-hover)] hover:underline focus-visible:ring-[var(--focus-ring-color)]'
  ,
  neutral:
    'bg-[#EBEEF4] text-[#050505] hover:bg-[#DDE3EE] hover:text-[#050505] hover:no-underline focus-visible:ring-[var(--focus-ring-color)] shadow-none font-semibold transition-colors'
};

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-shadow transition-colors';

const sizeMap: Record<string, string> = {
  default: 'px-6 py-3 text-base',
  icon: 'p-2 text-base'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  as = 'button',
  href,
  disabled,
  className = '',
  size = 'default',
  children,
  ...rest
}) => {
  const sizeClasses = sizeMap[size || 'default'] || sizeMap.default;
  const classes = `${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`;

  if (as === 'a') {
    return (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a href={href} className={classes} {...(rest as any)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...(rest as any)}>
      {children}
    </button>
  );
};

export default Button;
