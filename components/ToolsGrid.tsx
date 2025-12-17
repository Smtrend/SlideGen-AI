import React from 'react';
import { BookOpen, HelpCircle, MessageCircle, Presentation, FileText, ScanLine } from 'lucide-react';
import { ToolId } from '../types';

interface ToolsGridProps {
  onSelectTool: (tool: ToolId) => void;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({ onSelectTool }) => {
  const tools = [
    {
      id: ToolId.SLIDE_GENERATOR,
      title: "AI Slide Generator",
      description: "Transform text into professional presentations with images.",
      icon: <Presentation className="text-white" size={32} />,
      color: "bg-indigo-600",
      hoverColor: "group-hover:text-indigo-600",
      bgSoft: "bg-indigo-50"
    },
    {
      id: ToolId.LESSON_PLANNER,
      title: "AI Lesson Plan Generator",
      description: "Make grade-specific classroom lessons with AI.",
      icon: <BookOpen className="text-white" size={32} />,
      color: "bg-purple-600",
      hoverColor: "group-hover:text-purple-600",
      bgSoft: "bg-purple-50"
    },
    {
      id: ToolId.LESSON_NOTE_MAKER,
      title: "AI Lesson Note Maker",
      description: "Create detailed, structured study notes for any topic.",
      icon: <FileText className="text-white" size={32} />,
      color: "bg-blue-600",
      hoverColor: "group-hover:text-blue-600",
      bgSoft: "bg-blue-50"
    },
    {
      id: ToolId.QUIZ_MAKER,
      title: "AI Quiz Maker",
      description: "Generate ready-to-use quizzes with one click.",
      icon: <HelpCircle className="text-white" size={32} />,
      color: "bg-pink-600",
      hoverColor: "group-hover:text-pink-600",
      bgSoft: "bg-pink-50"
    },
    {
      id: ToolId.NOTE_SUMMARIZER,
      title: "Note Summarizer & Scanner",
      description: "Scan notes or paste text to summarize and explain.",
      icon: <ScanLine className="text-white" size={32} />,
      color: "bg-orange-600",
      hoverColor: "group-hover:text-orange-600",
      bgSoft: "bg-orange-50"
    },
    {
      id: ToolId.ICEBREAKER,
      title: "AI Icebreaker Generator",
      description: "Create fun classroom activities with AI.",
      icon: <MessageCircle className="text-white" size={32} />,
      color: "bg-emerald-600",
      hoverColor: "group-hover:text-emerald-600",
      bgSoft: "bg-emerald-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className={`text-left p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white flex flex-col md:flex-row gap-6 items-start md:items-center ${tool.bgSoft} bg-opacity-30 hover:bg-opacity-100`}
        >
          <div className={`${tool.color} p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            {tool.icon}
          </div>
          <div>
            <h3 className={`text-xl font-bold text-slate-900 ${tool.hoverColor} transition-colors mb-2`}>
              {tool.title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};