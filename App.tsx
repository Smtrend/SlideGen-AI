import React, { useState, useEffect } from 'react';
import { Presentation as PresentationIcon, Wand2, Download, Layers, AlertCircle, FileText, Loader2, Plus, Sparkles, LayoutTemplate, Image as ImageIcon, Type, Palette, Feather, Diamond, LogOut, LayoutDashboard, Save } from 'lucide-react';
import { Slide, GenerationMode, PresentationStyle, PPTXThemeId, SlideTransition, ImageQuality, User, Presentation } from './types';
import { generateSlidesFromText } from './services/geminiService';
import { downloadPPTX, THEMES } from './services/pptxService';
import { authService } from './services/authService';
import { presentationService } from './services/presentationService';
import { SlideCard } from './components/SlideCard';
import { SlideEditor } from './components/SlideEditor';
import { ThemeSelector } from './components/ThemeSelector';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { v4 as uuidv4 } from 'uuid';

type ViewMode = 'DASHBOARD' | 'CREATE' | 'EDIT';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');

  // Dashboard Data State
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loadingPresentations, setLoadingPresentations] = useState(false);

  // Editor/Generator State
  const [currentPresentationId, setCurrentPresentationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.ORGANIZE);
  const [presentationStyle, setPresentationStyle] = useState<PresentationStyle>(PresentationStyle.STANDARD);
  const [imageQuality, setImageQuality] = useState<ImageQuality>(ImageQuality.MEDIUM);
  const [currentTheme, setCurrentTheme] = useState<PPTXThemeId>(PPTXThemeId.CORPORATE_BLUE);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  
  // Slide Modal Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEditingSlide, setCurrentEditingSlide] = useState<Slide | null>(null);

  // --- Effects ---

  // 1. Check Auth on Mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadPresentations(currentUser.id);
    }
    setAuthLoading(false);
  }, []);

  // 2. Load Presentations helper
  const loadPresentations = async (userId: string) => {
    setLoadingPresentations(true);
    try {
      const data = await presentationService.getUserPresentations(userId);
      setPresentations(data);
    } catch (e) {
      console.error("Failed to load presentations", e);
    } finally {
      setLoadingPresentations(false);
    }
  };

  // --- Handlers ---

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    loadPresentations(loggedInUser.id);
    setViewMode('DASHBOARD');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setSlides([]);
    setInputText("");
    setCurrentPresentationId(null);
    setViewMode('DASHBOARD');
  };

  const handleCreateNew = () => {
    setSlides([]);
    setInputText("");
    setCurrentPresentationId(null);
    setCurrentTheme(PPTXThemeId.CORPORATE_BLUE);
    setError(null);
    setViewMode('CREATE');
  };

  const handleOpenDashboard = () => {
    if (user) {
      loadPresentations(user.id);
    }
    setViewMode('DASHBOARD');
  };

  const handleOpenPresentation = (presentation: Presentation) => {
    setSlides(presentation.slides);
    setCurrentPresentationId(presentation.id);
    setCurrentTheme(presentation.themeId);
    setViewMode('EDIT');
    setLastSaved(presentation.lastModified);
  };

  const handleDeletePresentation = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      await presentationService.deletePresentation(id);
      if (user) loadPresentations(user.id);
    }
  };

  const saveCurrentWork = async (manual = false) => {
    if (!user || slides.length === 0) return;
    
    setIsSaving(true);
    try {
      const savedPresentation = await presentationService.savePresentation(
        user.id,
        currentPresentationId,
        slides,
        currentTheme
      );
      setCurrentPresentationId(savedPresentation.id);
      setLastSaved(Date.now());
      if (manual) {
        // Maybe show a toast
      }
    } catch (e) {
      console.error("Failed to save", e);
      setError("Failed to save progress.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to generate slides.");
      return;
    }
    
    if (!process.env.API_KEY) {
      setError("API Key is missing. Please configuration your environment.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateSlidesFromText(inputText, generationMode, presentationStyle, imageQuality);
      
      const newSlides: Slide[] = response.slides.map(s => ({
        id: uuidv4(),
        title: s.title,
        bullets: s.bullets,
        speakerNotes: s.speakerNotes,
        image: s.image,
        transition: SlideTransition.FADE
      }));

      setSlides(newSlides);
      setViewMode('EDIT'); // Switch to results view
      
      // Auto-save the generated result
      if (user) {
        const saved = await presentationService.savePresentation(user.id, null, newSlides, currentTheme);
        setCurrentPresentationId(saved.id);
        setLastSaved(Date.now());
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong while generating slides.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (slides.length === 0) return;
    const title = slides[0]?.title || "presentation";
    downloadPPTX(slides, currentTheme, `${title.replace(/\s+/g, '_')}.pptx`);
  };

  // Editor Handlers
  const handleEditSlide = (slide: Slide) => {
    setCurrentEditingSlide(slide);
    setIsEditorOpen(true);
  };

  const handleSaveSlide = (updatedSlide: Slide) => {
    const updatedSlides = slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    setSlides(updatedSlides);
    setIsEditorOpen(false);
    setCurrentEditingSlide(null);
    // Auto save changes to storage
    // We defer the save call slightly to allow state update or just call save logic with new data
    // For simplicity, we can just call the save function but it relies on 'slides' state which might not be updated yet in closure
    // Better to pass data directly or use effect. Let's force a save with new data.
    if(user) {
        presentationService.savePresentation(user.id, currentPresentationId, updatedSlides, currentTheme)
            .then(p => {
                setCurrentPresentationId(p.id);
                setLastSaved(Date.now());
            });
    }
  };

  const handleDeleteSlide = (id: string) => {
    const updatedSlides = slides.filter(s => s.id !== id);
    setSlides(updatedSlides);
    if(user) {
        presentationService.savePresentation(user.id, currentPresentationId, updatedSlides, currentTheme)
        .then(p => {
            setCurrentPresentationId(p.id);
            setLastSaved(Date.now());
        });
    }
  };

  const handleAddNewSlide = () => {
    const newSlide: Slide = {
      id: uuidv4(),
      title: "New Slide",
      bullets: ["Click edit to add content"],
      speakerNotes: "Add your speaker notes here.",
      transition: SlideTransition.FADE
    };
    const updatedSlides = [...slides, newSlide];
    setSlides(updatedSlides);
    if(user) {
        presentationService.savePresentation(user.id, currentPresentationId, updatedSlides, currentTheme)
        .then(p => {
            setCurrentPresentationId(p.id);
            setLastSaved(Date.now());
        });
    }
  };

  const handleThemeChange = (newTheme: PPTXThemeId) => {
    setCurrentTheme(newTheme);
    if(user && slides.length > 0) {
        presentationService.savePresentation(user.id, currentPresentationId, slides, newTheme)
        .then(p => {
            setCurrentPresentationId(p.id);
            setLastSaved(Date.now());
        });
    }
  }


  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleOpenDashboard}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <PresentationIcon className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:inline">
              SlideGen AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Navigation Links */}
            <div className="flex items-center gap-1 mr-2">
                <button 
                    onClick={handleOpenDashboard}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'DASHBOARD' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">Dashboard</span>
                </button>
                 <button 
                    onClick={handleCreateNew}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'CREATE' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">New</span>
                </button>
            </div>

            {/* Action Buttons for Edit Mode */}
            {viewMode === 'EDIT' && slides.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-4">
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 mr-2">
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    {isSaving ? 'Saving...' : lastSaved ? 'Saved' : ''}
                </div>
                <ThemeSelector 
                  currentTheme={currentTheme}
                  onThemeChange={handleThemeChange}
                />
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-sm font-medium"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            )}
            
            {/* User Profile */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-700">{user.name}</span>
              </div>
              <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: DASHBOARD */}
        {viewMode === 'DASHBOARD' && (
            <Dashboard 
                presentations={presentations}
                isLoading={loadingPresentations}
                onOpenPresentation={handleOpenPresentation}
                onDeletePresentation={handleDeletePresentation}
                onCreateNew={handleCreateNew}
            />
        )}

        {/* VIEW: CREATE (Input) */}
        {viewMode === 'CREATE' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                New <span className="text-indigo-600">Presentation</span>
              </h1>
              <p className="text-lg text-slate-600">
                Paste your content below and let our AI handle the design structure.
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

                {/* Presentation Style Selector */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <LayoutTemplate size={16} className="text-indigo-500" /> Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPresentationStyle(PresentationStyle.STANDARD)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-[4/3] ${
                        presentationStyle === PresentationStyle.STANDARD
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <FileText size={16} className={presentationStyle === PresentationStyle.STANDARD ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-[10px] mt-1 font-semibold">Content</span>
                    </button>
                    
                    <button
                      onClick={() => setPresentationStyle(PresentationStyle.VISUAL)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-[4/3] ${
                        presentationStyle === PresentationStyle.VISUAL
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <ImageIcon size={16} className={presentationStyle === PresentationStyle.VISUAL ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-[10px] mt-1 font-semibold">Visual</span>
                    </button>

                    <button
                      onClick={() => setPresentationStyle(PresentationStyle.MINIMALIST)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-[4/3] ${
                        presentationStyle === PresentationStyle.MINIMALIST
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Type size={16} className={presentationStyle === PresentationStyle.MINIMALIST ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-[10px] mt-1 font-semibold">Title</span>
                    </button>
                  </div>
                </div>

                {/* Image Quality Selector */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-500" /> Art Style
                  </label>
                   <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setImageQuality(ImageQuality.LOW)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-[4/3] ${
                        imageQuality === ImageQuality.LOW
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Feather size={16} className={imageQuality === ImageQuality.LOW ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-[10px] mt-1 font-semibold">Simple</span>
                    </button>

                    <button
                      onClick={() => setImageQuality(ImageQuality.MEDIUM)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-[4/3] ${
                        imageQuality === ImageQuality.MEDIUM
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Layers size={16} className={imageQuality === ImageQuality.MEDIUM ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-[10px] mt-1 font-semibold">Standard</span>
                    </button>

                     <button
                      onClick={() => setImageQuality(ImageQuality.HIGH)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-[4/3] ${
                        imageQuality === ImageQuality.HIGH
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Diamond size={16} className={imageQuality === ImageQuality.HIGH ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-[10px] mt-1 font-semibold">Pro</span>
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
                  {inputText.length} chars
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
        )}

        {/* VIEW: EDIT (Results) */}
        {viewMode === 'EDIT' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {slides.length > 0 ? slides[0].title : "Presentation"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full uppercase">
                    {presentationStyle}
                  </span>
                  <p className="text-slate-500">{slides.length} slides generated</p>
                </div>
              </div>
              <div className="flex gap-3">
                 <button
                  onClick={handleCreateNew} // Just go to create new instead of reset state entirely
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Close
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