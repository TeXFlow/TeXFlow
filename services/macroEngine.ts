

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

export interface TabStop {
    start: number;
    end: number;
}

export interface MacroResult {
    text: string;
    selection: TabStop;
    tabStops: TabStop[]; 
}

/**
 * Processes replacement, handling $0 (cursor), [[n]] (captures), and function replacements.
 * Returns clean text (no markers) and tab stop locations with ranges.
 */
export const processReplacement = (
    macro: Macro, 
    captures: string[] = [],
    visualContent: string = ""
): MacroResult => {
    
    let raw = "";

    if (typeof macro.replacement === 'function') {
        try {
             // Functions receive the full match array (standard regex behavior)
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
            const val = capture !== undefined ? capture : "";
            raw = raw.split(`[[${index}]]`).join(val);
        });
    }

    // Parse Tab Stops: $0, $1, ... $9 and ${1:default}
    let clean = "";
    // Map ID to the FIRST occurrence of that tabstop
    let tabStopsMap: Record<number, TabStop> = {}; 
    
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
            
            // Match ${1:default} - allow empty content with * instead of +
            const complexMatch = sub.match(/^\$\{(\d+):([^}]*)\}/);
            if (complexMatch) {
                const id = parseInt(complexMatch[1]);
                const content = complexMatch[2];
                const start = clean.length;
                clean += content;
                const end = clean.length; // Start and End define the range of 'content'

                if (!tabStopsMap[id]) {
                    tabStopsMap[id] = { start, end };
                }
                i += complexMatch[0].length;
                continue;
            }
            
            // Match $1, $0 (Simple tabstops)
            const simpleMatch = sub.match(/^\$(\d+)/);
            if (simpleMatch) {
                const id = parseInt(simpleMatch[1]);
                const start = clean.length;
                if (!tabStopsMap[id]) {
                    tabStopsMap[id] = { start, end: start };
                }
                i += simpleMatch[0].length;
                continue;
            }
        }
        
        clean += char;
        i++;
    }

    // Determine sequence
    const sortedIds = Object.keys(tabStopsMap).map(Number).sort((a, b) => a - b);
    
    let selection: TabStop = { start: clean.length, end: clean.length };
    let nextStops: TabStop[] = [];

    // Logic: Sequence is 1, 2, 3... then 0 (or end)
    const sequenceIds = sortedIds.filter(id => id !== 0);

    if (sequenceIds.length > 0) {
        selection = tabStopsMap[sequenceIds[0]];
        
        for (let k = 1; k < sequenceIds.length; k++) {
            nextStops.push(tabStopsMap[sequenceIds[k]]);
        }
        
        // $0 is always the final exit point
        if (tabStopsMap[0]) {
            nextStops.push(tabStopsMap[0]);
        } else {
            // Implicit exit at end of string if $0 not specified
            nextStops.push({ start: clean.length, end: clean.length });
        }
    } else {
        // Only $0 or no markers
        if (tabStopsMap[0]) {
            selection = tabStopsMap[0];
        } else {
            selection = { start: clean.length, end: clean.length };
        }
    }

    return { 
        text: clean, 
        selection,
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
  forceMath: boolean = false,
  checkAuto: boolean = false
): { text: string; selection: TabStop; tabStops: TabStop[] } | null => {
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
          const isAuto = options.includes('A');
          
          if (checkAuto && !isAuto) return false;
          
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
                  
                  // NOTE: We differentiate between String and Function replacements.
                  // Functions need the FULL match array to parse logic (like `match[1]`).
                  // String replacements use [[0]], [[1]] syntax which corresponds to Capture Groups.
                  // To make [[0]] be the first capture group (as expected in our config), we slice the match.
                  let replacementArgs: any = match;
                  if (typeof macro.replacement !== 'function') {
                       replacementArgs = match.slice(1);
                  }

                  const { text: replacementText, selection, tabStops } = processReplacement(macro, replacementArgs);

                  const prefix = textBeforeCursor.slice(0, -matchText.length);
                  const newText = prefix + replacementText + textAfterCursor;
                  
                  // Calculate absolute positions
                  const insertionStart = prefix.length;
                  
                  return { 
                      text: newText, 
                      selection: {
                          start: insertionStart + selection.start,
                          end: insertionStart + selection.end
                      },
                      tabStops: tabStops.map(ts => ({
                          start: insertionStart + ts.start,
                          end: insertionStart + ts.end
                      }))
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
                      
                      let replacementArgs: any = match;
                      if (typeof macro.replacement !== 'function') {
                          replacementArgs = match.slice(1);
                      }

                      const { text: replacementText, selection, tabStops } = processReplacement(macro, replacementArgs);
                      
                      const prefix = textBeforeCursor.slice(0, -matchText.length);
                      const newText = prefix + replacementText + textAfterCursor;
                      
                      const insertionStart = prefix.length;
                      
                      return { 
                          text: newText, 
                          selection: {
                              start: insertionStart + selection.start,
                              end: insertionStart + selection.end
                      },
                          tabStops: tabStops.map(ts => ({
                              start: insertionStart + ts.start,
                              end: insertionStart + ts.end
                      }))
                      };
                 }
             } catch (e) {}
         } else {
             if (textBeforeCursor.endsWith(macro.trigger)) {
                 const { text: replacementText, selection, tabStops } = processReplacement(macro);
                 
                 const prefix = textBeforeCursor.slice(0, -macro.trigger.length);
                 const newText = prefix + replacementText + textAfterCursor;
                 
                 const insertionStart = prefix.length;
                 
                 return { 
                     text: newText, 
                     selection: {
                          start: insertionStart + selection.start,
                          end: insertionStart + selection.end
                      },
                      tabStops: tabStops.map(ts => ({
                          start: insertionStart + ts.start,
                          end: insertionStart + ts.end
                      }))
                 };
             }
         }
      }
  }

  return null;
};
