import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Study, StudyResponse } from '../types';
import { generateStudyInsights } from '../services/geminiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Sparkles, 
  ArrowLeft, 
  Users, 
  Clock, 
  Target,
  Download
} from 'lucide-react';
import Markdown from 'react-markdown';

export const Analytics: React.FC<{ study: Study, onBack: () => void }> = ({ study, onBack }) => {
  const [responses, setResponses] = useState<StudyResponse[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'responses'), 
      where('studyId', '==', study.id),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyResponse));
      setResponses(data);
      setLoading(false);
    }, (error) => {
      console.error("Analytics Responses Listener Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [study.id]);

  const handleGenerateAI = async () => {
    setAnalyzing(true);
    const insights = await generateStudyInsights(study, responses);
    setAiInsights(insights);
    setAnalyzing(false);
  };

  const successData = [
    { name: 'Success', value: responses.reduce((acc, r) => acc + r.metrics.successRate, 0) / (responses.length || 1) },
    { name: 'Failure', value: 100 - (responses.reduce((acc, r) => acc + r.metrics.successRate, 0) / (responses.length || 1)) }
  ];

  const taskData = study.tasks.map(task => {
    const taskResponses = responses.flatMap(r => r.results).filter(res => res.taskId === task.id);
    const successCount = taskResponses.filter(res => res.success).length;
    return {
      name: task.title.substring(0, 15) + '...',
      successRate: (successCount / (responses.length || 1)) * 100,
      avgTime: taskResponses.reduce((acc, res) => acc + res.time, 0) / (taskResponses.length || 1)
    };
  });

  const COLORS = ['#0066FF', '#E9ECEF'];

  if (loading) return <div className="text-center py-20">Loading analytics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[#6C757D] hover:text-[#1A1A1A] font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Studies
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-bold hover:bg-[#F8F9FA] transition-all">
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">{study.title}</h1>
          <p className="text-[#6C757D] mt-1">Results for {responses.length} participants</p>
        </div>
        <button 
          onClick={handleGenerateAI}
          disabled={analyzing || responses.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg disabled:opacity-50"
        >
          <Sparkles size={20} className={analyzing ? "animate-pulse" : ""} />
          {analyzing ? "Analyzing with AI..." : "Generate AI Insights"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-[#0066FF] rounded-lg"><Users size={20} /></div>
            <h3 className="font-bold text-[#495057]">Participants</h3>
          </div>
          <p className="text-3xl font-bold">{responses.length}</p>
          <p className="text-xs text-[#6C757D] mt-1">Total responses collected</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Target size={20} /></div>
            <h3 className="font-bold text-[#495057]">Avg. Success</h3>
          </div>
          <p className="text-3xl font-bold">
            {(responses.reduce((acc, r) => acc + r.metrics.successRate, 0) / (responses.length || 1)).toFixed(1)}%
          </p>
          <p className="text-xs text-[#6C757D] mt-1">Based on {study.tasks.length} tasks</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock size={20} /></div>
            <h3 className="font-bold text-[#495057]">Avg. Time</h3>
          </div>
          <p className="text-3xl font-bold">
            {(responses.reduce((acc, r) => acc + r.metrics.timeTaken, 0) / (responses.length || 1)).toFixed(1)}s
          </p>
          <p className="text-xs text-[#6C757D] mt-1">Per session</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Success Rate Chart */}
        <div className="bg-white p-8 rounded-3xl border border-[#E9ECEF] shadow-sm">
          <h3 className="text-lg font-bold mb-8">Overall Success Rate</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {successData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-bold text-[#1A1A1A]">{successData[0].value.toFixed(0)}%</span>
              <span className="text-xs text-[#6C757D] font-bold uppercase tracking-widest">Success</span>
            </div>
          </div>
        </div>

        {/* Task Performance Chart */}
        <div className="bg-white p-8 rounded-3xl border border-[#E9ECEF] shadow-sm">
          <h3 className="text-lg font-bold mb-8">Task Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6C757D', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6C757D', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="successRate" fill="#0066FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {aiInsights && (
        <div className="bg-[#1A1A1A] text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Sparkles size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-blue-400" />
              <h2 className="text-2xl font-bold">AI Summary & Findings</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <Markdown>{aiInsights}</Markdown>
            </div>
          </div>
        </div>
      )}

      {/* Participant List */}
      <div className="bg-white rounded-3xl border border-[#E9ECEF] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#E9ECEF]">
          <h3 className="text-lg font-bold">Participant Responses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] text-[#6C757D] text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Success Rate</th>
                <th className="px-6 py-4">Time Taken</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF]">
              {responses.map((res) => (
                <tr key={res.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4 font-medium">{res.participantId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{width: `${res.metrics.successRate}%`}} />
                      </div>
                      <span className="text-sm font-bold">{res.metrics.successRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#495057]">{res.metrics.timeTaken.toFixed(1)}s</td>
                  <td className="px-6 py-4 text-sm text-[#6C757D]">{new Date(res.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#0066FF] font-bold text-sm hover:underline">View Session</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
