import React from 'react';
import { Presentation, PPTXThemeId } from '../types';
import { Plus, Clock, FileText, Trash2, Layout } from 'lucide-react';
import { THEMES } from '../services/pptxService';

interface DashboardProps {
  presentations: Presentation[];
  isLoading: boolean;
  onOpenPresentation: (presentation: Presentation) => void;
  onDeletePresentation: (id: string) => void;
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  presentations, 
  isLoading, 
  onOpenPresentation, 
  onDeletePresentation,
  onCreateNew 
}) => {
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toHex = (color: string) => color.startsWith('#') ? color : `#${color}`;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Presentations</h2>
          <p className="text-slate-500">Manage your saved decks</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 font-medium"
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      {presentations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layout className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No presentations yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Start by creating your first AI-powered presentation from text or notes.
          </p>
          <button
            onClick={onCreateNew}
            className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
          >
            Create your first deck &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <button
            onClick={onCreateNew}
            className="group flex flex-col items-center justify-center h-56 bg-white border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl transition-all"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <span className="font-semibold text-slate-600 group-hover:text-indigo-600">New Presentation</span>
          </button>

          {/* Presentation Cards */}
          {presentations.map((pres) => {
             const theme = THEMES[pres.themeId || PPTXThemeId.CORPORATE_BLUE];
             return (
              <div 
                key={pres.id} 
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-56"
              >
                {/* Preview Header Area */}
                <div 
                  className="h-24 p-4 flex items-start justify-between relative"
                  style={{ backgroundColor: toHex(theme.bg) }}
                >
                   {/* Decorative header bar */}
                   <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: toHex(theme.header) }} />
                   
                   <div className="mt-2">
                      <h3 
                        className="font-bold text-lg line-clamp-1" 
                        style={{ color: toHex(theme.text) }}
                      >
                        {pres.title}
                      </h3>
                      <p className="text-xs mt-1 opacity-70" style={{ color: toHex(theme.text) }}>
                        {pres.slides.length} Slides
                      </p>
                   </div>
                </div>

                {/* Content Area */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} />
                    <span>Edited {formatDate(pres.lastModified)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => onOpenPresentation(pres)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePresentation(pres.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};