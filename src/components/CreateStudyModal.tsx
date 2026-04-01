import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Plus, 
  Layout, 
  MessageSquare, 
  Target, 
  Sparkles, 
  Search,
  ArrowLeft,
  Zap,
  Users,
  Video
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFromScratch: () => void;
  onSelectTemplate: (templateId: string) => void;
}

type ModalStep = 'SELECT_TYPE' | 'SELECT_TEMPLATE';

export const CreateStudyModal: React.FC<CreateStudyModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartFromScratch,
  onSelectTemplate
}) => {
  const [step, setStep] = useState<ModalStep>('SELECT_TYPE');
  const [selectedCategory, setSelectedCategory] = useState('All templates');

  if (!isOpen) return null;

  const studyTypes = [
    {
      id: 'unmoderated',
      title: 'Unmoderated study',
      description: 'Set up surveys and usability tests for prototypes, websites, and apps.',
      icon: Zap,
      color: 'text-[#0066FF]',
      bgColor: 'bg-[#F0F7FF]'
    },
    {
      id: 'ai-moderated',
      title: 'AI-moderated',
      description: 'Use AI to guide voice interactions based on a script you define.',
      icon: Sparkles,
      color: 'text-[#8A3FFC]',
      bgColor: 'bg-[#F6F2FF]',
      badge: 'ADD-ON'
    },
    {
      id: 'moderated',
      title: 'Moderated interviews',
      description: 'Schedule and run interviews, then turn transcripts into insights.',
      icon: Video,
      color: 'text-[#00BFA5]',
      bgColor: 'bg-[#E0F2F1]'
    }
  ];

  const categories = [
    'Custom templates',
    'All templates',
    'Content Testing',
    'Concept Validation',
    'Idea Validation',
    'Copy Testing',
    'Satisfaction Survey',
    'Feedback Survey',
    'Usability Testing',
    'Wireframe Testing'
  ];

  const templates = [
    {
      id: 'usability-test',
      title: 'Standard Usability Test',
      category: 'Usability Testing',
      desc: 'Usability Testing • Prototype',
      image: 'https://picsum.photos/seed/usability/400/250'
    },
    {
      id: 'concept-validation',
      title: 'Concept Validation Study',
      category: 'Concept Validation',
      desc: 'Concept Validation • Prototype',
      image: 'https://picsum.photos/seed/concept/400/250'
    },
    {
      id: 'card-sorting',
      title: 'Run closed card sorting',
      category: 'Concept Validation',
      desc: 'Content Testing • Concept Validation',
      image: 'https://picsum.photos/seed/cards/400/250'
    },
    {
      id: 'cta-placement',
      title: 'Test CTA placement',
      category: 'Content Testing',
      desc: 'Content Testing • Concept Validation',
      image: 'https://picsum.photos/seed/cta/400/250'
    },
    {
      id: 'product-discovery',
      title: 'Run a product discovery survey',
      category: 'Idea Validation',
      desc: 'Idea Validation • Survey',
      image: 'https://picsum.photos/seed/discovery/400/250',
      badge: 'PRO'
    },
    {
      id: 'cloze-test',
      title: 'Run a cloze test',
      category: 'Content Testing',
      desc: 'Content Testing • Website',
      image: 'https://picsum.photos/seed/cloze/400/250'
    },
    {
      id: 'navigation-test',
      title: 'Navigation & IA Test',
      category: 'Usability Testing',
      desc: 'Usability Testing • Navigation',
      image: 'https://picsum.photos/seed/nav/400/250'
    }
  ];

  const filteredTemplates = selectedCategory === 'All templates' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className={cn(
        "relative bg-white rounded-[32px] shadow-2xl overflow-hidden transition-all duration-500 flex flex-col",
        step === 'SELECT_TYPE' ? "max-w-3xl w-full" : "max-w-6xl w-full h-[85vh]"
      )}>
        {/* Header */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-[#E9ECEF]">
          <div className="flex items-center gap-4">
            {step === 'SELECT_TEMPLATE' && (
              <button 
                onClick={() => setStep('SELECT_TYPE')}
                className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-[#495057]" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-[#1A1A1A]">
              {step === 'SELECT_TYPE' ? 'Create a study' : 'Create a new study'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"
          >
            <X size={24} className="text-[#ADB5BD]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'SELECT_TYPE' ? (
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {studyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setStep('SELECT_TEMPLATE')}
                  className="group p-8 text-left rounded-3xl border-2 border-[#E9ECEF] hover:border-[#0066FF] hover:shadow-xl transition-all relative flex flex-col h-full"
                >
                  {type.badge && (
                    <span className="absolute top-4 right-4 bg-[#F8F9FA] border border-[#E9ECEF] text-[10px] font-bold px-2 py-0.5 rounded-full text-[#6C757D]">
                      {type.badge}
                    </span>
                  )}
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", type.bgColor)}>
                    <type.icon size={28} className={type.color} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{type.title}</h3>
                  <p className="text-sm text-[#6C757D] leading-relaxed mb-6 flex-1">{type.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 border-r border-[#E9ECEF] p-6 space-y-8 overflow-y-auto hidden md:block">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-4">Custom templates</h4>
                  <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-[#495057] hover:bg-[#F8F9FA] rounded-lg group">
                    <span>Custom templates</span>
                    <span className="bg-[#F8F9FA] border border-[#E9ECEF] text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <X size={10} /> ENT
                    </span>
                  </button>
                  <button 
                    onClick={() => setSelectedCategory('All templates')}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      selectedCategory === 'All templates' ? "bg-[#F0F7FF] text-[#0066FF]" : "text-[#495057] hover:bg-[#F8F9FA]"
                    )}
                  >
                    <span>All templates</span>
                    <span className="text-[10px] opacity-50">0</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-4">Templates</h4>
                  {categories.slice(1).map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                        selectedCategory === cat ? "bg-[#F0F7FF] text-[#0066FF]" : "text-[#495057] hover:bg-[#F8F9FA]"
                      )}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-50">
                        {cat === 'All templates' ? '55' : Math.floor(Math.random() * 15) + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Grid */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-6">Create your own study</h3>
                  <button 
                    onClick={onStartFromScratch}
                    className="w-full p-6 bg-white border-2 border-[#E9ECEF] hover:border-[#0066FF] rounded-3xl flex items-center gap-6 group transition-all"
                  >
                    <div className="w-16 h-16 bg-[#F0F7FF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Layout size={32} className="text-[#0066FF]" />
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-lg font-bold text-[#1A1A1A]">Start from scratch</h4>
                      <p className="text-sm text-[#6C757D]">Begin with a blank slate and select your own study blocks</p>
                    </div>
                    <ChevronRight size={24} className="text-[#ADB5BD] group-hover:text-[#0066FF] group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-6">Start from a Template</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTemplates.map((template) => (
                      <div 
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        className="group bg-white border border-[#E9ECEF] hover:border-[#0066FF] rounded-3xl overflow-hidden cursor-pointer transition-all hover:shadow-xl"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={template.image} 
                            alt={template.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {template.badge && (
                            <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-[#E9ECEF] text-[10px] font-bold px-2 py-0.5 rounded text-[#F27D26]">
                              {template.badge}
                            </span>
                          )}
                        </div>
                        <div className="p-6">
                          <h4 className="font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0066FF] transition-colors">{template.title}</h4>
                          <p className="text-xs text-[#6C757D]">{template.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
