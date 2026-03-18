import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { X, FolderPlus } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !auth.currentUser) return;

    setCreatingProject(true);
    setError(null);
    try {
      await addDoc(collection(db, 'projects'), {
        name: projectName.trim(),
        description: projectDesc.trim(),
        ownerId: auth.currentUser.uid,
        workspaceId: 'default',
        createdAt: new Date().toISOString()
      });
      onClose();
      setProjectName('');
      setProjectDesc('');
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-[#E9ECEF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FolderPlus size={20} />
            </div>
            <h3 className="font-bold text-lg">Create New Project</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors"
          >
            <X size={20} className="text-[#ADB5BD]" />
          </button>
        </div>
        
        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Project Name <span className="text-[#DC3545]">*</span>
            </label>
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
              onClick={onClose}
              className="flex-1 py-3 border border-[#E9ECEF] text-[#495057] font-bold rounded-xl hover:bg-[#F8F9FA] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={creatingProject || !projectName.trim()}
              className="flex-1 py-3 bg-[#0066FF] text-white font-bold rounded-xl hover:bg-[#0052CC] transition-all disabled:opacity-50"
            >
              {creatingProject ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
