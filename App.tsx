import React, { useState, useCallback } from 'react';
import { Presentation, Wand2, Download, Layers, AlertCircle, FileText, Loader2, Plus, Sparkles, LayoutTemplate, Image as ImageIcon, Type, Palette } from 'lucide-react';
import { Slide, GenerationMode, PresentationStyle, PPTXThemeId, SlideTransition } from './types';
import { generateSlidesFromText } from './services/geminiService';
import { downloadPPTX, THEMES } from './services/pptxService';
import { SlideCard } from './components/SlideCard';
import { SlideEditor } from './components/SlideEditor';
import { ThemeSelector } from './components/ThemeSelector';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.ORGANIZE);
  const [presentationStyle, setPresentationStyle] = useState<PresentationStyle>(PresentationStyle.STANDARD);
  const [currentTheme, setCurrentTheme] = useState<PPTXThemeId>(PPTXThemeId.CORPORATE_BLUE);
  const [error, setError] = useState<string | null>(null);
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEditingSlide, setCurrentEditingSlide] = useState<Slide | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to generate slides.");
      return;
    }
    
    // Check for API Key at runtime
    if (!process.env.API_KEY) {
      setError("API Key is missing. Please configuration your environment.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateSlidesFromText(inputText, generationMode, presentationStyle);
      
      const newSlides: Slide[] = response.slides.map(s => ({
        id: uuidv4(),
        title: s.title,
        bullets: s.bullets,
        speakerNotes: s.speakerNotes,
        image: s.image, // Map the AI generated image
        transition: SlideTransition.FADE // Default transition
      }));

      setSlides(newSlides);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating slides.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (slides.length === 0) return;
    downloadPPTX(slides, currentTheme, "my-presentation.pptx");
  };

  const handleEditSlide = (slide: Slide) => {
    setCurrentEditingSlide(slide);
    setIsEditorOpen(true);
  };

  const handleSaveSlide = (updatedSlide: Slide) => {
    setSlides(slides.map(s => s.id === updatedSlide.id ? updatedSlide : s));
    setIsEditorOpen(false);
    setCurrentEditingSlide(null);
  };

  const handleDeleteSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const handleAddNewSlide = () => {
    const newSlide: Slide = {
      id: uuidv4(),
      title: "New Slide",
      bullets: ["Click edit to add content"],
      speakerNotes: "Add your speaker notes here.",
      transition: SlideTransition.FADE
    };
    setSlides([...slides, newSlide]);
  };

  const handleReset = () => {
    setSlides([]);
    setError(null);
    setInputText("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Presentation className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              SlideGen AI
            </span>
          </div>
          {slides.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeSelector 
                currentTheme={currentTheme}
                onThemeChange={setCurrentTheme}
              />
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-sm font-medium"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export PPTX</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* State 1: Empty or Input State */}
        {slides.length === 0 ? (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Turn Text into <span className="text-indigo-600">Presentations</span> in Seconds
              </h1>
              <p className="text-lg text-slate-600">
                Paste your notes, articles, or rough ideas below. Our AI will structure them into professional slides automatically.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60">
              
              {/* Configuration Section */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                
                {/* Generation Mode */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-500" /> AI Mode
                  </label>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setGenerationMode(GenerationMode.ORGANIZE)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        generationMode === GenerationMode.ORGANIZE
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Layers size={16} />
                      Organize
                    </button>
                    <button
                      onClick={() => setGenerationMode(GenerationMode.ENHANCE)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        generationMode === GenerationMode.ENHANCE
                          ? 'bg-white text-violet-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Sparkles size={16} />
                      Enhance
                    </button>
                  </div>
                </div>

                {/* Presentation Template Style */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <LayoutTemplate size={16} className="text-indigo-500" /> Template Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPresentationStyle(PresentationStyle.STANDARD)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        presentationStyle === PresentationStyle.STANDARD
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                      title="Content Slide: Balanced text and details"
                    >
                      <FileText size={18} className="mb-1" />
                      <span className="text-xs font-medium">Content</span>
                    </button>
                    
                    <button
                      onClick={() => setPresentationStyle(PresentationStyle.VISUAL)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        presentationStyle === PresentationStyle.VISUAL
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                      title="Image Slide: Concise text with image descriptions"
                    >
                      <ImageIcon size={18} className="mb-1" />
                      <span className="text-xs font-medium">Image</span>
                    </button>

                    <button
                      onClick={() => setPresentationStyle(PresentationStyle.MINIMALIST)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        presentationStyle === PresentationStyle.MINIMALIST
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                      title="Title Slide: Large text, minimal points"
                    >
                      <Type size={18} className="mb-1" />
                      <span className="text-xs font-medium">Title</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="relative mb-6">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={generationMode === GenerationMode.ORGANIZE 
                    ? "Paste your text here to organize into slides..." 
                    : "Paste your rough ideas here for AI enhancement..."}
                  maxLength={500000} // Explicitly large limit
                  className="w-full h-64 p-4 text-base bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y transition-shadow"
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium">
                  {inputText.length} characters (Unlimited)
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${
                  isGenerating || !inputText.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.99]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Analyzing Content & Generating Images...
                  </>
                ) : (
                  <>
                    <Wand2 size={24} />
                    Generate Slides
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Results View */
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Presentation</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full uppercase">
                    {presentationStyle}
                  </span>
                  <p className="text-slate-500">{slides.length} slides generated</p>
                </div>
              </div>
              <div className="flex gap-3">
                 <button
                  onClick={handleReset}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleAddNewSlide}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  Add Slide
                </button>
              </div>
            </div>

            {/* Grid of Slides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide, index) => (
                <div key={slide.id} className="h-80">
                  <SlideCard
                    slide={slide}
                    index={index}
                    theme={THEMES[currentTheme]}
                    onEdit={handleEditSlide}
                    onDelete={handleDeleteSlide}
                  />
                </div>
              ))}
              
              {/* Add New Slide Card Button (Alternative to top button) */}
              <button
                onClick={handleAddNewSlide}
                className="h-80 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="p-4 bg-slate-100 rounded-full group-hover:bg-white transition-colors">
                  <Plus size={32} />
                </div>
                <span className="mt-4 font-medium">Add New Slide</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Editor Modal */}
      {isEditorOpen && currentEditingSlide && (
        <SlideEditor
          isOpen={isEditorOpen}
          slide={currentEditingSlide}
          onSave={handleSaveSlide}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};

export default App;