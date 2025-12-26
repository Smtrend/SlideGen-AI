
import React, { useState } from 'react';
import { Slide, ThemeColors } from '../types';
import { Edit2, Trash2, MessageSquareText, ChevronUp, ChevronDown, Image as ImageIcon, Play } from 'lucide-react';

interface SlideCardProps {
  slide: Slide;
  index: number;
  theme: ThemeColors;
  onEdit: (slide: Slide) => void;
  onDelete: (id: string) => void;
}

export const SlideCard: React.FC<SlideCardProps> = ({ slide, index, theme, onEdit, onDelete }) => {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  const toHex = (color: string) => color.startsWith('#') ? color : `#${color}`;

  const headerStyle = { backgroundColor: toHex(theme.header) };
  const bodyStyle = { 
    backgroundColor: toHex(theme.bg), 
    color: toHex(theme.text) 
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden group">
      {/* Slide Header (Mini Preview Tab) */}
      <div 
        className="p-4 shrink-0 transition-colors duration-300 relative"
        style={headerStyle}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/10" />
        <h3 className="text-white font-bold text-lg truncate drop-shadow-sm pr-12" title={slide.title}>
          {index + 1}. {slide.title}
        </h3>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
           <span className="w-2 h-2 rounded-full bg-white/40" />
           <span className="w-2 h-2 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Slide Body (Canvas Area) */}
      <div 
        className="p-6 flex-grow relative overflow-hidden flex gap-4 transition-colors duration-300"
        style={bodyStyle}
      >
        <div className={`flex flex-col h-full overflow-hidden ${slide.image ? 'w-2/3' : 'w-full'}`}>
            <ul className="list-none space-y-2">
            {slide.bullets.slice(0, 4).map((bullet, i) => (
                <li key={i} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: toHex(theme.text) }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: toHex(theme.accent) }} />
                    <span className="line-clamp-2">{bullet}</span>
                </li>
            ))}
            {slide.bullets.length > 4 && (
                <li className="text-[10px] italic opacity-50" style={{ color: toHex(theme.text) }}>
                    +{slide.bullets.length - 4} more points...
                </li>
            )}
            </ul>
        </div>

        {slide.image && (
          <div className="w-1/3 shrink-0 flex items-center">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200/50 bg-white shadow-sm ring-4 ring-slate-100/50">
              <img 
                src={slide.image} 
                alt="Slide" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        {slide.backgroundImage && (
           <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
              <img src={slide.backgroundImage} alt="bg" className="w-full h-full object-cover" />
           </div>
        )}
        
        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => onEdit(slide)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-slate-900 font-bold text-sm shadow-xl hover:scale-105 transition-transform"
          >
            <Edit2 size={14} />
            Edit Slide
          </button>
          <button
            onClick={() => onDelete(slide.id)}
            className="p-2 bg-red-500 text-white rounded-lg shadow-xl hover:bg-red-600 hover:scale-110 transition-all"
            title="Delete Slide"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Footer (Notes Bar) */}
      <div className={`bg-slate-100 border-t border-slate-200 shrink-0 flex flex-col transition-all duration-300 z-10`}>
        <div className="flex items-center justify-between px-3 py-2">
           <button
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            disabled={!slide.speakerNotes}
            className={`flex-1 flex items-center justify-between text-xs text-left group/notes ${!slide.speakerNotes ? 'opacity-50 cursor-default' : 'hover:bg-slate-200/50 cursor-pointer rounded p-1 transition-colors'}`}
          >
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <MessageSquareText size={14} className="shrink-0 text-slate-400 group-hover/notes:text-indigo-500 transition-colors" />
              <span className={`italic truncate ${isNotesExpanded ? 'font-semibold not-italic text-slate-700' : 'text-slate-500'}`}>
                 {slide.speakerNotes ? (isNotesExpanded ? 'Speaker Notes' : slide.speakerNotes) : 'No notes'}
              </span>
            </div>
            {slide.speakerNotes && (
              isNotesExpanded ? <ChevronDown size={14} className="shrink-0 text-slate-400" /> : <ChevronUp size={14} className="shrink-0 text-slate-400" />
            )}
          </button>
          
          {slide.image && (
            <span title="Contains Visual" className="flex items-center ml-2">
              <ImageIcon size={14} className="text-indigo-400" />
            </span>
          )}
        </div>
        
        {isNotesExpanded && slide.speakerNotes && (
          <div className="px-3 pb-3 text-[10px] text-slate-600 italic border-t border-slate-200/50 pt-2 max-h-24 overflow-y-auto scrollbar-hide">
            {slide.speakerNotes}
          </div>
        )}
      </div>
    </div>
  );
};
