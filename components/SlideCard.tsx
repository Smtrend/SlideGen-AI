import React, { useState } from 'react';
import { Slide } from '../types';
import { Edit2, Trash2, MessageSquareText, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';

interface SlideCardProps {
  slide: Slide;
  index: number;
  onEdit: (slide: Slide) => void;
  onDelete: (id: string) => void;
}

export const SlideCard: React.FC<SlideCardProps> = ({ slide, index, onEdit, onDelete }) => {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full overflow-hidden group">
      {/* Slide Header (Title Bar style) */}
      <div className="bg-indigo-600 p-4 shrink-0">
        <h3 className="text-white font-semibold text-lg truncate" title={slide.title}>
          {index + 1}. {slide.title}
        </h3>
      </div>

      {/* Slide Body */}
      <div className="p-6 flex-grow bg-slate-50 relative overflow-y-auto flex gap-4">
        {/* Bullets */}
        <ul className={`list-disc list-outside ml-5 space-y-2 text-slate-700 ${slide.image ? 'w-2/3' : 'w-full'}`}>
          {slide.bullets.map((bullet, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {bullet}
            </li>
          ))}
        </ul>

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
        
        {/* Hover Actions */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-lg backdrop-blur-sm z-10">
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
      <div className={`bg-slate-100 border-t border-slate-200 shrink-0 flex flex-col transition-all duration-300`}>
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
          {slide.image && <ImageIcon size={14} className="text-indigo-400 ml-2" title="Has Image" />}
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