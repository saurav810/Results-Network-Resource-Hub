import React from 'react';

type Variant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps {
  variant?: Variant;
  as?: 'button' | 'a';
  href?: string;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#0053b4] text-white hover:bg-[#003B71] focus-visible:ring-[#0053b4] shadow-md hover:shadow-lg',
  secondary:
    'bg-white text-[#0053b4] border border-[#cfe6ff] hover:bg-[#f8fbff] focus-visible:ring-[#0053b4] shadow-sm',
  tertiary:
    'bg-transparent text-[#0053b4] underline-offset-2 hover:text-[#003B71] hover:underline focus-visible:ring-[#0053b4]'
};

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-shadow transition-colors';

const sizeClasses = 'px-6 py-3 text-base';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  as = 'button',
  href,
  disabled,
  className = '',
  children,
  ...rest
}) => {
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
