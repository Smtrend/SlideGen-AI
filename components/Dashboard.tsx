
import React from 'react';
import { Presentation, PPTXThemeId } from '../types';
import { Plus, Clock, Trash2, Layout, Search } from 'lucide-react';
import { THEMES } from '../services/pptxService';

interface DashboardProps {
  presentations: Presentation[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPresentation: (presentation: Presentation) => void;
  onDeletePresentation: (id: string) => void;
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  presentations, 
  isLoading, 
  searchQuery,
  onSearchChange,
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
      <div className="space-y-12">
        <div className="h-14 bg-slate-200 rounded-2xl animate-pulse max-w-4xl mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10">
      
      {/* Search Bar */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="relative group">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" 
            size={20} 
          />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search through your projects, decks, and presentations..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-lg text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
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
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchQuery ? 'No matching projects found' : 'No presentations yet'}
          </h3>
          <button
            onClick={searchQuery ? () => onSearchChange('') : onCreateNew}
            className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
          >
            {searchQuery ? 'Show all presentations' : 'Create your first deck →'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!searchQuery && (
            <button
              onClick={onCreateNew}
              className="group flex flex-col items-center justify-center h-56 bg-white border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl transition-all"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="font-semibold text-slate-600 group-hover:text-indigo-600">New Presentation</span>
            </button>
          )}

          {presentations.map((pres) => {
             const theme = THEMES[pres.themeId || PPTXThemeId.CORPORATE_BLUE];
             return (
              <div 
                key={pres.id} 
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-56 cursor-pointer"
                onClick={() => onOpenPresentation(pres)}
              >
                <div 
                  className="h-24 p-4 flex items-start justify-between relative"
                  style={{ backgroundColor: toHex(theme.bg) }}
                >
                   <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: toHex(theme.header) }} />
                   <div className="mt-2">
                      <h3 className="font-bold text-lg line-clamp-1" style={{ color: toHex(theme.text) }}>
                        {pres.title}
                      </h3>
                      <p className="text-xs mt-1 opacity-70" style={{ color: toHex(theme.text) }}>
                        AI Generated Deck
                      </p>
                   </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} />
                    <span>Edited {formatDate(pres.lastModified)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors">
                      Open Presentation
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
