import React, { useState, useEffect } from 'react';
import { Presentation, Wand2, Zap, Layout, ArrowRight, CheckCircle2, Share2, Sparkles, FileText, ScanLine, HelpCircle, BookOpen, Briefcase, Users } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-200">
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
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden bg-slate-900">
        
        {/* Animated Background Images */}
        {HERO_IMAGES.map((img, index) => (
            <div
                key={img}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-40' : 'opacity-0'
                }`}
                style={{ backgroundImage: `url("${img}")` }}
            />
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-50 z-0" />
        
        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
           <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse" />
           <div className="absolute top-40 left-0 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-semibold mb-8 backdrop-blur-sm animate-fade-in-up">
            <Sparkles size={14} className="text-indigo-400" />
            <span>AI-Powered Content Generation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 max-w-4xl mx-auto leading-tight animate-fade-in-up delay-100 drop-shadow-lg">
            Everything you need for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-300">Presentations & Productivity</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Empowering professionals, entrepreneurs, and students. Transform raw data into structured insights, professional decks, and automated summaries instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Wand2 size={20} />
              Start Creating Free
            </button>
            <button 
              onClick={onGetStarted} 
              className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Explore Business Tools
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-white py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">A Multi-Functional AI Suite for Everyone</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">From the boardroom to the classroom, our AI handles the heavy lifting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Layout size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Business Presentations</h3>
              <p className="text-slate-600 leading-relaxed">
                Transform strategy docs or rough ideas into high-impact business decks with professional AI imagery.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Professional Note Maker</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate structured meeting minutes, project briefs, or study notes that are comprehensive and professional.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                <ScanLine size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Summarizer</h3>
              <p className="text-slate-600 leading-relaxed">
                Scan long contracts, reports, or handwritten notes to get instant, simplified summaries and actionable tasks.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dynamic Quizzes</h3>
              <p className="text-slate-600 leading-relaxed">
                Create engaging training assessments or educational quizzes with detailed explanations in one click.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Project & Lesson Planner</h3>
              <p className="text-slate-600 leading-relaxed">
                Craft detailed project roadmaps or lesson plans with clear objectives, milestones, and procedures.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <Share2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Versatile Exporting</h3>
              <p className="text-slate-600 leading-relaxed">
                Export presentations to PowerPoint (.pptx) or copy notes directly into Slack, Email, or Word.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="p-12 md:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-6">Efficiency for Teams & Individuals</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">1</div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Pick Your Tool</h4>
                  <p className="text-slate-400 mt-1">Select from our specialized suite for presentations, planning, or summarizing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">2</div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Input Your Context</h4>
                  <p className="text-slate-400 mt-1">Paste your raw notes, upload photos of whiteboard sessions, or define a goal.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">3</div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Export & Execute</h4>
                  <p className="text-slate-400 mt-1">Download your professional results and get back to what matters most.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-10 self-start flex items-center gap-2 text-indigo-300 hover:text-white font-semibold transition-colors group"
            >
              Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            
            {/* Brand & Credit */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-slate-900 p-1.5 rounded-lg">
                  <Presentation className="text-white" size={16} />
                </div>
                <span className="font-bold text-slate-900">SlideGen AI</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Professional tools for everyone. Developed by Catalyst Learning Field.
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col md:items-end gap-2 text-sm text-slate-600">
              <div className="flex flex-col md:flex-row gap-4">
                 <a href="tel:+23470171783" className="hover:text-indigo-600 transition-colors font-medium">Support: +23470171783</a>
                 <a href="mailto:sopulumich.catalyst@gmail.com" className="hover:text-indigo-600 transition-colors font-medium">Email: sopulumich.catalyst@gmail.com</a>
              </div>
              <p className="text-slate-400 text-xs mt-1">© {new Date().getFullYear()} SlideGen AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};