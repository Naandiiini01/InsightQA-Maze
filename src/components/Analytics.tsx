import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Study, StudyResponse } from '../types';
import { getTasks, getQuestions } from '../utils/studyUtils';
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
  const [selectedResponse, setSelectedResponse] = useState<StudyResponse | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | 'all'>('all');
  const [showHeatmap, setShowHeatmap] = useState(true);
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

  const taskData = getTasks(study).map(task => {
    const taskResponses = responses.flatMap(r => r.results || []).filter(res => res.taskId === task.id);
    const successCount = taskResponses.filter(res => res.success).length;
    return {
      name: task.title.substring(0, 15) + '...',
      successRate: (successCount / (responses.length || 1)) * 100,
      avgTime: taskResponses.reduce((acc, res) => acc + res.time, 0) / (taskResponses.length || 1)
    };
  });

  const COLORS = ['#0066FF', '#E9ECEF'];

  const filteredClicks = selectedResponse?.metrics.clicks?.filter((c: any) => 
    selectedTaskId === 'all' || c.taskId === selectedTaskId
  ) || [];

  if (loading) return <div className="text-center py-20">Loading analytics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Session Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-2 md:p-8">
          <div className="bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] rounded-2xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 md:p-6 border-b border-[#E9ECEF] flex flex-col md:flex-row md:items-center justify-between bg-white gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A]">Session Detail</h3>
                  <p className="text-xs md:text-sm text-[#6C757D] truncate">ID: {selectedResponse.participantId} • {new Date(selectedResponse.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="hidden md:block h-10 w-px bg-[#E9ECEF]" />

                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-widest">Task:</span>
                    <select 
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg px-2 py-1 text-xs md:text-sm font-medium outline-none focus:ring-2 focus:ring-[#0066FF] transition-all"
                    >
                      <option value="all">All</option>
                      {getTasks(study).map((t, i) => (
                        <option key={t.id} value={t.id}>T{i + 1}: {t.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-[10px] md:text-sm font-bold transition-all flex items-center gap-2 ${
                      showHeatmap ? "bg-[#0066FF] text-white" : "bg-[#F8F9FA] text-[#6C757D] border border-[#E9ECEF]"
                    }`}
                  >
                    <Target size={14} />
                    {showHeatmap ? 'Heatmap' : 'Heatmap'}
                  </button>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedResponse(null);
                  setSelectedTaskId('all');
                }}
                className="absolute top-4 right-4 md:relative md:top-0 md:right-0 p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"
              >
                <ArrowLeft size={24} className="rotate-90 md:rotate-0" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Prototype View with Heatmap Overlay */}
              <div className="flex-1 bg-[#F8F9FA] relative overflow-hidden group min-h-[300px] md:min-h-0">
                {selectedResponse.variantUrl ? (
                  <div className="w-full h-full relative">
                    <iframe 
                      src={selectedResponse.variantUrl.includes('figma.com') 
                        ? `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(selectedResponse.variantUrl)}`
                        : selectedResponse.variantUrl
                      }
                      className="w-full h-full border-none pointer-events-none"
                    />
                    {/* Click Overlay */}
                    {showHeatmap && (
                      <div className="absolute inset-0 z-10">
                        {filteredClicks.map((click: any, i: number) => (
                          <div 
                            key={i}
                            className="absolute w-8 h-8 bg-red-500/30 border-2 border-red-500/50 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg animate-in zoom-in duration-300 flex items-center justify-center"
                            style={{ left: `${click.x}%`, top: `${click.y}%`, animationDelay: `${i * 50}ms` }}
                          >
                            <div className="w-1 h-1 bg-red-600 rounded-full" />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                              Click {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#ADB5BD]">
                    No variant URL available for this session
                  </div>
                )}
              </div>

              {/* Session Stats Sidebar */}
              <div className="w-full md:w-80 border-l border-[#E9ECEF] bg-white overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-4">Performance</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#495057]">Success Rate</span>
                      <span className="text-lg font-bold text-green-600">{selectedResponse.metrics.successRate.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#495057]">Time Taken</span>
                      <span className="text-lg font-bold">{selectedResponse.metrics.timeTaken.toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#495057]">Total Clicks</span>
                      <span className="text-lg font-bold">{selectedResponse.metrics.clicks?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-4">Task Results</h4>
                  <div className="space-y-3">
                    {selectedResponse.results?.filter(r => r.taskId).map((res, i) => {
                      const task = getTasks(study).find(t => t.id === res.taskId);
                      return (
                        <div key={i} className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#6C757D]">Task {i + 1}</span>
                            {res.success ? (
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">Success</span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">Failed</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-[#1A1A1A] line-clamp-1">{task?.title || 'Untitled Task'}</p>
                          <p className="text-xs text-[#6C757D] mt-1">{res.time.toFixed(1)}s taken</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-4">Question Answers</h4>
                  <div className="space-y-3">
                    {selectedResponse.results?.filter((r: any) => r.questionId).map((res: any, i: number) => {
                      const question = getQuestions(study).find(q => q.id === res.questionId);
                      return (
                        <div key={i} className="space-y-1">
                          <p className="text-xs font-bold text-[#1A1A1A]">{question?.text}</p>
                          <p className="text-sm text-[#6C757D] italic">"{res.answer || 'No answer'}"</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[#6C757D] hover:text-[#1A1A1A] font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Studies
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-bold hover:bg-[#F8F9FA] transition-all">
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] truncate">{study.title}</h1>
          <p className="text-sm md:text-base text-[#6C757D] mt-1">Results for {responses.length} participants</p>
        </div>
        <button 
          onClick={handleGenerateAI}
          disabled={analyzing || responses.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg disabled:opacity-50 text-sm md:text-base"
        >
          <Sparkles size={20} className={analyzing ? "animate-pulse" : ""} />
          {analyzing ? "Analyzing..." : "AI Insights"}
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
          <p className="text-xs text-[#6C757D] mt-1">Based on {getTasks(study).length} tasks</p>
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
                    <button 
                      onClick={() => setSelectedResponse(res)}
                      className="text-[#0066FF] font-bold text-sm hover:underline"
                    >
                      View Session
                    </button>
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
