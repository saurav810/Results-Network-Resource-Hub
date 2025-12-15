import React, { useId } from 'react';
import Button from './Button';

type Variant = 'no-results' | 'empty-catalog' | 'error';

interface Action {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  variant: Variant;
  title: string;
  description?: string;
  primaryAction: Action;
  secondaryAction?: Action;
}

/**
 * Reusable, accessible empty state component.
 * - purely presentational; no data or filtering logic here.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  // useId provides a stable unique id per component instance to satisfy aria-labelledby
  const id = useId();
  const headingId = `empty-${variant}-${id}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className="py-12 px-6 bg-white rounded-lg border border-slate-100 shadow-sm"
      role="region"
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 id={headingId} className="text-xl font-semibold text-[#051632] mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-600 mb-6">{description}</p>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button as="button" variant="secondary" onClick={primaryAction.onClick} className="font-semibold">
            {primaryAction.label}
          </Button>

          {secondaryAction && (
            <Button as="button" variant="tertiary" onClick={secondaryAction.onClick} className="font-semibold">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default EmptyState;
