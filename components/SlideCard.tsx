import React, { useState } from 'react';
import { Slide, ThemeColors } from '../types';
import { Edit2, Trash2, MessageSquareText, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';

interface SlideCardProps {
  slide: Slide;
  index: number;
  theme: ThemeColors;
  onEdit: (slide: Slide) => void;
  onDelete: (id: string) => void;
}

export const SlideCard: React.FC<SlideCardProps> = ({ slide, index, theme, onEdit, onDelete }) => {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // Helper to ensure hex code has # prefix
  const toHex = (color: string) => color.startsWith('#') ? color : `#${color}`;

  const headerStyle = { backgroundColor: toHex(theme.header) };
  const bodyStyle = { 
    backgroundColor: toHex(theme.bg), 
    color: toHex(theme.text) 
  };
  const titleStyle = { color: toHex(theme.bg) }; // Assuming title in header is light/white for contrast, or maybe derived. 
  // Actually, standard PPT themes usually have white text on dark headers.
  // The theme definition in pptxService defines 'text' as the body text color.
  // For the header text in the card, we'll default to white as the current themes (Blue, Green, Purple, etc.) use dark header colors.
  // If we had light header themes, we'd need a 'headerText' property. For now, white is safe for these presets.

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full overflow-hidden group">
      {/* Slide Header (Title Bar style) */}
      <div 
        className="p-4 shrink-0 transition-colors duration-300"
        style={headerStyle}
      >
        <h3 className="text-white font-semibold text-lg truncate" title={slide.title}>
          {index + 1}. {slide.title}
        </h3>
      </div>

      {/* Slide Body */}
      <div 
        className="p-6 flex-grow relative overflow-y-auto flex gap-4 transition-colors duration-300"
        style={bodyStyle}
      >
        {/* Bullets */}
        <ul 
          className={`list-disc list-outside ml-5 space-y-2 ${slide.image ? 'w-2/3' : 'w-full'}`}
          // Marker color isn't standard CSS property, handled via style tag below
        >
          {slide.bullets.map((bullet, i) => (
            <li key={i} className="text-sm leading-relaxed" style={{ color: toHex(theme.text) }}>
              {bullet}
            </li>
          ))}
        </ul>
        <style>{`
          /* Little hack to color bullets if marker pseudo-element isn't easily accessible via inline styles */
          ul li::marker {
            color: ${toHex(theme.accent)};
          }
        `}</style>

        {/* Image Preview (if present) */}
        {slide.image && (
          <div className="w-1/3 shrink-0">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-white">
              <img 
                src={slide.image} 
                alt="Slide" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        {/* Background Image Preview Override */}
        {slide.backgroundImage && (
           <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <img src={slide.backgroundImage} alt="bg" className="w-full h-full object-cover" />
           </div>
        )}
        
        {/* Hover Actions */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg backdrop-blur-sm z-10 shadow-sm">
          <button
            onClick={() => onEdit(slide)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Edit Slide"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(slide.id)}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Slide"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Footer / Notes preview */}
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
                 {slide.speakerNotes ? (isNotesExpanded ? 'Speaker Notes' : slide.speakerNotes) : 'No speaker notes'}
              </span>
            </div>
            {slide.speakerNotes && (
              isNotesExpanded ? <ChevronDown size={14} className="shrink-0 text-slate-400" /> : <ChevronUp size={14} className="shrink-0 text-slate-400" />
            )}
          </button>
          
          {/* Small indicator if image exists in footer too, or just leave it in body */}
          {slide.image && (
            <span title="Has Image" className="flex items-center ml-2">
              <ImageIcon size={14} className="text-indigo-400" />
            </span>
          )}
        </div>
        
        {isNotesExpanded && slide.speakerNotes && (
          <div className="px-3 pb-3 text-xs text-slate-600 italic border-t border-slate-200/50 pt-2 max-h-32 overflow-y-auto">
            {slide.speakerNotes}
          </div>
        )}
      </div>
    </div>
  );
};