import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Participant, Study } from '../types';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  Users, 
  Mail, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  Trash2, 
  ExternalLink,
  Filter,
  Search,
  Plus,
  Sparkles,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ParticipantsProps {
  onRecruit: () => void;
  user: any;
}

export const Participants: React.FC<ParticipantsProps> = ({ onRecruit, user }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [studies, setStudies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'invited' | 'completed' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // Fetch participants
    const q = query(
      collection(db, 'participants'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
      setParticipants(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error (Participants):", err);
      setError("Failed to load participants. Please check your permissions.");
      setLoading(false);
    });

    // Fetch studies for mapping names
    const qStudies = query(
      collection(db, 'studies'),
      where('ownerId', '==', user.uid)
    );
    const unsubscribeStudies = onSnapshot(qStudies, (snapshot) => {
      const mapping: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        mapping[doc.id] = doc.data().title;
      });
      setStudies(mapping);
    }, (err) => {
      console.error("Firestore Error (Studies Mapping):", err);
    });

    return () => {
      unsubscribe();
      unsubscribeStudies();
    };
  }, [user]);

  const handleGenerateAI = async () => {
    setAnalyzing(true);
    const prompt = `
      Analyze the following participant pool for a user testing platform:
      Total Participants: ${participants.length}
      Status Breakdown: 
      - Invited: ${participants.filter(p => p.status === 'invited').length}
      - Active: ${participants.filter(p => p.status === 'active').length}
      - Completed: ${participants.filter(p => p.status === 'completed').length}
      
      Avg Completion Rate: ${Math.round(participants.reduce((acc, p) => acc + (p.completionRate || 0), 0) / (participants.filter(p => p.status === 'completed').length || 1))}%
      
      Please provide a brief summary of the recruitment health and any suggestions to improve participation.
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setAiInsights(response.text || "Failed to generate insights.");
    } catch (err) {
      console.error(err);
      setAiInsights("Error generating AI insights.");
    }
    setAnalyzing(false);
  };

  const filteredParticipants = participants.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch = p.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: participants.length,
    active: participants.filter(p => p.status === 'active').length,
    completed: participants.filter(p => p.status === 'completed').length,
    avgCompletion: participants.length > 0 
      ? Math.round(participants.reduce((acc, p) => acc + p.completionRate, 0) / participants.length)
      : 0
  };

  if (loading) return <div className="text-center py-20 text-[#6C757D]">Loading participants...</div>;

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 mb-4 font-bold">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Participants</h1>
          <p className="text-[#6C757D] mt-1">Manage and recruit testers for your studies</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateAI}
            disabled={analyzing || participants.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-xl text-sm font-bold hover:bg-[#F8F9FA] transition-all disabled:opacity-50"
          >
            <Sparkles size={18} className={cn("text-blue-600", analyzing && "animate-pulse")} />
            {analyzing ? "Analyzing..." : "AI Insights"}
          </button>
          <button 
            onClick={onRecruit}
            className="flex items-center gap-2 px-6 py-3 bg-[#0066FF] text-white rounded-xl font-bold hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} />
            Recruit Testers
          </button>
        </div>
      </div>

      {/* AI Insights Modal */}
      {aiInsights && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1A1A1A] text-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-blue-400" size={20} />
                <h3 className="font-bold text-lg">AI Recruitment Insights</h3>
              </div>
              <button 
                onClick={() => setAiInsights('')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-white/50" />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="prose prose-invert max-w-none">
                <Markdown>{aiInsights}</Markdown>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setAiInsights('')}
                className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Participants', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Tests', value: stats.active, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg. Completion', value: `${stats.avgCompletion}%`, icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E9ECEF] flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-[#E9ECEF] overflow-hidden">
        <div className="p-6 border-b border-[#E9ECEF] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#F8F9FA] px-4 py-2 rounded-xl border border-[#E9ECEF] flex-1 max-w-md">
            <Search size={18} className="text-[#ADB5BD]" />
            <input 
              type="text" 
              placeholder="Search participants..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#F8F9FA] p-1 rounded-xl border border-[#E9ECEF]">
              {(['all', 'invited', 'active', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                    activeFilter === filter 
                      ? "bg-white text-[#1A1A1A] shadow-sm" 
                      : "text-[#6C757D] hover:text-[#1A1A1A]"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button 
              onClick={onRecruit}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
            >
              <Plus size={18} />
              Recruit
            </button>
          </div>
        </div>

        {filteredParticipants.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">No participants found</h3>
            <p className="text-[#6C757D] max-w-xs mx-auto mb-8">
              {searchQuery ? "Try adjusting your search or filters." : "Start by recruiting your first tester to see them here."}
            </p>
            {!searchQuery && (
              <button 
                onClick={onRecruit}
                className="px-6 py-2.5 bg-[#0066FF] text-white rounded-xl font-bold hover:bg-[#0052CC] transition-all"
              >
                + Add First Participant
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
                  <th className="px-6 py-4 text-xs font-bold text-[#6C757D] uppercase tracking-wider">Participant</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6C757D] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6C757D] uppercase tracking-wider">Assigned Study</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6C757D] uppercase tracking-wider">Completion</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6C757D] uppercase tracking-wider">Time Taken</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6C757D] uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF]">
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-[#1A1A1A]">{p.name || 'Anonymous'}</p>
                        <p className="text-xs text-[#6C757D]">{p.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        p.status === 'completed' ? "bg-green-50 text-green-700" :
                        p.status === 'active' ? "bg-blue-50 text-blue-700" :
                        "bg-gray-50 text-gray-600"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#495057]">
                        {p.assignedStudyId ? (studies[p.assignedStudyId] || 'Loading...') : 'Not Assigned'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className="h-full bg-[#0066FF] rounded-full" 
                            style={{ width: `${p.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{p.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#6C757D]">
                        {p.timeTaken ? `${Math.floor(p.timeTaken / 60)}m ${p.timeTaken % 60}s` : '--'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-[#ADB5BD] hover:text-[#1A1A1A] transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
