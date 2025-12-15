import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  id?: string;
  children: React.ReactElement;
  prefer?: 'top-right' | 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ content, id, children }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const uid = useRef(id || `tooltip-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    if (visible) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible]);

  useEffect(() => {
    if (!visible || !triggerRef.current) return;
    const trig = triggerRef.current;
    const rect = trig.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    if (!tooltipEl) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ttRect = tooltipEl.getBoundingClientRect();

    // Preferred: top-right (align tooltip's right to trigger.right)
    let left = rect.right - ttRect.width;
    let top = rect.top - ttRect.height - 8;

    // If overflow left, shift right
    if (left < 8) left = Math.max(8, rect.left);
    // If off the right edge, shift left
    if (left + ttRect.width > vw - 8) left = vw - ttRect.width - 8;

    // If no space above, flip to below
    if (top < 8) {
      top = rect.bottom + 8;
    }

    // Keep inside viewport vertically
    if (top + ttRect.height > vh - 8) top = Math.max(8, vh - ttRect.height - 8);

    setPos({ left: Math.round(left + window.scrollX), top: Math.round(top + window.scrollY) });
  }, [visible]);

  // clone trigger and add handlers
  const child = React.cloneElement(children, {
    ref: (node: any) => { triggerRef.current = node; const { ref } = (children as any); if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; },
    onMouseEnter: (e: any) => {
      setVisible(true);
      if (children.props.onMouseEnter) children.props.onMouseEnter(e);
    },
    onMouseLeave: (e: any) => {
      // small timeout to allow moving to tooltip
      setTimeout(() => setVisible(false), 100);
      if (children.props.onMouseLeave) children.props.onMouseLeave(e);
    },
    onFocus: (e: any) => {
      setVisible(true);
      if (children.props.onFocus) children.props.onFocus(e);
    },
    onBlur: (e: any) => {
      setVisible(false);
      if (children.props.onBlur) children.props.onBlur(e);
    },
    'aria-describedby': uid.current,
  });

  return (
    <>
      {child}
      {typeof document !== 'undefined' && createPortal(
        <div
          id={uid.current}
          role="tooltip"
          ref={tooltipRef}
          className={`tooltip ${visible ? 'tooltip-visible' : ''}`}
          style={pos ? { position: 'absolute', left: pos.left, top: pos.top } : { position: 'absolute', left: -9999, top: -9999 }}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          tabIndex={-1}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
