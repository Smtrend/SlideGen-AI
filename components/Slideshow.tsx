
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Slide, PPTXThemeId } from '../types';
import { THEMES } from '../services/pptxService';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Monitor } from 'lucide-react';

interface SlideshowProps {
  slides: Slide[];
  themeId: PPTXThemeId;
  isOpen: boolean;
  onClose: () => void;
}

export const Slideshow: React.FC<SlideshowProps> = ({ slides, themeId, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = THEMES[themeId];
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
      if (e.key === 'Escape') {
        if (!document.fullscreenElement) onClose();
      }
      if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  if (!isOpen || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const toHex = (color: string) => color.startsWith('#') ? color : `#${color}`;

  // Helper to determine if title is long and needs smaller font
  const getTitleFontSize = (text: string) => {
    if (text.length > 60) return 'text-3xl md:text-4xl';
    if (text.length > 30) return 'text-4xl md:text-5xl';
    return 'text-5xl md:text-6xl';
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-300"
    >
      {/* Top Bar - Hidden in native fullscreen to maximize space, or auto-hide logic could be added */}
      <div className="p-4 flex items-center justify-between text-white bg-black/40 backdrop-blur-md z-20 border-b border-white/5">
        <div className="flex flex-col">
          <h3 className="font-bold text-sm text-indigo-300 uppercase tracking-widest">{currentSlide.title}</h3>
          <p className="text-xs opacity-50">Slide {currentIndex + 1} of {slides.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-xs font-bold"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button onClick={onClose} className="p-2 hover:bg-red-500 rounded-full transition-colors" title="Close Preview (Esc)">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6 md:p-10 lg:p-16 overflow-hidden bg-black/20">
        <div 
          className="aspect-video w-full max-w-[95vw] max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden flex flex-col transition-all duration-500 relative border border-white/10"
          style={{ backgroundColor: toHex(theme.bg) }}
        >
          {/* Theme Header Bar */}
          <div className="h-4 w-full shrink-0" style={{ backgroundColor: toHex(theme.header) }} />
          
          {/* Content Container - Flex row for image/text layout */}
          <div className="flex flex-col md:flex-row gap-8 flex-1 p-8 md:p-14 overflow-hidden relative">
            <div className={`flex flex-col h-full ${currentSlide.image ? 'md:w-3/5' : 'w-full'} overflow-hidden`}>
              <h1 className={`${getTitleFontSize(currentSlide.title)} font-black mb-8 leading-tight tracking-tight`} style={{ color: toHex(theme.header) }}>
                {currentSlide.title}
              </h1>
              
              {/* Scrollable bullets area if content exceeds height */}
              <div className="flex-1 overflow-y-auto pr-4 custom-preview-scrollbar">
                <ul className="space-y-6">
                  {currentSlide.bullets.map((bullet, i) => (
                    <li key={i} className="text-xl md:text-2xl lg:text-3xl flex items-start gap-5 leading-relaxed" style={{ color: toHex(theme.text) }}>
                      <span className="mt-3.5 w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: toHex(theme.accent) }} />
                      <span className="font-medium">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {currentSlide.image && (
              <div className="md:w-2/5 flex items-center justify-center self-center h-full max-h-full">
                <div className="w-full h-auto max-h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200/50 bg-white">
                  <img src={currentSlide.image} alt="Slide Visual" className="w-full h-full object-contain bg-slate-50" />
                </div>
              </div>
            )}

            {/* Background Image Overlay */}
            {currentSlide.backgroundImage && (
              <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
                <img src={currentSlide.backgroundImage} alt="Background" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          
          {/* Subtle bottom fade if text is scrollable */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(to top, ${toHex(theme.bg)}, transparent)` }} />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="p-8 flex items-center justify-center gap-8 bg-black/40 backdrop-blur-md text-white border-t border-white/5 relative z-20">
        <button 
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="p-4 bg-white/5 hover:bg-white/20 disabled:opacity-10 rounded-full transition-all active:scale-90 border border-white/5 shadow-inner"
        >
          <ChevronLeft size={36} />
        </button>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-3 px-6 py-3 bg-black/30 rounded-full border border-white/10">
          <div className="flex gap-2 max-w-[200px] sm:max-w-md overflow-x-auto no-scrollbar">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-indigo-400 w-10 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'bg-white/20 w-2.5 hover:bg-white/40'}`} 
              />
            ))}
          </div>
          <div className="w-px h-4 bg-white/20 mx-2" />
          <span className="text-xs font-mono font-bold opacity-60 whitespace-nowrap">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>

        <button 
          onClick={nextSlide}
          disabled={currentIndex === slides.length - 1}
          className="p-4 bg-white/5 hover:bg-white/20 disabled:opacity-10 rounded-full transition-all active:scale-90 border border-white/5 shadow-inner"
        >
          <ChevronRight size={36} />
        </button>
      </div>

      <style>{`
        .custom-preview-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-preview-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-preview-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-preview-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
