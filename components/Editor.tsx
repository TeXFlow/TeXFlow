import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { checkMacroTrigger, processReplacement } from '../services/macroEngine';
import { Macro } from '../types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  macros: Macro[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  forceMath?: boolean;
}

interface HistoryState {
    value: string;
    cursor: number;
}

const getEnclosingMatrixEnvironment = (text: string, cursor: number): string | null => {
    const before = text.substring(0, cursor);
    const multilineEnvs = [
        'pmatrix', 'bmatrix', 'Bmatrix', 'vmatrix', 'Vmatrix', 'matrix', 
        'cases', 'align', 'align*', 'array', 'gather', 'gather*', 'split'
    ];
    
    const tagRegex = /\\(begin|end)\{([a-zA-Z0-9*]+)\}/g;
    const matches = [];
    let match;
    while ((match = tagRegex.exec(before)) !== null) {
        matches.push({
            type: match[1],
            env: match[2],
            index: match.index
        });
    }

    const stack: string[] = [];
    for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        if (m.type === 'end') {
            stack.push(m.env);
        } else {
            if (stack.length > 0 && stack[stack.length - 1] === m.env) {
                stack.pop();
            } else {
                if (multilineEnvs.includes(m.env)) {
                    return m.env;
                }
                return null; 
            }
        }
    }

    return null;
};

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  macros, 
  placeholder = "Type LaTeX here...", 
  className = "",
  autoFocus = false,
  forceMath = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Selection Persistence (Stores start and end to preserve highlights)
  const pendingSelectionRef = useRef<{ start: number, end: number } | null>(null);

  // Snippet State
  const snippetTabStops = useRef<number[]>([]);

  // History Management
  const historyRef = useRef<HistoryState[]>([{ value, cursor: 0 }]);
  const historyPtrRef = useRef(0);
  const lastTypeTime = useRef(0);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [autoFocus]);

  useLayoutEffect(() => {
    if (pendingSelectionRef.current !== null && textareaRef.current) {
      textareaRef.current.setSelectionRange(pendingSelectionRef.current.start, pendingSelectionRef.current.end);
      pendingSelectionRef.current = null;
    }
  }, [value]);

  const setPendingSelection = (start: number, end: number = start) => {
      pendingSelectionRef.current = { start, end };
  };

  const saveHistory = (newValue: string, newCursor: number, immediate = false) => {
      const now = Date.now();
      const state: HistoryState = { value: newValue, cursor: newCursor };

      if (historyPtrRef.current === historyRef.current.length - 1) {
          if (immediate || now - lastTypeTime.current > 1000) {
               historyRef.current.push(state);
               historyPtrRef.current++;
          } else {
               historyRef.current[historyPtrRef.current] = state;
          }
      } else {
          historyRef.current = historyRef.current.slice(0, historyPtrRef.current + 1);
          historyRef.current.push(state);
          historyPtrRef.current++;
      }
      lastTypeTime.current = now;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart;

    // Calculate diff for tabstops shift
    const diff = newValue.length - value.length;
    
    // Update pending tabstops if we are just typing
    if (snippetTabStops.current.length > 0) {
        // Simple heuristic: shift all tabstops that are AFTER the cursor
        // Note: e.target.selectionStart is where the cursor IS, which is after the inserted char
        const insertionPoint = newCursorPos - diff; 
        if (diff !== 0) {
            snippetTabStops.current = snippetTabStops.current.map(pos => {
                if (pos >= insertionPoint) return pos + diff;
                return pos;
            });
            // Filter out negative positions or invalid ones if massive delete
            snippetTabStops.current = snippetTabStops.current.filter(pos => pos <= newValue.length);
        }
    }

    // Trigger macros on input
    if (newValue.length > value.length) {
       const macroResult = checkMacroTrigger(newValue, newCursorPos, macros, forceMath);
       
       if (macroResult) {
         // Save history
         saveHistory(macroResult.text, macroResult.cursorIndex, true);
         onChange(macroResult.text);
         
         setPendingSelection(macroResult.cursorIndex);
         
         // Set active tabstops
         snippetTabStops.current = macroResult.tabStops;
         return;
       }
    }

    saveHistory(newValue, newCursorPos);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // --- UNDO / REDO ---
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        let newState: HistoryState | null = null;
        if (e.shiftKey) {
            if (historyPtrRef.current < historyRef.current.length - 1) {
                historyPtrRef.current++;
                newState = historyRef.current[historyPtrRef.current];
            }
        } else {
            if (historyPtrRef.current > 0) {
                historyPtrRef.current--;
                newState = historyRef.current[historyPtrRef.current];
            }
        }
        if (newState) {
            onChange(newState.value);
            setPendingSelection(newState.cursor);
            snippetTabStops.current = []; // Clear tabstops on undo
        }
        return;
    }

    // --- MOVE LINE UP/DOWN (Alt + Arrows) ---
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        
        const lines = value.split('\n');
        const startLineIdx = value.substring(0, start).split('\n').length - 1;
        let endLineIdx = value.substring(0, end).split('\n').length - 1;
        
        // Adjust if selection ends at the start of a newline (implies user selected the whole line including newline)
        if (end > start && value[end - 1] === '\n') {
             endLineIdx--;
        }

        if (e.key === 'ArrowUp') {
             if (startLineIdx > 0) {
                 const lineAbove = lines[startLineIdx - 1];
                 // Extract the group of lines to move
                 const movingLines = lines.slice(startLineIdx, endLineIdx + 1);
                 
                 // Remove them from original spot
                 lines.splice(startLineIdx, movingLines.length);
                 
                 // Insert them one index earlier
                 lines.splice(startLineIdx - 1, 0, ...movingLines);
                 
                 const newValue = lines.join('\n');
                 const shift = -(lineAbove.length + 1); // +1 for newline char
                 
                 saveHistory(newValue, start + shift, true); 
                 onChange(newValue);
                 
                 setPendingSelection(start + shift, end + shift);
             }
        } else if (e.key === 'ArrowDown') {
             if (endLineIdx < lines.length - 1) {
                 const lineBelow = lines[endLineIdx + 1];
                 const movingLines = lines.slice(startLineIdx, endLineIdx + 1);
                 
                 lines.splice(startLineIdx, movingLines.length);
                 lines.splice(startLineIdx + 1, 0, ...movingLines);
                 
                 const newValue = lines.join('\n');
                 const shift = lineBelow.length + 1;
                 
                 saveHistory(newValue, start + shift, true);
                 onChange(newValue);
                 
                 setPendingSelection(start + shift, end + shift);
             }
        }
        return;
    }

    // --- TAB KEY ---
    if (e.key === 'Tab') {
        e.preventDefault();

        // 1. Active Snippet Tabstops
        if (snippetTabStops.current.length > 0) {
            const nextStop = snippetTabStops.current.shift();
            if (nextStop !== undefined && nextStop <= value.length) {
                textarea.setSelectionRange(nextStop, nextStop);
                return;
            }
        }

        // 2. Matrix Environment Check
        const matrixEnv = getEnclosingMatrixEnvironment(value, start);
        if (matrixEnv) {
             const insertStr = " & ";
             const newValue = value.substring(0, start) + insertStr + value.substring(end);
             const newCursor = start + insertStr.length;
             saveHistory(newValue, newCursor, true);
             onChange(newValue);
             setPendingSelection(newCursor);
             return;
        }

        // 3. "Tab Out" (Skip closing delimiters)
        if (start === end && start < value.length) {
            const nextChar = value[start];
            const closingDelimiters = ['}', ']', ')', '$', '>', '"', "'"];
            if (closingDelimiters.includes(nextChar)) {
                textarea.setSelectionRange(start + 1, start + 1);
                return;
            }
        }

        // 4. Indentation
        const indent = "  "; 
        const newValue = value.substring(0, start) + indent + value.substring(end);
        const newCursor = start + indent.length;
        saveHistory(newValue, newCursor, true);
        onChange(newValue);
        setPendingSelection(newCursor);
        return;
    }
    
    // --- ESCAPE (Cancel Snippet) ---
    if (e.key === 'Escape') {
        snippetTabStops.current = [];
    }

    // --- ENTER ---
    if (e.key === 'Enter') {
        e.preventDefault();
        const textBefore = value.substring(0, start);
        const lines = textBefore.split('\n');
        const lastLine = lines[lines.length - 1] || '';
        const indentMatch = lastLine.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';
        
        let insertText = '\n' + indent;
        const matrixEnv = getEnclosingMatrixEnvironment(value, start);
        if (matrixEnv) {
            const trimmedLine = lastLine.trim();
            const shouldAddBackslash = 
                trimmedLine.length > 0 && 
                !trimmedLine.startsWith('\\begin') && 
                !trimmedLine.startsWith('\\end') && 
                !trimmedLine.endsWith('\\\\') && 
                !trimmedLine.endsWith('\\');

            if (shouldAddBackslash) {
                 insertText = ' \\\\\n' + indent;
            }
        }
        
        const newValue = value.substring(0, start) + insertText + value.substring(end);
        const newCursor = start + insertText.length;
        saveHistory(newValue, newCursor, true);
        onChange(newValue);
        setPendingSelection(newCursor);
        return;
    }

    // --- WORD DELETE ---
    if (e.key === 'Backspace' && (e.ctrlKey || e.altKey || e.metaKey)) {
        e.preventDefault();
        if (start !== end) {
            const newValue = value.substring(0, start) + value.substring(end);
            saveHistory(newValue, start, true);
            onChange(newValue);
            setPendingSelection(start);
            return;
        }
        const textBefore = value.substring(0, start);
        if (textBefore.length === 0) return;
        const match = textBefore.match(/(\s+|\w+|[^\w\s]+)$/);
        let deleteAmount = 1;
        if (match) deleteAmount = match[0].length;
        const newValue = value.substring(0, start - deleteAmount) + value.substring(end);
        const newCursor = start - deleteAmount;
        saveHistory(newValue, newCursor, true);
        onChange(newValue);
        setPendingSelection(newCursor);
        return;
    }

    // --- AUTO-PAIRING ---
    const isModifier = e.ctrlKey || e.altKey || e.metaKey;
    const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '$': '$' };
    
    if (!isModifier && pairs[e.key]) {
        e.preventDefault();
        const open = e.key;
        const close = pairs[open];
        
        if (start !== end) {
            const selection = value.substring(start, end);
            const newValue = value.substring(0, start) + open + selection + close + value.substring(end);
            const newCursor = start + 1 + selection.length;
            saveHistory(newValue, newCursor, true);
            onChange(newValue);
            setPendingSelection(newCursor);
        } else {
            const newValue = value.substring(0, start) + open + close + value.substring(end);
            const newCursor = start + 1;
            saveHistory(newValue, newCursor, true);
            onChange(newValue);
            setPendingSelection(newCursor);
        }
        return;
    }
    
    // --- OVERTYPE ---
    if (start === end && !isModifier) {
        const char = e.key;
        const nextChar = value[start];
        const closingDelimiters = [')', ']', '}', '"', "'", '$'];
        if (closingDelimiters.includes(char) && nextChar === char) {
             e.preventDefault();
             textarea.setSelectionRange(start + 1, start + 1);
             return;
        }
    }
    
    // --- BACKSPACE PAIR ---
    if (e.key === 'Backspace' && start === end && start > 0 && !isModifier) {
        const prev = value[start - 1];
        const next = value[start];
        const pairsRev: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '$': '$' };
        if (pairsRev[prev] === next) {
            e.preventDefault();
            const newValue = value.substring(0, start - 1) + value.substring(start + 1);
            const newCursor = start - 1;
            saveHistory(newValue, newCursor, true);
            onChange(newValue);
            setPendingSelection(newCursor);
            return;
        }
    }
    
    // --- VISUAL MACROS (Surround Selection) ---
    if (start !== end && !isModifier && e.key.length === 1) {
        const key = e.key;
        const visualMacro = macros.find(m => 
            m.trigger === key && 
            typeof m.replacement === 'string' && 
            m.replacement.includes('${VISUAL}')
        );
        
        if (visualMacro) {
            e.preventDefault();
            const selection = value.substring(start, end);
            // processReplacement now handles tabstops too
            const { text: replacementText, newCursor, tabStops } = processReplacement(visualMacro, [], selection);
            
            const newValue = value.substring(0, start) + replacementText + value.substring(end);
            
            // absolute positions
            const insertionStart = start;
            const absoluteCursor = insertionStart + newCursor;
            const absoluteTabStops = tabStops.map(rel => insertionStart + rel);

            saveHistory(newValue, absoluteCursor, true);
            onChange(newValue);
            setPendingSelection(absoluteCursor);
            snippetTabStops.current = absoluteTabStops;
            return;
        }
    }
  };

  return (
    <div className={`w-full h-full rounded-none md:rounded-lg overflow-hidden border border-slate-300 dark:border-[#333] focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-sm relative ${className}`}>
        <textarea
            ref={textareaRef}
            className="w-full h-full resize-none p-4 font-mono text-sm sm:text-base focus:outline-none bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-[#d4d4d4] selection:bg-[#add6ff] dark:selection:bg-[#264f78]"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            style={{
                fontFamily: "'Fira Code', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
                lineHeight: '1.6',
                tabSize: 4
            }}
        />
    </div>
  );
};
