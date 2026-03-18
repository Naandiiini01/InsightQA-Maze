import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, addDoc, collection, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { Study, StudyResponse, Task, Question, Participant } from '../types';
import { 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Timer,
  MousePointer2,
  AlertCircle,
  UserPlus,
  Target
} from 'lucide-react';

export const ParticipantFlow: React.FC<{ studyId: string, onComplete: () => void }> = ({ studyId, onComplete }) => {
  const [study, setStudy] = useState<Study | null>(null);
  const [step, setStep] = useState<'signup' | 'intro' | 'tasks' | 'questions' | 'thanks'>('intro');
  const [participant, setParticipant] = useState<Partial<Participant> | null>(null);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [showMission, setShowMission] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [clicks, setClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isRecruit = params.get('recruit') === 'true';
    
    const fetchStudy = async () => {
      if (!studyId) {
        setLoading(false);
        if (isRecruit) setStep('signup');
        return;
      }

      const docRef = doc(db, 'studies', studyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStudy({ id: docSnap.id, ...docSnap.data() } as Study);
        if (isRecruit) {
          setStep('signup');
        }
      } else {
        // If study doesn't exist but it's a recruitment link, still allow signup
        if (isRecruit) setStep('signup');
      }
      setLoading(false);
    };
    fetchStudy();
  }, [studyId]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    setLoading(true);
    setError(null);
    try {
      // Create or find participant
      const pData: Partial<Participant> = {
        email,
        name,
        ownerId: study?.ownerId || 'system', // Default if no study
        status: studyId ? 'active' : 'completed', // Completed if it's just a general signup
        assignedStudyId: studyId || null,
        completionRate: 0,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'participants'), pData);
      setParticipant({ id: docRef.id, ...pData });
      
      if (studyId) {
        setStep('intro');
      } else {
        setStep('thanks');
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError("Failed to join the study. Please try again.");
    }
    setLoading(false);
  };

  const handleStart = async () => {
    setStep('tasks');
    setShowMission(true);
    setStartTime(Date.now());
    
    if (participant?.id) {
      try {
        await updateDoc(doc(db, 'participants', participant.id), {
          status: 'active',
          lastActive: new Date().toISOString()
        });
      } catch (err) {
        console.error("Update Participant Error:", err);
      }
    }
  };

  const handleTaskComplete = (success: boolean) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const task = study!.tasks[currentTaskIdx];
    setResults([...results, { taskId: task.id, success, time: timeTaken }]);
    
    if (currentTaskIdx < study!.tasks.length - 1) {
      setCurrentTaskIdx(currentTaskIdx + 1);
      setShowMission(true);
      setStartTime(Date.now());
    } else {
      setStep('questions');
    }
  };

  const handleQuestionSubmit = (answer: string) => {
    const question = study!.questions[currentQuestionIdx];
    const newResults = [...results];
    newResults.push({ questionId: question.id, answer });
    setResults(newResults);

    if (currentQuestionIdx < study!.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      submitResponse();
    }
  };

  const submitResponse = async () => {
    const totalTime = results.reduce((acc, r) => acc + (r.time || 0), 0);
    const successCount = results.filter(r => r.success).length;
    const completionRate = Math.round((successCount / study!.tasks.length) * 100);
    
    const response: Partial<StudyResponse> = {
      studyId,
      ownerId: study!.ownerId,
      participantId: participant?.id || 'anon-' + Math.random().toString(36).substr(2, 5),
      results,
      metrics: {
        timeTaken: totalTime,
        successRate: completionRate,
        clicks: clicks,
      },
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'responses'), response);
      
      if (participant?.id) {
        await updateDoc(doc(db, 'participants', participant.id), {
          status: 'completed',
          completionRate,
          timeTaken: totalTime,
          lastActive: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Submit Response Error:", err);
      setError("Failed to submit results. Please try again.");
      return;
    }

    setStep('thanks');
  };

  const trackClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setClicks([...clicks, { x, y, timestamp: Date.now() }]);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading test...</div>;
  if (!study) return <div className="flex items-center justify-center min-h-screen">Study not found.</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-4 md:px-8 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">I</span>
          </div>
          <span className="font-bold text-[#1A1A1A] truncate text-sm md:text-base">{study.title}</span>
        </div>
        <div className="text-[10px] md:text-sm font-medium text-[#6C757D] whitespace-nowrap ml-2">
          {step === 'tasks' && `Task ${currentTaskIdx + 1}/${study.tasks.length}`}
          {step === 'questions' && `Q ${currentQuestionIdx + 1}/${study.questions.length}`}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
        <div className="max-w-2xl w-full h-full md:h-auto bg-white rounded-2xl md:rounded-3xl shadow-xl border border-[#E9ECEF] overflow-hidden flex flex-col">
          {step === 'signup' && (
            <div className="p-6 md:p-12 space-y-6 md:space-y-8 overflow-y-auto">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#F0F7FF] text-[#0066FF] rounded-2xl flex items-center justify-center mx-auto">
                  <UserPlus size={28} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Join the Study</h1>
                <p className="text-sm md:text-base text-[#6C757D]">Please provide your details to begin the test.</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#495057]">Full Name</label>
                  <input 
                    name="name"
                    required
                    className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF]"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#495057]">Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    required
                    className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF]"
                    placeholder="Enter your email"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#0066FF] text-white rounded-xl font-bold text-lg hover:bg-[#0052CC] transition-all disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Continue to Test'}
                </button>
              </form>
            </div>
          )}

          {step === 'intro' && (
            <div className="p-6 md:p-12 text-center space-y-6 overflow-y-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F0F7FF] text-[#0066FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Play size={32} fill="currentColor" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Welcome to the Test</h1>
              <p className="text-sm md:text-lg text-[#6C757D]">
                Thank you for participating. You will be asked to complete a series of tasks and answer a few questions.
              </p>
              <div className="bg-[#F8F9FA] p-4 md:p-6 rounded-2xl text-left space-y-3">
                <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-[#495057]">
                  <Timer size={16} className="text-[#0066FF]" />
                  Takes about 5-10 minutes
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-[#495057]">
                  <MousePointer2 size={16} className="text-[#0066FF]" />
                  Your interactions will be recorded
                </div>
              </div>
              <button 
                onClick={handleStart}
                className="w-full py-3 md:py-4 bg-[#0066FF] text-white rounded-2xl font-bold text-base md:text-lg hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-100"
              >
                Get Started
              </button>
            </div>
          )}

          {step === 'tasks' && (
            <div className="flex flex-col h-full md:h-[600px] relative">
              {showMission && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                  <div className="max-w-md w-full space-y-6 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-[#0066FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target size={28} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-[10px] md:text-sm font-bold text-[#0066FF] uppercase tracking-widest">Mission {currentTaskIdx + 1}</h2>
                      <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">{study.tasks[currentTaskIdx].title}</h3>
                    </div>
                    <p className="text-sm md:text-lg text-[#6C757D] leading-relaxed">
                      {study.tasks[currentTaskIdx].instructions}
                    </p>
                    {study.tasks[currentTaskIdx].successPath && (
                      <div className="p-2 md:p-3 bg-green-50 text-green-700 rounded-xl text-xs md:text-sm font-medium inline-block">
                        Goal: Reach {study.tasks[currentTaskIdx].successPath}
                      </div>
                    )}
                    <button 
                      onClick={() => setShowMission(false)}
                      className="w-full py-3 md:py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-base md:text-lg hover:bg-black transition-all shadow-lg"
                    >
                      Begin Mission
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 md:p-8 border-b border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-between flex-shrink-0">
                <div className="min-w-0">
                  <h2 className="text-[8px] md:text-[10px] font-bold text-[#0066FF] uppercase tracking-widest mb-1">Current Mission</h2>
                  <h3 className="text-sm md:text-lg font-bold text-[#1A1A1A] truncate">{study.tasks[currentTaskIdx].title}</h3>
                </div>
                <button 
                  onClick={() => setShowMission(true)}
                  className="p-2 text-[#6C757D] hover:bg-white rounded-lg transition-colors flex-shrink-0"
                  title="View Instructions"
                >
                  <AlertCircle size={18} />
                </button>
              </div>
              
              <div 
                className="flex-1 bg-white relative cursor-crosshair overflow-hidden"
                onClick={trackClick}
              >
                {/* Interactive Prototype View */}
                <div className="absolute inset-0">
                  {study.prototypeUrl ? (
                    <div className="w-full h-full flex flex-col">
                      <iframe 
                        src={study.prototypeUrl.includes('figma.com') 
                          ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(study.prototypeUrl)}`
                          : study.prototypeUrl
                        }
                        className="w-full h-full border-none"
                        allowFullScreen
                      />
                      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10 flex flex-col gap-2 md:gap-3 items-end">
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl shadow-xl border border-[#E9ECEF] flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-[#495057]">
                          <div className="flex items-center gap-1.5">
                            <Timer size={12} className="text-[#0066FF]" />
                            <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MousePointer2 size={12} className="text-[#0066FF]" />
                            <span>{clicks.filter(c => c.taskId === study.tasks[currentTaskIdx].id).length} clicks</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="px-4 py-2 md:px-6 md:py-3 bg-white text-[#6C757D] border border-[#E9ECEF] rounded-xl md:rounded-2xl font-bold shadow-lg hover:bg-[#F8F9FA] transition-all text-xs md:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskComplete(false);
                            }}
                          >
                            Skip
                          </button>
                          <button 
                            className="px-5 py-2 md:px-8 md:py-3 bg-[#0066FF] text-white rounded-xl md:rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskComplete(true);
                            }}
                          >
                            <CheckCircle2 size={16} />
                            Finish
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 border-4 border-dashed border-[#DEE2E6] rounded-3xl m-4">
                      <AlertCircle size={48} className="text-[#ADB5BD] mb-4" />
                      <h4 className="text-xl font-bold text-[#1A1A1A]">Interactive Prototype Area</h4>
                      <p className="text-[#6C757D] mt-2">No prototype URL was provided for this study.</p>
                      <button 
                        className="mt-8 px-8 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskComplete(true);
                        }}
                      >
                        I've completed the task
                      </button>
                      <button 
                        className="mt-4 text-[#6C757D] font-medium hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskComplete(false);
                        }}
                      >
                        I'm stuck / skip task
                      </button>
                    </div>
                  )}
                </div>

                {/* Click Indicators (Visual Feedback) - Only visible if not blocked by iframe */}
                {clicks.map((c, i) => (
                  <div 
                    key={i} 
                    className="absolute w-4 h-4 bg-[#0066FF]/30 border border-[#0066FF] rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping pointer-events-none z-20"
                    style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div className="p-12 space-y-8">
              <div className="space-y-2">
                <span className="text-sm font-bold text-[#0066FF] uppercase tracking-widest">Feedback</span>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">{study.questions[currentQuestionIdx].text}</h2>
              </div>

              {study.questions[currentQuestionIdx].type === 'mcq' ? (
                <div className="space-y-3">
                  {study.questions[currentQuestionIdx].options?.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleQuestionSubmit(opt)}
                      className="w-full p-4 text-left border-2 border-[#E9ECEF] rounded-xl hover:border-[#0066FF] hover:bg-[#F0F7FF] font-medium transition-all flex items-center justify-between group"
                    >
                      {opt}
                      <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea 
                    className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none min-h-[150px] focus:ring-2 focus:ring-[#0066FF]"
                    placeholder="Type your answer here..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleQuestionSubmit((e.target as HTMLTextAreaElement).value);
                      }
                    }}
                  />
                  <button 
                    className="w-full py-4 bg-[#0066FF] text-white rounded-xl font-bold"
                    onClick={() => {
                      const val = (document.querySelector('textarea') as HTMLTextAreaElement).value;
                      handleQuestionSubmit(val);
                    }}
                  >
                    Submit Answer
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'thanks' && (
            <div className="p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {studyId ? 'Test Completed!' : 'Registration Complete!'}
              </h1>
              <p className="text-[#6C757D] text-lg">
                {studyId 
                  ? 'Your feedback has been recorded. This data will help the product team improve the experience.'
                  : 'Thank you for joining our tester pool. We will contact you when new studies are available.'}
              </p>
              <button 
                onClick={onComplete}
                className="px-8 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
