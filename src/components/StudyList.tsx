import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { Study } from '../types';
import { getTasks, getQuestions } from '../utils/studyUtils';
import { getShareableUrl, copyToClipboard } from '../utils/url';
import { 
  MoreVertical, 
  Play, 
  BarChart2, 
  Trash2, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const StudyList: React.FC<{ 
  onSelectStudy: (study: Study) => void, 
  onRunTest: (studyId: string) => void,
  onCreateStudy: () => void
}> = ({ onSelectStudy, onRunTest, onCreateStudy }) => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'studies'), 
      where('ownerId', '==', auth.currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Study))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setStudies(data);
      setLoading(false);
    }, (error) => {
      console.error("StudyList Studies Listener Error:", error);
      setLoading(false);
    });

    // Fetch response counts for each study - filtered by ownerId
    const qResponses = query(
      collection(db, 'responses'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsubscribeResponses = onSnapshot(qResponses, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const studyId = doc.data().studyId;
        counts[studyId] = (counts[studyId] || 0) + 1;
      });
      setResponseCounts(counts);
    }, (error) => {
      console.error("StudyList Responses Listener Error:", error);
    });

    return () => {
      unsubscribe();
      unsubscribeResponses();
    };
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'studies', id));
    setDeleteConfirmId(null);
  };

  const toggleStatus = async (study: Study) => {
    const newStatus = study.status === 'active' ? 'completed' : 'active';
    await updateDoc(doc(db, 'studies', study.id), { status: newStatus });
  };

  const copyLink = async (id: string) => {
    const link = getShareableUrl(`?test=${id}`);
    const success = await copyToClipboard(link);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) return <div className="text-center py-20 text-[#6C757D]">Loading your studies...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {studies.map((study) => (
          <div key={study.id} className="bg-white rounded-2xl border border-[#E9ECEF] shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                  study.status === 'active' ? 'bg-green-100 text-green-700' : 
                  study.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {study.status}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => copyLink(study.id)}
                    className="p-2 text-[#ADB5BD] hover:text-[#0066FF] transition-colors"
                    title="Copy participant link"
                  >
                    {copiedId === study.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(study.id)}
                    className="p-2 text-[#ADB5BD] hover:text-[#DC3545] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {deleteConfirmId === study.id && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10">
                  <p className="font-bold text-sm mb-4 text-[#1A1A1A]">Delete this study?</p>
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-2 text-xs font-bold border border-[#E9ECEF] rounded-lg hover:bg-[#F8F9FA]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleDelete(study.id)}
                      className="flex-1 py-2 text-xs font-bold bg-[#DC3545] text-white rounded-lg hover:bg-[#C82333]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0066FF] transition-colors">{study.title}</h3>
              <p className="text-sm text-[#6C757D] mb-6 line-clamp-2">
                {getTasks(study).length} tasks • {getQuestions(study).length} questions • {study.type}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#F8F9FA]">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, responseCounts[study.id] || 0))].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-[#E9ECEF] border-2 border-white flex items-center justify-center text-[8px] font-bold">
                        P{i+1}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#6C757D]">
                    {responseCounts[study.id] || 0} participants
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onRunTest(study.id)}
                    className="p-2 bg-[#F8F9FA] text-[#495057] rounded-lg hover:bg-[#E9ECEF] transition-colors"
                    title="Preview Test"
                  >
                    <Play size={16} />
                  </button>
                  <button 
                    onClick={() => onSelectStudy(study)}
                    className="px-4 py-2 bg-[#0066FF] text-white rounded-lg text-sm font-bold hover:bg-[#0052CC] transition-all"
                  >
                    View Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {studies.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#E9ECEF] flex flex-col items-center">
          <h3 className="text-xl font-bold text-[#1A1A1A]">No studies found</h3>
          <p className="text-[#6C757D] mt-2 mb-8">Create your first study to start collecting user insights.</p>
          <button 
            onClick={onCreateStudy}
            className="flex items-center gap-2 px-8 py-4 bg-[#0066FF] text-white rounded-2xl font-bold hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-100"
          >
            <Play size={20} className="fill-current" /> Create New Study
          </button>
        </div>
      )}
    </div>
  );
};
