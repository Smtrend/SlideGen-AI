import React, { useState, useRef } from 'react';
import { BookOpen, HelpCircle, MessageCircle, Wand2, Copy, Check, Loader2, ArrowLeft, FileText, ScanLine, Upload, Image as ImageIcon, X } from 'lucide-react';
import { generateLessonPlan, generateQuiz, generateIcebreaker, generateLessonNote, summarizeNote } from '../services/geminiService';
import { LessonPlan, Quiz, Icebreaker, LessonNote, NoteSummary } from '../types';

// --- Shared Components ---

interface ResultCardProps {
  title: string;
  children?: React.ReactNode;
  onCopy?: () => void;
}

const ResultCard = ({ title, children, onCopy }: ResultCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        {onCopy && (
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// --- LESSON PLANNER ---

export const LessonPlanner = ({ onBack }: { onBack: () => void }) => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LessonPlan | null>(null);

  const handleGenerate = async () => {
    if (!topic || !grade) return;
    setIsLoading(true);
    try {
      const plan = await generateLessonPlan(topic, grade);
      setResult(plan);
    } catch (e) {
      alert("Failed to generate lesson plan");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    if (!result) return;
    const text = `Title: ${result.title}\nGrade: ${result.gradeLevel}\nDuration: ${result.duration}\n\nObjectives:\n${result.objectives.map(o => `- ${o}`).join('\n')}\n\nProcedure:\n${result.procedure.map(p => `${p.time}: ${p.activity}`).join('\n')}\n\nAssessment:\n${result.assessment}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={18} /> Back to Tools
      </button>

      {!result ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Lesson Plan Generator</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
              <input 
                value={topic} 
                onChange={e => setTopic(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-900" 
                placeholder="e.g. Photosynthesis, The Civil War, Fractions" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
              <input 
                value={grade} 
                onChange={e => setGrade(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-900" 
                placeholder="e.g. 5th Grade, High School Biology" 
              />
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={isLoading || !topic || !grade}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />} Generate Plan
            </button>
          </div>
        </div>
      ) : (
        <ResultCard title={result.title} onCopy={copyText}>
          <div className="space-y-6 text-slate-800">
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 border-b border-slate-100 pb-4">
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{result.gradeLevel}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full">{result.subject}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full">{result.duration}</span>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 text-purple-700">Objectives</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 text-purple-700">Procedure</h4>
              <div className="space-y-3">
                {result.procedure.map((step, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                    <span className="font-mono text-slate-500 whitespace-nowrap text-sm mt-0.5">{step.time}</span>
                    <p>{step.activity}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
               <h4 className="font-bold text-lg mb-2 text-purple-700">Materials & Assessment</h4>
               <p><strong>Materials:</strong> {result.materials.join(', ')}</p>
               <p className="mt-2"><strong>Assessment:</strong> {result.assessment}</p>
            </div>
            
            <button onClick={() => setResult(null)} className="text-purple-600 font-medium hover:underline mt-4 block">
                Generate Another
            </button>
          </div>
        </ResultCard>
      )}
    </div>
  );
};

// --- QUIZ MAKER ---

export const QuizMaker = ({ onBack }: { onBack: () => void }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Quiz | null>(null);
  const [showAnswers, setShowAnswers] = useState<boolean[]>([]);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const quiz = await generateQuiz(topic, difficulty, count);
      setResult(quiz);
      setShowAnswers(new Array(quiz.questions.length).fill(false));
    } catch (e) {
      alert("Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (index: number) => {
    const newShow = [...showAnswers];
    newShow[index] = !newShow[index];
    setShowAnswers(newShow);
  }

  const copyText = () => {
    if (!result) return;
    const text = result.questions.map((q, i) => `${i+1}. ${q.question}\n${q.options.map(o => `- ${o}`).join('\n')}\nAnswer: ${q.correctAnswer}`).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={18} /> Back to Tools
      </button>

      {!result ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
              <HelpCircle size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">AI Quiz Generator</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
              <input 
                value={topic} 
                onChange={e => setTopic(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900" 
                placeholder="e.g. World Capitals, Basic Chemistry, 1980s Pop Music" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900"
                >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
                </div>
                 <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Questions</label>
                <select 
                    value={count}
                    onChange={e => setCount(Number(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-900"
                >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                </select>
                </div>
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={isLoading || !topic}
              className="w-full py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />} Generate Quiz
            </button>
          </div>
        </div>
      ) : (
        <ResultCard title={result.title} onCopy={copyText}>
            <p className="text-slate-500 mb-6 italic">{result.description}</p>
            <div className="space-y-6">
                {result.questions.map((q, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <p className="font-bold text-slate-800 mb-3">{i+1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                            {q.options.map((opt, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 p-2 rounded text-sm text-slate-700">
                                    {opt}
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => toggleAnswer(i)}
                            className="text-xs font-semibold text-pink-600 hover:text-pink-800 uppercase tracking-wide"
                        >
                            {showAnswers[i] ? 'Hide Answer' : 'Show Answer'}
                        </button>
                        {showAnswers[i] && (
                            <div className="mt-3 p-3 bg-green-50 text-green-800 rounded text-sm border border-green-100">
                                <strong>Answer:</strong> {q.correctAnswer}
                                <p className="mt-1 text-xs opacity-80">{q.explanation}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
             <button onClick={() => setResult(null)} className="text-pink-600 font-medium hover:underline mt-6 block">
                Generate Another
            </button>
        </ResultCard>
      )}
    </div>
  );
};

// --- ICEBREAKER ---

export const IcebreakerGenerator = ({ onBack }: { onBack: () => void }) => {
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Icebreaker | null>(null);

  const handleGenerate = async () => {
    if (!context) return;
    setIsLoading(true);
    try {
      const icebreaker = await generateIcebreaker(context);
      setResult(icebreaker);
    } catch (e) {
      alert("Failed to generate icebreaker");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    if (!result) return;
    const text = `Activity: ${result.title}\nDuration: ${result.duration}\n\nInstructions:\n${result.instructions.map(i => `- ${i}`).join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={18} /> Back to Tools
      </button>

      {!result ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <MessageCircle size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Icebreaker Generator</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Context / Audience</label>
              <textarea 
                value={context} 
                onChange={e => setContext(e.target.value)}
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900" 
                placeholder="e.g. Remote team meeting for engineers, Kindergarten first day of school, Corporate workshop intro" 
              />
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={isLoading || !context}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />} Generate Activity
            </button>
          </div>
        </div>
      ) : (
        <ResultCard title={result.title} onCopy={copyText}>
           <div className="flex items-center gap-2 mb-6">
             <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">{result.duration}</span>
           </div>
           
           <div className="space-y-6">
             <div>
                <h4 className="font-bold text-lg mb-2 text-emerald-800">Instructions</h4>
                <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                    {result.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                </ol>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-bold text-sm text-slate-900 mb-1">Why it works</h4>
                <p className="text-slate-600 text-sm">{result.whyItWorks}</p>
             </div>

             {result.materials.length > 0 && (
                <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Materials Needed</h4>
                    <p className="text-slate-600 text-sm">{result.materials.join(', ')}</p>
                </div>
             )}
           </div>

           <button onClick={() => setResult(null)} className="text-emerald-600 font-medium hover:underline mt-6 block">
                Generate Another
            </button>
        </ResultCard>
      )}
    </div>
  );
};

// --- LESSON NOTE MAKER ---

export const LessonNoteMaker = ({ onBack }: { onBack: () => void }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LessonNote | null>(null);

  const handleGenerate = async () => {
    if (!topic || !grade || !subject) return;
    setIsLoading(true);
    try {
      const note = await generateLessonNote(topic, subject, grade);
      setResult(note);
    } catch (e) {
      alert("Failed to generate lesson notes");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    if (!result) return;
    let text = `Subject: ${result.subject}\nTopic: ${result.topic}\nGrade: ${result.gradeLevel}\n\nIntroduction:\n${result.introduction}\n\n`;
    text += result.sections.map(s => `${s.heading}\n${s.content}`).join('\n\n');
    text += `\n\nKey Terms:\n${result.keyTerms.map(k => `${k.term}: ${k.definition}`).join('\n')}`;
    text += `\n\nSummary:\n${result.summary}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={18} /> Back to Tools
      </button>

      {!result ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <FileText size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">AI Lesson Note Maker</h2>
          </div>
          
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" 
                placeholder="e.g. History, Biology, Literature" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
              <input 
                value={topic} 
                onChange={e => setTopic(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" 
                placeholder="e.g. World War II, Cell Structure, Shakespeare's Sonnets" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
              <input 
                value={grade} 
                onChange={e => setGrade(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900" 
                placeholder="e.g. 8th Grade, High School Sophomore" 
              />
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={isLoading || !topic || !grade || !subject}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />} Generate Notes
            </button>
          </div>
        </div>
      ) : (
        <ResultCard title={`${result.topic} - Class Notes`} onCopy={copyText}>
          <div className="space-y-6 text-slate-800">
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 border-b border-slate-100 pb-4">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{result.subject}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full">{result.gradeLevel}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-bold text-lg mb-2 text-slate-900">Introduction</h4>
              <p className="text-slate-700">{result.introduction}</p>
            </div>

            <div className="space-y-6">
                {result.sections.map((section, i) => (
                   <div key={i}>
                      <h4 className="font-bold text-xl mb-2 text-blue-800">{section.heading}</h4>
                      <div className="text-slate-700 whitespace-pre-line leading-relaxed">{section.content}</div>
                   </div>
                ))}
            </div>

             <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
              <h4 className="font-bold text-lg mb-3 text-yellow-800">Key Terms</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.keyTerms.map((item, i) => (
                   <li key={i} className="text-sm">
                      <span className="font-bold text-slate-900">{item.term}:</span> <span className="text-slate-700">{item.definition}</span>
                   </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 text-slate-900">Summary</h4>
              <p className="text-slate-700 italic">{result.summary}</p>
            </div>

            <button onClick={() => setResult(null)} className="text-blue-600 font-medium hover:underline mt-4 block">
                Generate Another
            </button>
          </div>
        </ResultCard>
      )}
    </div>
  );
};

// --- NOTE SUMMARIZER ---

export const NoteSummarizer = ({ onBack }: { onBack: () => void }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'SUMMARIZE' | 'EXPLAIN'>('SUMMARIZE');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NoteSummary | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!content && !image) return;
    setIsLoading(true);
    try {
      const summary = await summarizeNote(content, image || undefined, mode);
      setResult(summary);
    } catch (e) {
      alert("Failed to summarize notes");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    if (!result) return;
    const text = `Title: ${result.title}\n\nSummary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.map(k => `- ${k}`).join('\n')}\n\nAction Items:\n${(result.actionableItems || []).map(a => `- ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={18} /> Back to Tools
      </button>

      {!result ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <ScanLine size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Note Summarizer & Explainer</h2>
          </div>
          
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="flex p-1 bg-slate-100 rounded-lg">
                <button 
                    onClick={() => setMode('SUMMARIZE')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'SUMMARIZE' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                >
                    Summarize Notes
                </button>
                <button 
                    onClick={() => setMode('EXPLAIN')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'EXPLAIN' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                >
                    Explain & Simplify
                </button>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Paste Text</label>
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)}
                        rows={5}
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-900" 
                        placeholder="Paste your notes, essay, or article here..." 
                    />
                </div>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">OR</span>
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">Scan/Upload Image</label>
                     
                     {image ? (
                        <div className="relative group inline-block">
                             <img src={image} alt="Note scan" className="h-40 rounded-lg border border-slate-200 object-cover" />
                             <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                                <X size={14} />
                             </button>
                        </div>
                     ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors"
                        >
                            <Upload className="text-slate-400 mb-2" size={24} />
                            <p className="text-sm text-slate-500">Click to upload a photo of your notes</p>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                     )}
                </div>
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={isLoading || (!content && !image)}
              className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />} {mode === 'SUMMARIZE' ? 'Summarize' : 'Explain'}
            </button>
          </div>
        </div>
      ) : (
        <ResultCard title={result.title || "Note Summary"} onCopy={copyText}>
           <div className="space-y-6">
             <div>
                <h4 className="font-bold text-lg mb-2 text-orange-800">{mode === 'SUMMARIZE' ? 'Summary' : 'Explanation'}</h4>
                <p className="text-slate-800 leading-relaxed">{result.summary}</p>
             </div>
             
             <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider">Key Points</h4>
                <ul className="space-y-2">
                    {result.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-2 text-slate-700">
                            <span className="text-orange-500 font-bold">•</span>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
             </div>

             {result.actionableItems && result.actionableItems.length > 0 && (
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-sm text-orange-900 mb-3 uppercase tracking-wider">Action / Study Items</h4>
                    <ul className="space-y-2">
                         {result.actionableItems.map((item, i) => (
                            <li key={i} className="flex gap-2 text-slate-800">
                                <Check size={16} className="text-orange-600 mt-1 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
             )}
           </div>

           <button onClick={() => setResult(null)} className="text-orange-600 font-medium hover:underline mt-6 block">
                Process Another Note
            </button>
        </ResultCard>
      )}
    </div>
  );
};