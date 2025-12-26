
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// Added ArrowLeft to the lucide-react imports
import { Presentation as PresentationIcon, Wand2, Download, Layers, AlertCircle, FileText, Loader2, Plus, Sparkles, LayoutTemplate, Image as ImageIcon, Type, Palette, Feather, Diamond, LogOut, LayoutDashboard, Save, ChevronDown, CreditCard, ShieldAlert, Play, Search, Cloud, CloudCheck, CloudUpload, Edit3, RefreshCw, Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { Slide, GenerationMode, PresentationStyle, PPTXThemeId, SlideTransition, ImageQuality, User, Presentation, ToolId, SubscriptionStatus, SourceMode } from './types';
import { generateSlidesFromText } from './services/geminiService';
import { downloadPPTX, THEMES } from './services/pptxService';
import { authService } from './services/authService';
import { presentationService } from './services/presentationService';
import { supabase } from './services/supabaseClient';
import { SlideCard } from './components/SlideCard';
import { SlideEditor } from './components/SlideEditor';
import { ThemeSelector } from './components/ThemeSelector';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ToolsGrid } from './components/ToolsGrid';
import { LessonPlanner, QuizMaker, IcebreakerGenerator, LessonNoteMaker, NoteSummarizer } from './components/AICreatorTools';
import { BillingModal } from './components/BillingModal';
import { Slideshow } from './components/Slideshow';
import { v4 as uuidv4 } from 'uuid';

type ViewMode = 'DASHBOARD' | 'CREATE_SELECT' | 'CREATE_SLIDES' | 'CREATE_LESSON' | 'CREATE_QUIZ' | 'CREATE_ICEBREAKER' | 'EDIT_SLIDES' | 'CREATE_LESSON_NOTE' | 'CREATE_NOTE_SUMMARY';

const BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000"
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPresentations, setLoadingPresentations] = useState(false);
  const [isOpeningPresentation, setIsOpeningPresentation] = useState(false);

  const [currentPresentationId, setCurrentPresentationId] = useState<string | null>(null);
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [sourceMode, setSourceMode] = useState<SourceMode>(SourceMode.TEXT);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.ORGANIZE);
  const [presentationStyle, setPresentationStyle] = useState<PresentationStyle>(PresentationStyle.STANDARD);
  const [imageQuality, setImageQuality] = useState<ImageQuality>(ImageQuality.MEDIUM);
  const [currentTheme, setCurrentTheme] = useState<PPTXThemeId>(PPTXThemeId.CORPORATE_BLUE);
  const [error, setError] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentEditingSlide, setCurrentEditingSlide] = useState<Slide | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  useEffect(() => {
    if (isDirty && user && viewMode === 'EDIT_SLIDES' && slides.length > 0) {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = window.setTimeout(async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
          const result = await presentationService.savePresentation(user.id, currentPresentationId, slides, currentTheme, presentationTitle);
          setCurrentPresentationId(result.id);
          setLastSaved(result.lastModified);
          setIsDirty(false);
        } catch (e: any) {
          console.error("Auto-save failed", e);
          setSaveError(e.message || "Failed to sync changes");
        } finally {
          setIsSaving(false);
        }
      }, 2000); 
    }
    
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [isDirty, slides, currentTheme, user, viewMode, currentPresentationId, presentationTitle]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await authService.getProfile(session.user.id);
        if (profile) {
          setUser(profile);
          loadPresentations(profile.id);
          setShowLanding(false);
        }
      }
      setAuthLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await authService.getProfile(session.user.id);
        setUser(profile);
        if (profile) {
           loadPresentations(profile.id);
           setShowLanding(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPresentations([]);
        setShowLanding(true);
        setViewMode('DASHBOARD');
      }
    });

    return () => subscription.unsubscribe();
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

  const filteredPresentations = useMemo(() => {
    if (!searchQuery.trim()) return presentations;
    return presentations.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [presentations, searchQuery]);

  const getTrialDaysRemaining = () => {
    if (!user) return 0;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - user.trialStartDate;
    return Math.max(0, Math.ceil((thirtyDays - elapsed) / (1000 * 60 * 60 * 24)));
  };

  const isSubscriptionRequired = () => {
    if (!user) return false;
    if (user.paymentMethodLinked) return false;
    return getTrialDaysRemaining() <= 0;
  };

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
    if (isSubscriptionRequired()) {
        setIsBillingModalOpen(true);
        return;
    }
    setCurrentPresentationId(null);
    setPresentationTitle('Untitled Presentation');
    setSlides([]);
    setInputText("");
    setError(null);
    setViewMode('CREATE_SELECT');
  };

  const handleToolSelect = (toolId: ToolId) => {
    if (isSubscriptionRequired()) {
        setIsBillingModalOpen(true);
        return;
    }
    switch (toolId) {
      case ToolId.SLIDE_GENERATOR: setViewMode('CREATE_SLIDES'); break;
      case ToolId.LESSON_PLANNER: setViewMode('CREATE_LESSON'); break;
      case ToolId.QUIZ_MAKER: setViewMode('CREATE_QUIZ'); break;
      case ToolId.ICEBREAKER: setViewMode('CREATE_ICEBREAKER'); break;
      case ToolId.LESSON_NOTE_MAKER: setViewMode('CREATE_LESSON_NOTE'); break;
      case ToolId.NOTE_SUMMARIZER: setViewMode('CREATE_NOTE_SUMMARY'); break;
    }
  };

  const handleOpenDashboard = () => {
    if (user) loadPresentations(user.id);
    setViewMode('DASHBOARD');
    setIsDirty(false); 
    setSaveError(null);
  };

  const handleOpenPresentation = async (pres: Presentation) => {
    setIsOpeningPresentation(true);
    setError(null);
    try {
      const fullPres = await presentationService.getPresentationById(pres.id);
      if (fullPres) {
        setSlides(fullPres.slides);
        setCurrentPresentationId(fullPres.id);
        setPresentationTitle(fullPres.title);
        setCurrentTheme(fullPres.themeId);
        setViewMode('EDIT_SLIDES');
        setLastSaved(fullPres.lastModified);
        setIsDirty(false);
        setSaveError(null);
      } else {
        setError("Could not load presentation content.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to open presentation.");
    } finally {
      setIsOpeningPresentation(false);
    }
  };

  const handleDeletePresentation = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      await presentationService.deletePresentation(id);
      if (user) loadPresentations(user.id);
    }
  };

  const handleGenerateSlides = async () => {
    if (isSubscriptionRequired()) {
        setIsBillingModalOpen(true);
        return;
    }
    if (!inputText.trim()) {
      setError(sourceMode === SourceMode.TOPIC ? "Please enter a topic to generate slides." : "Please enter some text to generate slides.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateSlidesFromText(inputText, generationMode, presentationStyle, imageQuality, sourceMode);
      const newSlides: Slide[] = response.slides.map(s => ({
        id: uuidv4(),
        title: s.title,
        bullets: s.bullets,
        speakerNotes: s.speakerNotes,
        image: s.image,
        transition: SlideTransition.FADE
      }));
      setSlides(newSlides);
      const initialTitle = newSlides[0]?.title || (sourceMode === SourceMode.TOPIC ? inputText : 'Generated Presentation');
      setPresentationTitle(initialTitle);
      setViewMode('EDIT_SLIDES');
      
      if (user) {
        setIsSaving(true);
        try {
          const result = await presentationService.savePresentation(user.id, null, newSlides, currentTheme, initialTitle);
          setCurrentPresentationId(result.id);
          setLastSaved(result.lastModified);
          setIsDirty(false);
        } catch (saveErr: any) {
          console.error("Initial save failed", saveErr);
          setSaveError("Presentation is currently local only. Waiting for stable connection to sync.");
          setIsDirty(true); 
        } finally {
          setIsSaving(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating slides.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (slides.length === 0) return;
    const filename = `${presentationTitle.replace(/\s+/g, '_')}.pptx`;
    downloadPPTX(slides, currentTheme, filename);
  };

  const handleEditSlide = (slide: Slide) => {
    setCurrentEditingSlide(slide);
    setIsEditorOpen(true);
  };

  const handleSaveSlide = (updatedSlide: Slide) => {
    const updatedSlides = slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    setSlides(updatedSlides);
    setIsEditorOpen(false);
    setCurrentEditingSlide(null);
    setIsDirty(true); 
  };

  const handleDeleteSlide = (id: string) => {
    const updatedSlides = slides.filter(s => s.id !== id);
    setSlides(updatedSlides);
    setIsDirty(true); 
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
    setIsDirty(true); 
  };

  const handleThemeChange = (newTheme: PPTXThemeId) => {
    setCurrentTheme(newTheme);
    if(slides.length > 0) {
        setIsDirty(true); 
    }
  }

  const handleTitleChange = (newTitle: string) => {
    setPresentationTitle(newTitle);
    setIsDirty(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!user) {
    if (showLanding) return <LandingPage onGetStarted={() => setShowLanding(false)} onLogin={() => setShowLanding(false)} />;
    return <AuthScreen onLogin={handleLogin} onBack={() => setShowLanding(true)} />;
  }

  const trialDays = getTrialDaysRemaining();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Trial Banner */}
      {!user.paymentMethodLinked && (
        <div className={`py-2 px-4 text-center text-sm font-bold flex items-center justify-center gap-2 ${trialDays <= 5 ? 'bg-red-600 text-white animate-pulse' : 'bg-indigo-600 text-white'}`}>
          <ShieldAlert size={16} />
          {trialDays > 0 
            ? `Your free trial ends in ${trialDays} days. Setup your subscription now to avoid service interruption.`
            : `Your trial has expired. Please link a card to continue using AI tools.`}
          <button 
            onClick={() => setIsBillingModalOpen(true)}
            className="ml-4 underline hover:no-underline font-extrabold"
          >
            Setup Subscription ₦{user.userType === 'STUDENT' ? '2,500' : '5,000'}/mo
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
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
            <div className="flex items-center gap-1">
                 <button 
                    onClick={handleCreateNewClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode.startsWith('CREATE') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">New Project</span>
                </button>
            </div>

            {viewMode === 'EDIT_SLIDES' && slides.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-4">
                {/* Save Status Pill */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 mr-2">
                    {isSaving ? (
                        <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
                            <CloudUpload size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Syncing</span>
                        </div>
                    ) : saveError ? (
                        <div className="flex items-center gap-2 text-red-500" title={saveError}>
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Sync Error</span>
                        </div>
                    ) : isDirty ? (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Cloud size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Unsaved</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CloudCheck size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Saved</span>
                        </div>
                    )}
                </div>

                <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-all font-medium border border-slate-200"
                >
                  <Play size={18} />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-sm font-medium"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            )}
            
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
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-400 uppercase">Account Type</p>
                      <p className="text-sm font-bold text-indigo-600">{user.userType}</p>
                  </div>
                  <button
                    onClick={() => { handleOpenDashboard(); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <LayoutDashboard size={16} className="text-slate-500" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setIsBillingModalOpen(true); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <CreditCard size={16} className="text-slate-500" />
                    Subscription
                  </button>
                  <button
                    onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
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
        {isOpeningPresentation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-slate-600 font-bold animate-pulse">Loading Slide Content...</p>
                </div>
            </div>
        )}

        {viewMode === 'DASHBOARD' && (
            <Dashboard 
                presentations={filteredPresentations}
                isLoading={loadingPresentations}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenPresentation={handleOpenPresentation}
                onDeletePresentation={handleDeletePresentation}
                onCreateNew={handleCreateNewClick}
            />
        )}
        {viewMode === 'CREATE_SELECT' && (
          <div className="animate-fade-in py-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">Create New Content</h2>
            <ToolsGrid onSelectTool={handleToolSelect} />
          </div>
        )}
        {viewMode === 'CREATE_LESSON' && <LessonPlanner onBack={handleCreateNewClick} />}
        {viewMode === 'CREATE_QUIZ' && <QuizMaker onBack={handleCreateNewClick} />}
        {viewMode === 'CREATE_ICEBREAKER' && <IcebreakerGenerator onBack={handleCreateNewClick} />}
        {viewMode === 'CREATE_LESSON_NOTE' && <LessonNoteMaker onBack={handleCreateNewClick} />}
        {viewMode === 'CREATE_NOTE_SUMMARY' && <NoteSummarizer onBack={handleCreateNewClick} />}
        {viewMode === 'CREATE_SLIDES' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl min-h-[260px] flex items-center justify-center">
              {BANNER_IMAGES.map((img, index) => (
                <div key={img} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url("${img}")` }} />
              ))}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/90 mix-blend-multiply z-10" />
              <button onClick={() => setViewMode('CREATE_SELECT')} className="absolute top-6 left-6 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"><ArrowLeft size={20} /></button>
              <div className="relative z-20 px-8 py-12 text-center">
                 <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6 border border-white/20 shadow-inner"><PresentationIcon className="text-indigo-300" size={32} /></div>
                 <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">Slide Generator</h1>
                 <p className="text-indigo-100/80 max-w-lg mx-auto">Create stunning presentations from existing text or just a single topic.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60">
              
              {/* Source Selection Toggle */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-indigo-500" />
                  Content Source
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSourceMode(SourceMode.TEXT)}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${sourceMode === SourceMode.TEXT ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                  >
                    <FileText size={20} />
                    <div className="text-left">
                      <p className="font-bold text-sm">Paste Content</p>
                      <p className="text-[10px] opacity-70">Use your own notes</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setSourceMode(SourceMode.TOPIC)}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${sourceMode === SourceMode.TOPIC ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                  >
                    <SearchIcon size={20} />
                    <div className="text-left">
                      <p className="font-bold text-sm">Topic Only</p>
                      <p className="text-[10px] opacity-70">AI writes everything</p>
                    </div>
                  </button>
                </div>
              </div>

              {sourceMode === SourceMode.TEXT && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="flex flex-col sm:flex-row gap-6 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Sparkles size={16} className="text-indigo-500" /> AI Mode</label>
                      <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button onClick={() => setGenerationMode(GenerationMode.ORGANIZE)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${generationMode === GenerationMode.ORGANIZE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Layers size={16} />Organize</button>
                        <button onClick={() => setGenerationMode(GenerationMode.ENHANCE)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${generationMode === GenerationMode.ENHANCE ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Sparkles size={16} />Enhance</button>
                      </div>
                    </div>
                  </div>
                  <textarea 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder="Paste your source text here. AI will organize it into logical slides..." 
                    className="w-full h-48 p-4 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-y mb-2 shadow-sm text-slate-900 font-medium transition-all placeholder:text-slate-400" 
                  />
                  <p className="text-[10px] text-slate-400">Best for: PDF exports, long articles, meeting transcripts.</p>
                </div>
              )}

              {sourceMode === SourceMode.TOPIC && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">What is the presentation about?</label>
                  <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="e.g. The Future of Renewable Energy, Introduction to Quantum Physics..."
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm text-slate-900 font-medium transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Best for: Pitch decks, school reports, broad explanations.</p>
                </div>
              )}

              <div className="mb-8">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Visual Presentation Style</label>
                 <div className="grid grid-cols-3 gap-3">
                   {Object.values(PresentationStyle).map((style) => (
                      <button
                        key={style}
                        onClick={() => setPresentationStyle(style)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${presentationStyle === style ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                      >
                        {style.charAt(0) + style.slice(1).toLowerCase()}
                      </button>
                   ))}
                 </div>
              </div>

              {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm flex gap-2"><AlertCircle size={18}/>{error}</div>}
              
              <button 
                onClick={handleGenerateSlides} 
                disabled={isGenerating || !inputText.trim()} 
                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
              >
                {isGenerating ? <><Loader2 className="animate-spin" /> Generating Slides...</> : <><Wand2 /> Generate Presentation</>}
              </button>
            </div>
          </div>
        )}
        {viewMode === 'EDIT_SLIDES' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2 group mb-1">
                  <input
                    type="text"
                    value={presentationTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none transition-all px-1 -ml-1 w-full max-w-xl"
                    placeholder="Enter presentation title..."
                  />
                  <Edit3 size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-slate-500 text-sm">
                        {slides.length} slides • {isSaving ? 'Syncing...' : isDirty ? 'Unsaved changes' : 'All changes saved'}
                    </p>
                    {saveError && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold border border-red-100 animate-pulse">
                            <AlertCircle size={10} />
                            {saveError}
                            <button onClick={() => setIsDirty(true)} className="ml-1 underline hover:no-underline flex items-center gap-1">
                                <RefreshCw size={8} /> Retry
                            </button>
                        </div>
                    )}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddNewSlide} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-colors"><Plus size={18} />Add Slide</button>
              </div>
            </div>
            {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm flex gap-2"><AlertCircle size={18}/>{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide, index) => (<div key={slide.id} className="h-80"><SlideCard slide={slide} index={index} theme={THEMES[currentTheme]} onEdit={handleEditSlide} onDelete={handleDeleteSlide} /></div>))}
            </div>
          </div>
        )}
      </main>

      {isEditorOpen && currentEditingSlide && <SlideEditor isOpen={isEditorOpen} slide={currentEditingSlide} onSave={handleSaveSlide} onClose={() => setIsEditorOpen(false)} />}
      
      {isBillingModalOpen && user && (
        <BillingModal 
            user={user} 
            onClose={() => setIsBillingModalOpen(false)} 
            onUpdate={(updatedUser) => setUser(updatedUser)} 
        />
      )}

      {isPreviewOpen && (
        <Slideshow 
          slides={slides} 
          themeId={currentTheme} 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
