import React from 'react';
import { Presentation, Wand2, Zap, Layout, ArrowRight, CheckCircle2, Share2, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Presentation className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              SlideGen AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
           <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
           <div className="absolute top-40 left-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 animate-fade-in-up">
            <Sparkles size={14} />
            <span>Now with AI Image Generation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 max-w-4xl mx-auto leading-tight animate-fade-in-up delay-100">
            Create stunning <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600">presentations</span> from simple text.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Stop spending hours formatting slides. Paste your notes, outlines, or rough ideas, and let our AI organize, design, and visualize your deck in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Wand2 size={20} />
              Generate Presentation
            </button>
            <button 
              onClick={onGetStarted} // Demo essentially goes to login for now
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              View Examples
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-white py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to present well</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">From structure to style, we handle the heavy lifting so you can focus on your delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Layout size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Organization</h3>
              <p className="text-slate-600 leading-relaxed">
                Paste unstructured text and our AI instantly breaks it down into logical slides, titles, and bullet points.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform">
                <Wand2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Image Generation</h3>
              <p className="text-slate-600 leading-relaxed">
                Don't have images? The AI analyzes your content and generates context-aware illustrations for every slide.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Share2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">PowerPoint Export</h3>
              <p className="text-slate-600 leading-relaxed">
                Download a fully editable .pptx file with speaker notes, layouts, and master slides ready for the boardroom.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="p-12 md:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-6">How it works</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">1</div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Input your content</h4>
                  <p className="text-slate-400 mt-1">Paste an article, rough notes, or a topic.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">2</div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Customize Style</h4>
                  <p className="text-slate-400 mt-1">Choose your tone, theme, and art style.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">3</div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Export & Present</h4>
                  <p className="text-slate-400 mt-1">Get a polished .pptx file in seconds.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-10 self-start flex items-center gap-2 text-indigo-300 hover:text-white font-semibold transition-colors group"
            >
              Start Creating Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="md:w-1/2 bg-indigo-900/50 relative min-h-[400px]">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-overlay" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-xs transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="h-4 w-24 bg-white/40 rounded mb-4" />
                    <div className="h-2 w-full bg-white/20 rounded mb-2" />
                    <div className="h-2 w-full bg-white/20 rounded mb-2" />
                    <div className="h-2 w-2/3 bg-white/20 rounded mb-6" />
                    <div className="aspect-video w-full bg-indigo-500/30 rounded-lg border border-white/10" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Presentation className="text-white" size={16} />
            </div>
            <span className="font-bold text-slate-900">SlideGen AI</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} SlideGen AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};