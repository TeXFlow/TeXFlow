import React, { useState, useEffect } from 'react';
import { Macro } from '../types';
import { Trash2, Plus, Info, Code, List, Save, RotateCcw } from 'lucide-react';
import { serializeMacros, parseMacros } from '../services/macroUtils';
import { DEFAULT_MACROS_SOURCE } from '../constants';

interface MacrosPanelProps {
  macros: Macro[];
  setMacros: (macros: Macro[]) => void;
  onClose: () => void;
}

export const MacrosPanel: React.FC<MacrosPanelProps> = ({ macros, setMacros, onClose }) => {
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Visual Add State
  const [newTrigger, setNewTrigger] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [newOptions, setNewOptions] = useState('mA');
  const [newPriority, setNewPriority] = useState(0);

  useEffect(() => {
      if (mode === 'code') {
          setCode(serializeMacros(macros));
      }
  }, [mode, macros]);

  const handleAdd = () => {
    if (!newTrigger || !newReplacement) return;
    const newMacro: Macro = {
      id: Date.now().toString(),
      trigger: newTrigger,
      replacement: newReplacement,
      options: newOptions,
      priority: newPriority,
    };
    setMacros([...macros, newMacro]);
    setNewTrigger('');
    setNewReplacement('');
    setNewOptions('mA');
    setNewPriority(0);
  };

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    setMacros(macros.filter(m => m.id !== id));
  };

  const handleSaveCode = () => {
      try {
          const parsed = parseMacros(code);
          setMacros(parsed);
          setError(null);
      } catch (e: any) {
          setError(e.message || "Invalid snippet syntax");
      }
  };

  const handleResetDefaults = () => {
      if (window.confirm("Are you sure you want to reset all macros to the default set? Your custom macros will be lost.")) {
          try {
              const defaults = parseMacros(DEFAULT_MACROS_SOURCE);
              setMacros(defaults);
              if (mode === 'code') {
                  setCode(DEFAULT_MACROS_SOURCE);
              }
          } catch (e) {
              console.error("Failed to load defaults", e);
          }
      }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Configuration</h2>
            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                <button 
                    onClick={() => setMode('visual')}
                    className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${mode === 'visual' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <List size={14} /> Visual
                </button>
                <button 
                    onClick={() => setMode('code')}
                    className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${mode === 'code' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <Code size={14} /> Code
                </button>
            </div>
        </div>
        <div className="flex items-center gap-2">
             <button 
                onClick={handleResetDefaults}
                className="text-xs font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Reset to Default Macros"
            >
                <RotateCcw size={14} /> Reset
            </button>
            <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 md:hidden">Close</button>
        </div>
      </div>

      {/* VISUAL MODE */}
      {mode === 'visual' && (
        <>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Trigger</label>
                    <input 
                        className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        placeholder=";a"
                        value={newTrigger}
                        onChange={(e) => setNewTrigger(e.target.value)}
                    />
                </div>
                <div className="col-span-6">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Replacement</label>
                    <input 
                        className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        placeholder="\alpha"
                        value={newReplacement}
                        onChange={(e) => setNewReplacement(e.target.value)}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Opts</label>
                    <input 
                        className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        placeholder="mA"
                        value={newOptions}
                        onChange={(e) => setNewOptions(e.target.value)}
                    />
                </div>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleAdd}
                        disabled={!newTrigger || !newReplacement}
                        className="px-4 py-1.5 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded text-sm transition-colors font-medium"
                    >
                    <Plus size={16} /> Add Macro
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {macros.map((macro, idx) => {
                    const triggerDisplay = macro.trigger instanceof RegExp ? macro.trigger.toString() : macro.trigger;
                    const replaceDisplay = typeof macro.replacement === 'function' ? '(function)' : macro.replacement;
                    
                    return (
                        <div key={macro.id || idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group">
                            <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm truncate" title={String(triggerDisplay)}>{String(triggerDisplay)}</div>
                            <div className="col-span-7 font-mono text-slate-600 dark:text-slate-400 text-xs sm:text-sm truncate" title={String(replaceDisplay)}>{String(replaceDisplay)}</div>
                            <div className="col-span-2 text-xs text-slate-400 font-mono text-right px-2 border-l border-slate-200 dark:border-slate-700">
                                {macro.options}
                            </div>
                            </div>
                            <button 
                            onClick={() => handleDelete(macro.id)}
                            className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                            <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
      )}

      {/* CODE MODE */}
      {mode === 'code' && (
          <div className="flex-1 flex flex-col p-0">
              <div className="flex-1 relative">
                <textarea 
                    className="w-full h-full p-4 font-mono text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 resize-none focus:outline-none"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                />
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-200 p-2 rounded text-xs border border-red-200 dark:border-red-800">
                        Syntax Error: {error}
                    </div>
                )}
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Info size={14}/>
                    Supports JS Objects, Regex Literals, Functions.
                  </div>
                  <button 
                    onClick={handleSaveCode}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium flex items-center gap-2"
                  >
                      <Save size={16}/> Apply Changes
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};