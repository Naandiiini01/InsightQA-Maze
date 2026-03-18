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

export const Dashboard: React.FC<{ 
  setActiveTab: (tab: string) => void,
  onNewProject: () => void,
  onNewStudy: () => void,
  onSelectStudy: (study: Study) => void
}> = ({ setActiveTab, onNewProject, onNewStudy, onSelectStudy }) => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    activeStudies: 0,
    totalParticipants: 0,
    avgSuccessRate: 0,
    insightsGenerated: 0
  });

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

    // Fetch recent activity (responses)
    const qActivity = query(
      collection(db, 'responses'),
      where('ownerId', '==', auth.currentUser.uid),
      limit(5)
    );
    const unsubscribeActivity = onSnapshot(qActivity, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setRecentActivity(data);
    }, (error) => {
      console.error("Dashboard Activity Listener Error:", error);
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
      unsubscribeActivity();
      unsubscribeStats();
      unsubscribeResponses();
    };
  }, []);

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
                  <div 
                    key={study.id} 
                    onClick={() => onSelectStudy(study)}
                    className="p-5 hover:bg-[#F8F9FA] transition-colors flex items-center justify-between group cursor-pointer"
                  >
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
                  onClick={onNewStudy}
                  className="px-6 py-2 bg-[#0066FF] text-white rounded-lg font-medium"
                >
                  Create Study
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-[#E9ECEF] overflow-hidden">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-[#E9ECEF]">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-[#F8F9FA] transition-colors flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 bg-blue-50 text-[#0066FF] rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-[#1A1A1A]">
                        <span className="font-bold">{activity.participantId || 'A participant'}</span> completed a session
                      </p>
                      <p className="text-[10px] text-[#6C757D] mt-0.5">
                        {new Date(activity.createdAt).toLocaleTimeString()} • {activity.metrics?.successRate.toFixed(0)}% success
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[#6C757D] text-sm italic">
                No recent activity to show.
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold pt-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={onNewProject}
              className="p-4 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#0066FF] hover:shadow-sm transition-all text-left flex items-center gap-3"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Plus size={18} /></div>
              <span className="font-medium text-sm">New Project</span>
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className="p-4 bg-white border border-[#E9ECEF] rounded-xl hover:border-[#0066FF] hover:shadow-sm transition-all text-left flex items-center gap-3"
            >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText size={18} /></div>
              <span className="font-medium text-sm">Use Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
