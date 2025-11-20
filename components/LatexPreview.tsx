import React, { useEffect, useRef } from 'react';

// Declare global MathJax definition
declare global {
  interface Window {
    MathJax: {
      typesetPromise: (nodes: HTMLElement[]) => Promise<void>;
      startup: {
        promise: Promise<void>;
      };
    };
  }
}

interface LatexPreviewProps {
  latex: string;
  className?: string;
  mode?: 'math' | 'markdown'; 
}

export const LatexPreview: React.FC<LatexPreviewProps> = ({ latex, className = '', mode = 'math' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // If MathJax isn't loaded yet or typesetPromise isn't available, just show raw text.
    if (!window.MathJax || !window.MathJax.typesetPromise) {
        container.textContent = latex;
        return;
    }

    let isCancelled = false;

    const render = async () => {
      try {
        // 1. Set Content
        // We use textContent to insert the raw string. 
        // For 'math' mode, we wrap in $$ to enforce display math.
        // For 'markdown', we assume the user supplies their own delimiters ($..$ or $$..$$) or text.
        
        if (mode === 'math') {
             // Wrap in display math delimiters for "Math Mode" (Practice Cards)
             // This ensures it renders as a centered block equation
             container.textContent = `$$ ${latex} $$`;
        } else {
             // Markdown mode (Playground): User provides delimiters
             container.textContent = latex;
        }

        // 2. Typeset
        // typesetPromise scans the element, converts TeX to HTML, 
        // AND ensures the necessary CSS is injected into the document.
        await window.MathJax.typesetPromise([container]);

        if (isCancelled) return;

        // 3. Cleanup/Styling
        // Remove outlines that MathJax sometimes adds for accessibility which can look ugly in previews
        const mjx = container.querySelector('mjx-container');
        if (mjx) {
            mjx.removeAttribute('tabindex');
            mjx.style.outline = 'none';
        }

      } catch (e) {
        console.warn("MathJax Render Error", e);
        if (!isCancelled && container) {
             container.classList.add('text-red-500', 'text-xs', 'font-mono');
             container.textContent = "Error rendering LaTeX";
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [latex, mode]);

  // Layout classes:
  // 'math' mode: Flex centered (standard for equation cards)
  // 'markdown' mode: Block with text wrapping (standard for document preview)
  const layoutClasses = mode === 'math' 
    ? 'flex justify-center items-center overflow-x-auto overflow-y-hidden min-h-[2rem]' 
    : 'block w-full whitespace-pre-wrap break-words';

  return (
    <div 
      ref={containerRef} 
      className={`latex-output ${layoutClasses} ${className}`} 
    />
  );
};
