import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { StudyType, Task, Question, Project } from '../types';
import { 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Type, 
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  FolderOpen
} from 'lucide-react';

export const StudyBuilder: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [prototypeUrl, setPrototypeUrl] = useState('');
  const [type, setType] = useState<StudyType>('prototype');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
    }, (error) => {
      console.error("Firestore Error (Projects):", error);
    });
    return () => unsubscribe();
  }, []);

  const addTask = () => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      instructions: '',
      successPath: ''
    };
    setTasks([...tasks, newTask]);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      type: 'mcq',
      required: true,
      options: ['Option 1']
    };
    setQuestions([...questions, newQuestion]);
  };

  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!auth.currentUser) {
      setError("Please sign in to save studies");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a study title");
      return;
    }

    if ((type === 'prototype' || type === 'website') && !prototypeUrl.trim()) {
      setError("Please enter a prototype or website URL");
      return;
    }

    if (tasks.length > 0 && tasks.some(t => !t.title.trim())) {
      setError("Please enter a title for all tasks");
      return;
    }

    if (tasks.length > 0 && tasks.some(t => !t.instructions.trim())) {
      setError("Please enter instructions for all tasks");
      return;
    }

    if (questions.length > 0 && questions.some(q => !q.text.trim())) {
      setError("Please enter text for all questions");
      return;
    }

    if (questions.some(q => q.type === 'mcq' && (!q.options || q.options.length === 0 || q.options.some(opt => !opt.trim())))) {
      setError("Please provide at least one non-empty option for all multiple choice questions");
      return;
    }
    
    setSaving(true);
    setError(null);

    const studyData = {
      title: title.trim(),
      type,
      projectId: projectId || null,
      ownerId: auth.currentUser.uid,
      tasks: tasks.map(t => ({ 
        id: t.id,
        title: t.title || 'Untitled Task',
        instructions: t.instructions || '',
        successPath: t.successPath || ''
      })),
      questions: questions.map(q => ({ 
        id: q.id,
        text: q.text || 'Untitled Question',
        type: q.type,
        required: q.required,
        options: q.options || []
      })),
      status: 'draft' as const,
      config: { showTimer: true },
      prototypeUrl: prototypeUrl.trim() || '',
      createdAt: new Date().toISOString()
    };

    console.log('Current User:', auth.currentUser?.uid);
    console.log('Attempting to save study:', studyData);
    
    try {
      const docRef = await addDoc(collection(db, 'studies'), studyData);
      console.log('Study saved with ID:', docRef.id);
      onComplete();
    } catch (err: any) {
      console.error("Save Error:", err);
      // Try to get a friendly message from our helper
      try {
        handleFirestoreError(err, OperationType.CREATE, 'studies');
      } catch (e: any) {
        // If it's our JSON error, parse it for a better message
        try {
          const parsed = JSON.parse(e.message);
          setError(`Permission Error: ${parsed.error}. Please check all fields.`);
        } catch {
          setError(e.message || "Failed to save study. Please check your permissions.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E9ECEF] shadow-xl overflow-hidden mb-8">
      <div className="p-4 md:p-8 border-b border-[#E9ECEF] bg-[#F8F9FA]/50">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Create a new study</h2>
        <p className="text-[#6C757D] text-sm mt-1">Set up your usability test, survey, or task list.</p>
      </div>

      {/* Stepper */}
      <div className="flex border-b border-[#E9ECEF] overflow-x-auto no-scrollbar">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`flex-1 min-w-[100px] py-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              step === s ? 'text-[#0066FF] border-b-2 border-[#0066FF]' : 'text-[#ADB5BD]'
            }`}
          >
            Step {s}: {s === 1 ? 'Setup' : s === 2 ? 'Tasks' : 'Questions'}
          </div>
        ))}
      </div>

      <div className="p-4 md:p-8 min-h-[400px] md:min-h-[500px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <label className="block text-sm font-bold text-[#495057] uppercase tracking-wide mb-2">
                Study Title <span className="text-[#DC3545]">*</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Checkout Flow Usability Test"
                className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl focus:ring-2 focus:ring-[#0066FF] outline-none transition-all text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#495057] uppercase tracking-wide mb-2">
                Prototype / Website URL {(type === 'prototype' || type === 'website') && <span className="text-[#DC3545]">*</span>}
              </label>
              <input 
                type="url" 
                value={prototypeUrl}
                onChange={(e) => setPrototypeUrl(e.target.value)}
                placeholder="e.g. https://www.figma.com/proto/..."
                className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl focus:ring-2 focus:ring-[#0066FF] outline-none transition-all text-lg"
              />
              <p className="text-xs text-[#6C757D] mt-2 italic">
                * For Figma, make sure the prototype is set to "Anyone with the link can view".
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#495057] uppercase tracking-wide mb-2">Assign to Project (Optional)</label>
              <div className="relative">
                <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={20} />
                <select 
                  value={projectId || ''}
                  onChange={(e) => setProjectId(e.target.value || null)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl focus:ring-2 focus:ring-[#0066FF] outline-none transition-all appearance-none"
                >
                  <option value="">No Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#495057] uppercase tracking-wide mb-4">Study Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'prototype', label: 'Prototype Test', desc: 'Test interactive designs' },
                  { id: 'survey', label: 'Survey', desc: 'Collect user feedback' },
                  { id: 'website', label: 'Website URL', desc: 'Test live websites' },
                  { id: 'task', label: 'Task List', desc: 'Specific QA tasks' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id as StudyType)}
                    className={`p-6 text-left rounded-2xl border-2 transition-all ${
                      type === t.id ? 'border-[#0066FF] bg-[#F0F7FF]' : 'border-[#E9ECEF] hover:border-[#ADB5BD]'
                    }`}
                  >
                    <h4 className="font-bold text-[#1A1A1A]">{t.label}</h4>
                    <p className="text-sm text-[#6C757D] mt-1">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Define Tasks</h3>
              <button onClick={addTask} className="flex items-center gap-2 text-[#0066FF] font-bold hover:underline">
                <Plus size={20} /> Add Task
              </button>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-[#DEE2E6]">
                <p className="text-[#6C757D]">No tasks added yet. Add tasks for participants to complete.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, idx) => (
                  <div key={task.id} className="p-6 bg-white border border-[#E9ECEF] rounded-2xl shadow-sm space-y-4 relative group">
                    <button 
                      onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                      className="absolute top-4 right-4 text-[#ADB5BD] hover:text-[#DC3545] transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-[#0066FF] text-white rounded-full flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-widest mb-1">
                          Task Title <span className="text-[#DC3545]">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Find the login button"
                          className="w-full font-bold text-lg outline-none"
                          value={task.title}
                          onChange={(e) => {
                            const newTasks = [...tasks];
                            newTasks[idx].title = e.target.value;
                            setTasks(newTasks);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6C757D] uppercase tracking-widest pl-1">
                        Instructions <span className="text-[#DC3545]">*</span>
                      </label>
                      <textarea 
                        placeholder="Instructions for the participant..."
                        className="w-full p-4 bg-[#F8F9FA] rounded-xl outline-none min-h-[100px]"
                        value={task.instructions}
                        onChange={(e) => {
                          const newTasks = [...tasks];
                          newTasks[idx].instructions = e.target.value;
                          setTasks(newTasks);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6C757D] uppercase tracking-widest pl-1">Success Screen / Path (Optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g. /checkout or 'Success Page'"
                        className="w-full p-3 bg-[#F8F9FA] rounded-xl outline-none text-sm border border-transparent focus:border-[#0066FF]/20"
                        value={task.successPath || ''}
                        onChange={(e) => {
                          const newTasks = [...tasks];
                          newTasks[idx].successPath = e.target.value;
                          setTasks(newTasks);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Follow-up Questions</h3>
              <button onClick={addQuestion} className="flex items-center gap-2 text-[#0066FF] font-bold hover:underline">
                <Plus size={20} /> Add Question
              </button>
            </div>
            {questions.length === 0 ? (
              <div className="text-center py-12 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-[#DEE2E6]">
                <p className="text-[#6C757D]">No questions added yet. Ask questions after tasks are completed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-6 bg-white border border-[#E9ECEF] rounded-2xl shadow-sm space-y-4 relative">
                    <button 
                      onClick={() => setQuestions(questions.filter(item => item.id !== q.id))}
                      className="absolute top-4 right-4 text-[#ADB5BD] hover:text-[#DC3545]"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                      <Type size={20} className="text-[#0066FF]" />
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-widest mb-1">
                          Question Text <span className="text-[#DC3545]">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. How easy was it to complete this task?"
                          className="w-full font-bold outline-none"
                          value={q.text}
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[idx].text = e.target.value;
                            setQuestions(newQs);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <select 
                        className="p-2 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF] text-sm"
                        value={q.type}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[idx].type = e.target.value as any;
                          if (newQs[idx].type === 'mcq' && !newQs[idx].options) {
                            newQs[idx].options = ['Option 1'];
                          }
                          setQuestions(newQs);
                        }}
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="open-ended">Open Ended</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-[#495057]">
                        <input 
                          type="checkbox" 
                          checked={q.required}
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[idx].required = e.target.checked;
                            setQuestions(newQs);
                          }}
                        />
                        Required
                      </label>
                    </div>

                    {q.type === 'mcq' && (
                      <div className="space-y-2 pl-8">
                        <label className="text-xs font-bold text-[#6C757D] uppercase">
                          Options <span className="text-[#DC3545]">*</span>
                        </label>
                        {q.options?.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input 
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newQs = [...questions];
                                if (newQs[idx].options) {
                                  newQs[idx].options![optIdx] = e.target.value;
                                  setQuestions(newQs);
                                }
                              }}
                              className="flex-1 p-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-sm"
                              placeholder={`Option ${optIdx + 1}`}
                            />
                            <button 
                              onClick={() => {
                                const newQs = [...questions];
                                if (newQs[idx].options && newQs[idx].options!.length > 1) {
                                  newQs[idx].options = newQs[idx].options!.filter((_, i) => i !== optIdx);
                                  setQuestions(newQs);
                                }
                              }}
                              className="text-[#ADB5BD] hover:text-[#DC3545]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newQs = [...questions];
                            if (newQs[idx].options) {
                              newQs[idx].options!.push(`Option ${newQs[idx].options!.length + 1}`);
                              setQuestions(newQs);
                            }
                          }}
                          className="text-sm text-[#0066FF] font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-6 bg-[#F8F9FA] border-t border-[#E9ECEF] space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            {error}
          </div>
        )}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 md:px-6 py-2 text-[#495057] font-bold disabled:opacity-30 text-sm md:text-base"
          >
            <ChevronLeft size={20} /> Back
          </button>
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 md:px-8 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all text-sm md:text-base"
            >
              Continue <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 md:px-8 py-3 bg-[#0066FF] text-white rounded-xl font-bold hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-200 disabled:opacity-50 text-sm md:text-base"
            >
              {saving ? 'Saving...' : 'Finish & Save'} <Save size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
