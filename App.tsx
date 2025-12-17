import React, { useState, useEffect, useRef } from 'react';
import { Presentation as PresentationIcon, Wand2, Download, Layers, AlertCircle, FileText, Loader2, Plus, Sparkles, LayoutTemplate, Image as ImageIcon, Type, Palette, Feather, Diamond, LogOut, LayoutDashboard, Save, ChevronDown } from 'lucide-react';
import { Slide, GenerationMode, PresentationStyle, PPTXThemeId, SlideTransition, ImageQuality, User, Presentation, ToolId } from './types';
import { generateSlidesFromText } from './services/geminiService';
import { downloadPPTX, THEMES } from './services/pptxService';
import { authService } from './services/authService';
import { presentationService } from './services/presentationService';
import { SlideCard } from './components/SlideCard';
import { SlideEditor } from './components/SlideEditor';
import { ThemeSelector } from './components/ThemeSelector';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ToolsGrid } from './components/ToolsGrid';
import { LessonPlanner, QuizMaker, IcebreakerGenerator, LessonNoteMaker, NoteSummarizer } from './components/AICreatorTools';
import { v4 as uuidv4 } from 'uuid';

type ViewMode = 'DASHBOARD' | 'CREATE_SELECT' | 'CREATE_SLIDES' | 'CREATE_LESSON' | 'CREATE_QUIZ' | 'CREATE_ICEBREAKER' | 'EDIT_SLIDES' | 'CREATE_LESSON_NOTE' | 'CREATE_NOTE_SUMMARY';

const BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000", // Team/Meeting
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000", // Creative/Abstract
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000", // Office/Space
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000"  // Tech/Work
];

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  // App Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Dashboard Data State
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loadingPresentations, setLoadingPresentations] = useState(false);

  // Slide Generator State
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

  // Banner Animation State
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // --- Effects ---

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadPresentations(currentUser.id);
      setShowLanding(false);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setShowLanding(false);
    loadPresentations(loggedInUser.id);
    setViewMode('DASHBOARD');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setSlides([]);
    setInputText("");
    setCurrentPresentationId(null);
    setShowLanding(true);
    setViewMode('DASHBOARD');
    setIsUserMenuOpen(false);
  };

  const handleCreateNewClick = () => {
    setViewMode('CREATE_SELECT');
  };

  const handleToolSelect = (toolId: ToolId) => {
    switch (toolId) {
      case ToolId.SLIDE_GENERATOR:
        setSlides([]);
        setInputText("");
        setCurrentPresentationId(null);
        setCurrentTheme(PPTXThemeId.CORPORATE_BLUE);
        setError(null);
        setViewMode('CREATE_SLIDES');
        break;
      case ToolId.LESSON_PLANNER:
        setViewMode('CREATE_LESSON');
        break;
      case ToolId.QUIZ_MAKER:
        setViewMode('CREATE_QUIZ');
        break;
      case ToolId.ICEBREAKER:
        setViewMode('CREATE_ICEBREAKER');
        break;
      case ToolId.LESSON_NOTE_MAKER:
        setViewMode('CREATE_LESSON_NOTE');
        break;
      case ToolId.NOTE_SUMMARIZER:
        setViewMode('CREATE_NOTE_SUMMARY');
        break;
    }
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
    setViewMode('EDIT_SLIDES');
    setLastSaved(presentation.lastModified);
  };

  const handleDeletePresentation = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      await presentationService.deletePresentation(id);
      if (user) loadPresentations(user.id);
    }
  };

  const handleGenerateSlides = async () => {
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
      setViewMode('EDIT_SLIDES');
      
      // Auto-save
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

  // Determine which unauthenticated screen to show
  if (!user) {
    if (showLanding) {
      return (
        <LandingPage 
          onGetStarted={() => setShowLanding(false)} 
          onLogin={() => setShowLanding(false)}
        />
      );
    }
    return (
      <AuthScreen 
        onLogin={handleLogin} 
        onBack={() => setShowLanding(true)}
      />
    );
  }

  // Authenticated View
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
            
            {/* Primary Action */}
            <div className="flex items-center gap-1 mr-2">
                 <button 
                    onClick={handleCreateNewClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode.startsWith('CREATE') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">New Project</span>
                </button>
            </div>

            {/* Action Buttons for Edit Mode */}
            {viewMode === 'EDIT_SLIDES' && slides.length > 0 && (
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
            
            {/* User Profile Dropdown */}
            <div className="relative ml-2" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-2 rounded-full border border-transparent hover:border-slate-100 transition-all outline-none"
              >
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-700 leading-none">{user.name}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-50 md:hidden">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleOpenDashboard();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <LayoutDashboard size={16} className="text-slate-500" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium border-t border-slate-50"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
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
                onCreateNew={handleCreateNewClick}
            />
        )}

        {/* VIEW: CREATE SELECT (TOOLS GRID) */}
        {viewMode === 'CREATE_SELECT' && (
          <div className="animate-fade-in py-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">What would you like to create?</h2>
            <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">Select a tool to start generating content with AI.</p>
            <ToolsGrid onSelectTool={handleToolSelect} />
          </div>
        )}

        {/* VIEW: LESSON PLAN GENERATOR */}
        {viewMode === 'CREATE_LESSON' && (
            <div className="animate-fade-in">
                <LessonPlanner onBack={handleCreateNewClick} />
            </div>
        )}

        {/* VIEW: QUIZ MAKER */}
        {viewMode === 'CREATE_QUIZ' && (
            <div className="animate-fade-in">
                <QuizMaker onBack={handleCreateNewClick} />
            </div>
        )}

        {/* VIEW: ICEBREAKER GENERATOR */}
        {viewMode === 'CREATE_ICEBREAKER' && (
            <div className="animate-fade-in">
                <IcebreakerGenerator onBack={handleCreateNewClick} />
            </div>
        )}

        {/* VIEW: LESSON NOTE MAKER */}
        {viewMode === 'CREATE_LESSON_NOTE' && (
            <div className="animate-fade-in">
                <LessonNoteMaker onBack={handleCreateNewClick} />
            </div>
        )}

        {/* VIEW: NOTE SUMMARIZER */}
        {viewMode === 'CREATE_NOTE_SUMMARY' && (
            <div className="animate-fade-in">
                <NoteSummarizer onBack={handleCreateNewClick} />
            </div>
        )}

        {/* VIEW: CREATE SLIDES (Input) */}
        {viewMode === 'CREATE_SLIDES' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Hero Header with Animated Background */}
            <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl min-h-[300px] flex items-center justify-center">
              {/* Animated Background Slideshow */}
              {BANNER_IMAGES.map((img, index) => (
                <div
                  key={img}
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                    index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ backgroundImage: `url("${img}")` }}
                />
              ))}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/90 mix-blend-multiply z-10" />
              
              {/* Back Button */}
               <button 
                  onClick={handleCreateNewClick}
                  className="absolute top-6 left-6 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                  title="Back"
                >
                  <Sparkles size={16} />
               </button>
              
              {/* Content */}
              <div className="relative z-20 px-8 py-12 text-center">
                 <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6 border border-white/20 shadow-inner">
                    <Wand2 className="text-indigo-300" size={32} />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
                  Create New <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-violet-200">Presentation</span>
                </h1>
                <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto font-medium leading-relaxed">
                  Transform your raw text into beautiful, professional slides in seconds using advanced AI.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60">
              
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
                onClick={handleGenerateSlides}
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

        {/* VIEW: EDIT SLIDES (Results) */}
        {viewMode === 'EDIT_SLIDES' && (
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
                  onClick={handleCreateNewClick} // Just go to create new instead of reset state entirely
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