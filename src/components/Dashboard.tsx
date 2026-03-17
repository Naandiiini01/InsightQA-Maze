import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, limit, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Study, Project } from '../types';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  X,
  FolderPlus
} from 'lucide-react';

export const Dashboard: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    activeStudies: 0,
    totalParticipants: 0,
    avgSuccessRate: 0,
    insightsGenerated: 0
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch recent studies
    const q = query(
      collection(db, 'studies'), 
      where('ownerId', '==', auth.currentUser.uid),
      limit(20) // Get more and sort client-side
    );
    
    const unsubscribeStudies = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Study))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setStudies(data);
      setLoading(false);
    }, (error) => {
      console.error("Dashboard Studies Listener Error:", error);
      setLoading(false);
    });

    // Fetch all studies for count
    const qAllStudies = query(
      collection(db, 'studies'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsubscribeStats = onSnapshot(qAllStudies, (snapshot) => {
      const activeCount = snapshot.docs.filter(d => d.data().status === 'active').length;
      setStatsData(prev => ({ ...prev, activeStudies: activeCount }));
    }, (error) => {
      console.error("Dashboard Stats Listener Error:", error);
    });

    // Fetch responses for participants count - filtered by ownerId
    const qResponses = query(
      collection(db, 'responses'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsubscribeResponses = onSnapshot(qResponses, (respSnapshot) => {
      const totalResp = respSnapshot.size;
      
      // Calculate success rate if data exists
      let totalSuccess = 0;
      let countWithMetrics = 0;
      respSnapshot.docs.forEach(doc => {
        const metrics = doc.data().metrics;
        if (metrics && typeof metrics.successRate === 'number') {
          totalSuccess += metrics.successRate;
          countWithMetrics++;
        }
      });

      setStatsData(prev => ({
        ...prev,
        totalParticipants: totalResp,
        avgSuccessRate: countWithMetrics > 0 ? Math.round(totalSuccess / countWithMetrics) : 0,
        insightsGenerated: prev.activeStudies * 3 // Use current activeStudies
      }));
    }, (error) => {
      console.error("Dashboard Responses Listener Error:", error);
    });

    return () => {
      unsubscribeStudies();
      unsubscribeStats();
      unsubscribeResponses();
    };
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !auth.currentUser) return;

    setCreatingProject(true);
    try {
      await addDoc(collection(db, 'projects'), {
        name: projectName,
        description: projectDesc,
        ownerId: auth.currentUser.uid,
        workspaceId: 'default', // For now
        createdAt: new Date().toISOString()
      });
      setShowProjectModal(false);
      setProjectName('');
      setProjectDesc('');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreatingProject(false);
    }
  };

  const stats = [
    { label: 'Active Studies', value: statsData.activeStudies.toString(), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Participants', value: statsData.totalParticipants.toLocaleString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg. Success Rate', value: `${statsData.avgSuccessRate}%`, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Insights Generated', value: statsData.insightsGenerated.toString(), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-[#6C757D] text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Studies */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Studies</h2>
            <button 
              onClick={() => setActiveTab('studies')}
              className="text-sm font-medium text-[#0066FF] hover:underline"
            >
              View all
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-[#E9ECEF] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#6C757D]">Loading studies...</div>
            ) : studies.length > 0 ? (
              <div className="divide-y divide-[#E9ECEF]">
                {studies.map((study) => (
                  <div key={study.id} className="p-5 hover:bg-[#F8F9FA] transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        study.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {study.status === 'active' ? <Clock size={20} /> : <FileText size={20} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1A1A1A]">{study.title}</h4>
                        <p className="text-xs text-[#6C757D] capitalize">{study.type} • {new Date(study.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                        study.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {study.status}
                      </span>
                      <ArrowRight size={18} className="text-[#ADB5BD] group-hover:text-[#0066FF] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={32} className="text-[#ADB5BD]" />
                </div>
                <h3 className="text-[#1A1A1A] font-bold">No studies yet</h3>
                <p className="text-[#6C757D] text-sm mt-1 mb-6">Create your first study to start gathering insights.</p>
                <button 
                  onClick={() => setActiveTab('create-study')}
                  className="px-6 py-2 bg-[#0066FF] text-white rounded-lg font-medium"
                >
                  Create Study
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => setShowProjectModal(true)}
              className="p-4 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#0066FF] hover:shadow-sm transition-all text-left flex items-center gap-3"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Plus size={18} /></div>
              <span className="font-medium text-sm">New Project</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-4 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#0066FF] hover:shadow-sm transition-all text-left flex items-center gap-3"
            >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18} /></div>
              <span className="font-medium text-sm">Invite Team</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="p-4 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#0066FF] hover:shadow-sm transition-all text-left flex items-center gap-3"
            >
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={18} /></div>
              <span className="font-medium text-sm">View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#E9ECEF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FolderPlus size={20} />
                </div>
                <h3 className="font-bold text-lg">Create New Project</h3>
              </div>
              <button 
                onClick={() => setShowProjectModal(false)}
                className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"
              >
                <X size={20} className="text-[#ADB5BD]" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#495057] mb-1.5">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Mobile App Redesign"
                  className="w-full p-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl focus:ring-2 focus:ring-[#0066FF] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#495057] mb-1.5">Description (Optional)</label>
                <textarea 
                  rows={3}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="What is this project about?"
                  className="w-full p-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl focus:ring-2 focus:ring-[#0066FF] outline-none transition-all resize-none"
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 py-3 border border-[#E9ECEF] text-[#495057] font-bold rounded-xl hover:bg-[#F8F9FA] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creatingProject}
                  className="flex-1 py-3 bg-[#0066FF] text-white font-bold rounded-xl hover:bg-[#0052CC] transition-all disabled:opacity-50"
                >
                  {creatingProject ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
