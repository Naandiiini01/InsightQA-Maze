import React from 'react';
import { 
  FileText, 
  Target, 
  Users, 
  Sparkles,
  ArrowRight,
  Layout,
  MessageSquare,
  Search
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  tasks: number;
  questions: number;
}

const templates: Template[] = [
  {
    id: 'usability-test',
    title: 'Usability Test',
    description: 'Evaluate how easily users can complete specific tasks on your prototype.',
    icon: Target,
    color: 'bg-blue-50 text-blue-600',
    tasks: 3,
    questions: 2
  },
  {
    id: 'concept-validation',
    title: 'Concept Validation',
    description: 'Gather feedback on early-stage ideas or visual designs.',
    icon: Sparkles,
    color: 'bg-purple-50 text-purple-600',
    tasks: 1,
    questions: 5
  },
  {
    id: 'user-survey',
    title: 'User Survey',
    description: 'Collect quantitative and qualitative feedback from your target audience.',
    icon: MessageSquare,
    color: 'bg-green-50 text-green-600',
    tasks: 0,
    questions: 10
  },
  {
    id: 'navigation-test',
    title: 'Navigation Test',
    description: 'Test the information architecture and menu structure of your product.',
    icon: Layout,
    color: 'bg-orange-50 text-orange-600',
    tasks: 5,
    questions: 1
  }
];

export const Templates: React.FC<{ onUseTemplate: (templateId: string) => void }> = ({ onUseTemplate }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Template Library</h1>
        <p className="text-[#6C757D] mt-1">Start with a pre-built study structure to save time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div 
            key={template.id}
            className="group bg-white p-8 rounded-3xl border border-[#E9ECEF] hover:border-[#0066FF] hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            onClick={() => onUseTemplate(template.id)}
          >
            <div className="space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${template.color}`}>
                <template.icon size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#0066FF] transition-colors">{template.title}</h3>
                <p className="text-[#6C757D] mt-2 leading-relaxed">{template.description}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F8F9FA] flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#495057]">
                  <Target size={14} className="text-[#ADB5BD]" />
                  {template.tasks} Tasks
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#495057]">
                  <MessageSquare size={14} className="text-[#ADB5BD]" />
                  {template.questions} Questions
                </div>
              </div>
              <div className="w-10 h-10 bg-[#F8F9FA] group-hover:bg-[#0066FF] group-hover:text-white rounded-full flex items-center justify-center transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Template Section */}
      <div className="bg-[#1A1A1A] rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Search size={200} />
        </div>
        <div className="relative z-10 max-w-xl space-y-6">
          <h2 className="text-3xl font-bold">Need a custom structure?</h2>
          <p className="text-white/60 text-lg">
            Build your study from scratch with our flexible builder. You can add as many tasks and questions as you need.
          </p>
          <button 
            onClick={() => onUseTemplate('scratch')}
            className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-[#F8F9FA] transition-all"
          >
            Start from Scratch
          </button>
        </div>
      </div>
    </div>
  );
};
