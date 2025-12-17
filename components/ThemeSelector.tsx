import React, { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown, Check } from 'lucide-react';
import { PPTXThemeId } from '../types';
import { THEMES } from '../services/pptxService';

interface ThemeSelectorProps {
  currentTheme: PPTXThemeId;
  onThemeChange: (theme: PPTXThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeName = (id: string) => {
    return id.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const toHex = (color: string) => color.startsWith('#') ? color : `#${color}`;

  const ThemePreview = ({ themeId }: { themeId: PPTXThemeId }) => {
    const theme = THEMES[themeId];
    return (
      <div className="w-6 h-4 border border-slate-200 rounded-[2px] flex flex-col overflow-hidden shrink-0 shadow-sm bg-white">
        <div style={{ backgroundColor: toHex(theme.header) }} className="h-1.5 w-full" />
        <div style={{ backgroundColor: toHex(theme.bg) }} className="flex-1 w-full flex items-center justify-center relative">
             <div style={{ backgroundColor: toHex(theme.accent) }} className="w-3 h-[2px] rounded-full opacity-40" />
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 sm:px-3 py-2 rounded-lg border border-slate-200 transition-all text-sm font-medium"
        title="Select Presentation Theme"
      >
        <Palette size={16} className="text-slate-500 hidden sm:block" />
        <div className="flex items-center gap-2">
            <ThemePreview themeId={currentTheme} />
            <span className="hidden sm:inline text-slate-700">{getThemeName(currentTheme)}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Presentation Theme
          </div>
          {Object.values(PPTXThemeId).map((themeId) => (
            <button
              key={themeId}
              onClick={() => {
                onThemeChange(themeId);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${currentTheme === themeId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                <ThemePreview themeId={themeId} />
                <span className={`text-sm ${currentTheme === themeId ? 'font-semibold' : 'font-medium'}`}>{getThemeName(themeId)}</span>
              </div>
              {currentTheme === themeId && <Check size={14} className="text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
