import React, { useState } from 'react';
import { BookOpen, HelpCircle, MessageCircle, Wand2, Copy, Check, Loader2, ArrowLeft } from 'lucide-react';
import { generateLessonPlan, generateQuiz, generateIcebreaker } from '../services/geminiService';
import { LessonPlan, Quiz, Icebreaker } from '../types';

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