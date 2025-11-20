import { Macro } from '../types';

/**
 * Determines if the cursor is currently inside a LaTeX math environment.
 * Basic heuristic: Count unescaped $ symbols.
 */
const isInsideMath = (text: string, cursorIndex: number): boolean => {
    let dollarCount = 0;
    let escaped = false;

    for (let i = 0; i < cursorIndex; i++) {
        const char = text[i];
        if (char === '\\') {
            escaped = !escaped;
        } else {
            if (char === '$' && !escaped) {
                dollarCount++;
            }
            escaped = false;
        }
    }
    // Odd number of dollars means we are inside an open math block
    return dollarCount % 2 !== 0;
};

export interface MacroResult {
    text: string;
    newCursor: number; // Offset relative to the start of the inserted text
    tabStops: number[]; // Offsets relative to the start of the inserted text
}

/**
 * Processes replacement, handling $0 (cursor), [[n]] (captures), and function replacements.
 * Returns clean text (no markers) and tab stop locations.
 */
export const processReplacement = (
    macro: Macro, 
    captures: string[] = [],
    visualContent: string = ""
): MacroResult => {
    
    let raw = "";

    if (typeof macro.replacement === 'function') {
        try {
             raw = (macro.replacement as any)(captures); 
        } catch (e) {
            console.error("Error executing macro function", e);
            raw = "ERROR";
        }
    } else {
        raw = macro.replacement;
        // Handle Visual Content
        raw = raw.split('${VISUAL}').join(visualContent);
        // Replace capture groups [[0]], [[1]], etc.
        captures.forEach((capture, index) => {
            raw = raw.split(`[[${index}]]`).join(capture);
        });
    }

    // Parse Tab Stops: $0, $1, ... $9 and ${1:default}
    let clean = "";
    let tabStopsMap: Record<number, number> = {}; 
    let finalCursorOffset = -1;
    
    let i = 0;
    while (i < raw.length) {
        const char = raw[i];
        
        if (char === '\\') {
            const next = raw[i+1] || "";
            
            // Only consume the backslash if it is escaping a special snippet character
            if (['$', '}', '\\'].includes(next)) {
                clean += next;
                i += 2;
                continue;
            } else {
                // Otherwise, treat the backslash as a literal (e.g. \alpha, \int)
                clean += char;
                i++;
                continue;
            }
        }
        
        if (char === '$') {
            const sub = raw.slice(i);
            
            // Match ${1:default}
            const complexMatch = sub.match(/^\$\{(\d+):([^}]+)\}/);
            if (complexMatch) {
                const id = parseInt(complexMatch[1]);
                const content = complexMatch[2];
                tabStopsMap[id] = clean.length; // Position at start of inserted default text
                clean += content;
                i += complexMatch[0].length;
                continue;
            }
            
            // Match $1, $0 (Simple tabstops)
            const simpleMatch = sub.match(/^\$(\d+)/);
            if (simpleMatch) {
                const id = parseInt(simpleMatch[1]);
                if (id === 0) {
                    finalCursorOffset = clean.length;
                } else {
                    tabStopsMap[id] = clean.length;
                }
                i += simpleMatch[0].length;
                continue;
            }
        }
        
        clean += char;
        i++;
    }

    // Determine cursor and tabstops
    if (finalCursorOffset === -1) finalCursorOffset = clean.length;

    // Sort tabstops by ID (1, 2, 3...)
    const sortedStops = Object.keys(tabStopsMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map(id => tabStopsMap[id]);

    // If there are explicit tabstops ($1+), usually $1 is the first jump.
    // If not, $0 is the cursor position.
    
    let newCursor = finalCursorOffset;
    let nextStops: number[] = [];

    if (sortedStops.length > 0) {
        newCursor = sortedStops[0]; // First tabstop ($1)
        nextStops = sortedStops.slice(1);
        // $0 is usually the final exit point, append it to the end of the chain
        nextStops.push(finalCursorOffset);
    } else {
        // Just $0
        newCursor = finalCursorOffset;
        nextStops = [];
    }

    return { 
        text: clean, 
        newCursor: newCursor,
        tabStops: nextStops 
    };
};

/**
 * Checks if a macro is triggered.
 */
export const checkMacroTrigger = (
  text: string,
  cursorIndex: number,
  macros: Macro[],
  forceMath: boolean = false
): { text: string; cursorIndex: number; tabStops: number[] } | null => {
  const textBeforeCursor = text.slice(0, cursorIndex);
  const textAfterCursor = text.slice(cursorIndex);
  
  const inMath = forceMath || isInsideMath(text, cursorIndex);

  // Filter valid macros
  const validMacros = macros
      .map((m, i) => ({ ...m, originalIndex: i }))
      .filter(m => {
          const options = m.options || "";
          const modeMath = options.includes('m');
          const modeText = options.includes('t');
          
          if (modeMath && !inMath) return false;
          if (modeText && inMath) return false;
          
          // Strict check for visual macros:
          // If macro expects visual input, it should NOT trigger on typing.
          if (typeof m.replacement === 'string' && m.replacement.includes('${VISUAL}')) {
              return false;
          }

          return true;
      });

  // Sort: Priority DESC -> Index DESC (Last defined wins)
  validMacros.sort((a, b) => {
      const pA = a.priority || 0;
      const pB = b.priority || 0;
      if (pA !== pB) return pB - pA;
      return b.originalIndex - a.originalIndex;
  });

  for (const macro of validMacros) {
      const options = macro.options || "";
      
      // Case 1: RegExp Object Trigger
      if (macro.trigger instanceof RegExp) {
          try {
              const source = macro.trigger.source;
              const flags = macro.trigger.flags;
              const anchoredRegex = new RegExp(source + '$', flags);
              
              const match = anchoredRegex.exec(textBeforeCursor);
              if (match) {
                  const matchText = match[0];
                  let replacementArgs: any = match.slice(1); 
                  if (typeof macro.replacement === 'function') {
                      replacementArgs = match;
                  }

                  const { text: replacementText, newCursor, tabStops } = processReplacement(macro, replacementArgs);

                  const prefix = textBeforeCursor.slice(0, -matchText.length);
                  const newText = prefix + replacementText + textAfterCursor;
                  
                  // Calculate absolute positions
                  const insertionStart = prefix.length;
                  const absoluteCursor = insertionStart + newCursor;
                  const absoluteTabStops = tabStops.map(rel => insertionStart + rel);

                  return { 
                      text: newText, 
                      cursorIndex: absoluteCursor,
                      tabStops: absoluteTabStops
                  };
              }
          } catch (e) {
              console.warn("Regex macro execution failed", e);
          }
      } 
      // Case 2: String Trigger (optionally treated as Regex via 'r' flag)
      else if (typeof macro.trigger === 'string') {
         const isRegexString = options.includes('r');
         
         if (isRegexString) {
             try {
                 const regex = new RegExp(macro.trigger + '$');
                 const match = regex.exec(textBeforeCursor);

                 if (match) {
                      const matchText = match[0];
                      let replacementArgs: any = match.slice(1);
                      if (typeof macro.replacement === 'function') {
                          replacementArgs = match;
                      }

                      const { text: replacementText, newCursor, tabStops } = processReplacement(macro, replacementArgs);
                      
                      const prefix = textBeforeCursor.slice(0, -matchText.length);
                      const newText = prefix + replacementText + textAfterCursor;
                      
                      const insertionStart = prefix.length;
                      const absoluteCursor = insertionStart + newCursor;
                      const absoluteTabStops = tabStops.map(rel => insertionStart + rel);
                      
                      return { text: newText, cursorIndex: absoluteCursor, tabStops: absoluteTabStops };
                 }
             } catch (e) {}
         } else {
             if (textBeforeCursor.endsWith(macro.trigger)) {
                 const { text: replacementText, newCursor, tabStops } = processReplacement(macro);
                 
                 const prefix = textBeforeCursor.slice(0, -macro.trigger.length);
                 const newText = prefix + replacementText + textAfterCursor;
                 
                 const insertionStart = prefix.length;
                 const absoluteCursor = insertionStart + newCursor;
                 const absoluteTabStops = tabStops.map(rel => insertionStart + rel);

                 return { text: newText, cursorIndex: absoluteCursor, tabStops: absoluteTabStops };
             }
         }
      }
  }

  return null;
};