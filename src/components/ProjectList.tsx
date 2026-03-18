import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Project, Study } from '../types';
import { 
  Folder, 
  MoreVertical, 
  Trash2, 
  Plus,
  ArrowRight,
  Beaker
} from 'lucide-react';

export const ProjectList: React.FC<{ 
  setActiveTab: (tab: string) => void,
  onNewProject: () => void
}> = ({ setActiveTab, onNewProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const qProjects = query(
      collection(db, 'projects'), 
      where('ownerId', '==', auth.currentUser.uid)
    );
    
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Project))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjects(data);
      setLoading(false);
    }, (error) => {
      console.error("ProjectList Projects Listener Error:", error);
      setLoading(false);
    });

    const qStudies = query(
      collection(db, 'studies'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsubscribeStudies = onSnapshot(qStudies, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Study));
      setStudies(data);
    }, (error) => {
      console.error("ProjectList Studies Listener Error:", error);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeStudies();
    };
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'projects', id));
    setDeleteConfirmId(null);
  };

  const getStudyCount = (projectId: string) => {
    return studies.filter(s => s.projectId === projectId).length;
  };

  if (loading) return <div className="text-center py-20 text-[#6C757D]">Loading your projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Projects</h2>
        <button 
          onClick={onNewProject}
          className="px-4 py-2 bg-[#0066FF] text-white rounded-lg text-sm font-bold hover:bg-[#0052CC] transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl border border-[#E9ECEF] shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 text-[#0066FF] rounded-xl">
                  <Folder size={24} />
                </div>
                <button 
                  onClick={() => setDeleteConfirmId(project.id)}
                  className="p-2 text-[#ADB5BD] hover:text-[#DC3545] transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {deleteConfirmId === project.id && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10">
                  <p className="font-bold text-sm mb-4 text-[#1A1A1A]">Delete this project?</p>
                  <p className="text-xs text-[#6C757D] mb-6">This will not delete the studies within it.</p>
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-2 text-xs font-bold border border-[#E9ECEF] rounded-lg hover:bg-[#F8F9FA]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="flex-1 py-2 text-xs font-bold bg-[#DC3545] text-white rounded-lg hover:bg-[#C82333]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0066FF] transition-colors">{project.name}</h3>
              <p className="text-sm text-[#6C757D] mb-6 line-clamp-2 min-h-[40px]">
                {project.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#F8F9FA]">
                <div className="flex items-center gap-2 text-[#6C757D]">
                  <Beaker size={16} />
                  <span className="text-xs font-bold">{getStudyCount(project.id)} Studies</span>
                </div>
                <button 
                  onClick={() => setActiveTab('studies')}
                  className="flex items-center gap-1 text-xs font-bold text-[#0066FF] hover:underline"
                >
                  View Studies
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#E9ECEF]">
            <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder size={32} className="text-[#ADB5BD]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">No projects found</h3>
            <p className="text-[#6C757D] mt-2 mb-6">Organize your studies into projects for better management.</p>
            <button 
              onClick={onNewProject}
              className="px-6 py-2 bg-[#0066FF] text-white rounded-lg font-bold hover:bg-[#0052CC] transition-all"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
