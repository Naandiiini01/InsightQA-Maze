import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { StudyBuilder } from './components/StudyBuilder';
import { StudyList } from './components/StudyList';
import { ProjectList } from './components/ProjectList';
import { ParticipantFlow } from './components/ParticipantFlow';
import { Analytics } from './components/Analytics';
import { Participants } from './components/Participants';
import { Study, Participant } from './types';
import { Users, X, Check, ChevronDown } from 'lucide-react';
import { getShareableUrl, copyToClipboard } from './utils/url';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [testStudyId, setTestStudyId] = useState<string | null>(null);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [copiedRecruit, setCopiedRecruit] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [selectedStudyId, setSelectedStudyId] = useState<string>('');
  const [myStudies, setMyStudies] = useState<Study[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [isParticipantMode, setIsParticipantMode] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchStudies = async () => {
        const q = query(collection(db, 'studies'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        setMyStudies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Study)));
      };
      fetchStudies();
    }
  }, [user, showRecruitModal]);

  useEffect(() => {
    // Check for participant test link or recruitment link
    const params = new URLSearchParams(window.location.search);
    const testId = params.get('test');
    const studyId = params.get('studyId');
    const isRecruit = params.get('recruit') === 'true';

    if (testId || isRecruit) {
      setIsParticipantMode(true);
      setTestStudyId(testId || studyId);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#6C757D] font-medium">Initializing InsightQA...</p>
        </div>
      </div>
    );
  }

  // If user is taking a test or signing up
  if (isParticipantMode) {
    return (
      <ParticipantFlow 
        studyId={testStudyId || ''} 
        onComplete={() => {
          setIsParticipantMode(false);
          setTestStudyId(null);
          window.history.replaceState({}, '', window.location.pathname);
        }} 
      />
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    if (selectedStudy) {
      return <Analytics study={selectedStudy} onBack={() => setSelectedStudy(null)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'projects':
        return <ProjectList setActiveTab={setActiveTab} />;
      case 'studies':
        return (
          <StudyList 
            onSelectStudy={(study) => setSelectedStudy(study)} 
            onRunTest={(id) => setTestStudyId(id)}
          />
        );
      case 'create-study':
        return <StudyBuilder onComplete={() => setActiveTab('studies')} />;
      case 'participants':
        return <Participants user={user} onRecruit={() => setShowRecruitModal(true)} />;
      case 'analytics':
        return (
          <div className="bg-white p-12 rounded-3xl border border-[#E9ECEF] text-center">
            <h2 className="text-xl font-bold mb-2">Global Analytics</h2>
            <p className="text-[#6C757D]">View cross-study performance and workspace-wide metrics.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-[#E9ECEF]">
              <h3 className="text-lg font-bold mb-4">Workspace Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#495057] mb-1">Workspace Name</label>
                  <input type="text" defaultValue="My Workspace" className="w-full p-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg" />
                </div>
                <button className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm font-bold">Save Changes</button>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#E9ECEF]">
              <h3 className="text-lg font-bold mb-4 text-[#DC3545]">Danger Zone</h3>
              <p className="text-sm text-[#6C757D] mb-4">Deleting your workspace will permanently remove all studies and data.</p>
              <button className="px-4 py-2 border border-[#DC3545] text-[#DC3545] rounded-lg text-sm font-bold hover:bg-[#FFF5F5]">Delete Workspace</button>
            </div>
          </div>
        );
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onSignOut={handleSignOut} 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedStudy(null);
      }}
    >
      {renderContent()}

      {showRecruitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#E9ECEF] flex items-center justify-between">
              <h3 className="font-bold text-lg">Recruit Participants</h3>
              <button 
                onClick={() => setShowRecruitModal(false)}
                className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"
              >
                <X size={20} className="text-[#ADB5BD]" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-bold text-[#495057]">Assign to Study (Optional)</p>
                <div className="relative">
                  <select 
                    value={selectedStudyId}
                    onChange={(e) => setSelectedStudyId(e.target.value)}
                    className="w-full p-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none appearance-none focus:ring-2 focus:ring-[#0066FF] transition-all text-sm"
                  >
                    <option value="">General Recruitment</option>
                    {myStudies.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ADB5BD] pointer-events-none" />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium mb-2">Share recruitment link</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={getShareableUrl(`?recruit=true${selectedStudyId ? `&studyId=${selectedStudyId}` : ''}`)}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-mono text-blue-600 cursor-text"
                  />
                  <button 
                    onClick={async () => {
                      const url = getShareableUrl(`?recruit=true${selectedStudyId ? `&studyId=${selectedStudyId}` : ''}`);
                      const success = await copyToClipboard(url);
                      if (success) {
                        setCopiedRecruit(true);
                        setTimeout(() => setCopiedRecruit(false), 2000);
                      }
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-w-[80px] justify-center",
                      copiedRecruit ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {copiedRecruit ? (
                      <>
                        <Check size={14} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <span>Copy</span>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-blue-500 mt-2 italic">
                  * Use this link for external testers. Do not copy the URL from your browser's address bar.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-[#495057]">Invite via Email</p>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Tester Name"
                    className="w-full p-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF] transition-all text-sm"
                  />
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="tester@example.com"
                    className="w-full p-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:ring-2 focus:ring-[#0066FF] transition-all text-sm"
                  />
                </div>
                
                {sendSuccess ? (
                  <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <Check size={16} />
                    Invitation sent successfully!
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button 
                      disabled={!inviteEmail || isSending}
                      onClick={async () => {
                        if (!inviteEmail.includes('@')) {
                          alert('Please enter a valid email address');
                          return;
                        }
                        
                        setIsSending(true);
                        
                        try {
                          // Save to Firestore
                          await addDoc(collection(db, 'participants'), {
                            email: inviteEmail,
                            name: inviteName || 'Anonymous',
                            ownerId: user?.uid,
                            status: 'invited',
                            assignedStudyId: selectedStudyId || null,
                            completionRate: 0,
                            createdAt: new Date().toISOString()
                          });

                          // Simulate sending delay
                          await new Promise(resolve => setTimeout(resolve, 1000));
                          
                          setIsSending(false);
                          setSendSuccess(true);
                          setInviteEmail('');
                          setInviteName('');
                          
                          setTimeout(() => {
                            setSendSuccess(false);
                            setShowRecruitModal(false);
                          }, 2000);
                        } catch (err) {
                          console.error(err);
                          setIsSending(false);
                          alert('Failed to send invitation');
                        }
                      }}
                      className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Invitation</span>
                      )}
                    </button>
                    
                    <button 
                      onClick={async () => {
                        const url = getShareableUrl(`?recruit=true${selectedStudyId ? `&studyId=${selectedStudyId}` : ''}`);
                        
                        // Save as invited before opening mail client
                        await addDoc(collection(db, 'participants'), {
                          email: inviteEmail,
                          name: inviteName || 'Anonymous',
                          ownerId: user?.uid,
                          status: 'invited',
                          assignedStudyId: selectedStudyId || null,
                          completionRate: 0,
                          createdAt: new Date().toISOString()
                        });

                        const subject = encodeURIComponent('Invitation to participate in a usability study');
                        const body = encodeURIComponent(`Hi,\n\nI'd like to invite you to participate in a usability study. You can access the study here: ${url}\n\nThanks!`);
                        window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
                        setShowRecruitModal(false);
                      }}
                      className="w-full py-2 text-xs font-bold text-[#6C757D] hover:text-[#1A1A1A] transition-colors"
                    >
                      Or open in your email client
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
