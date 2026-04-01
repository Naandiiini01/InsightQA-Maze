import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { StudyType, Project, Block, Study } from '../types';
import { TemplateData } from '../data/templates';
import { 
  Save, 
  Plus, 
  Trash2, 
  Type, 
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye
} from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { StudyPreview } from './StudyPreview';

export const StudyBuilder: React.FC<{ onComplete: () => void, initialData?: TemplateData }> = ({ onComplete, initialData }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState(initialData?.title || '');
  const [prototypeUrls, setPrototypeUrls] = useState<string[]>(initialData?.prototypeUrls || ['']);
  const [type, setType] = useState<StudyType>(initialData?.type || 'prototype');
  const [deviceType, setDeviceType] = useState<NonNullable<Study['config']['deviceType']>>('responsive');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
    }, (error) => {
      console.error("Firestore Error (Projects):", error);
    });
    return () => unsubscribe();
  }, []);

  const addBlock = (type: Block['type']) => {
    let newBlock: Block;
    const id = Math.random().toString(36).substr(2, 9);
    switch (type) {
      case 'intro': newBlock = { type: 'intro', id, title: 'Intro', description: '' }; break;
      case 'context': newBlock = { type: 'context', id, scenarioText: '' }; break;
      case 'task': newBlock = { type: 'task', id, title: 'Task', instructions: '', followUpQuestions: [] }; break;
      case 'question': newBlock = { type: 'question', id, text: '', questionType: 'mcq', required: false, options: ['Option 1'] }; break;
      case 'thankyou': newBlock = { type: 'thankyou', id, title: 'Thank You', description: '' }; break;
      default: return;
    }
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const duplicateBlock = (block: Block) => {
    const newBlock = { ...block, id: Math.random().toString(36).substr(2, 9) };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    setSelectedBlockId(null);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case 'intro':
      case 'thankyou':
        return (
          <div className="space-y-4">
            <input type="text" placeholder="Title" value={block.title} onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, title: e.target.value } : b))} className="w-full text-2xl font-bold outline-none" />
            <textarea placeholder="Description" value={block.description} onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, description: e.target.value } : b))} className="w-full p-4 bg-[#F8F9FA] rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <MediaUploader type="image" currentUrl={block.imageUrl} onUpload={(url) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, imageUrl: url } : b))} />
              <MediaUploader type="video" currentUrl={block.videoUrl} onUpload={(url) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, videoUrl: url } : b))} />
            </div>
          </div>
        );
      case 'context':
        return (
          <div className="space-y-4">
            <textarea placeholder="Scenario text" value={block.scenarioText} onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, scenarioText: e.target.value } : b))} className="w-full p-4 bg-[#F8F9FA] rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <MediaUploader type="image" currentUrl={block.imageUrl} onUpload={(url) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, imageUrl: url } : b))} />
              <MediaUploader type="video" currentUrl={block.videoUrl} onUpload={(url) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, videoUrl: url } : b))} />
            </div>
          </div>
        );
      case 'task':
        return (
          <div className="space-y-4">
            <input type="text" placeholder="Task title" value={block.title} onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, title: e.target.value } : b))} className="w-full text-2xl font-bold outline-none" />
            <textarea placeholder="Instructions" value={block.instructions} onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, instructions: e.target.value } : b))} className="w-full p-4 bg-[#F8F9FA] rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <MediaUploader type="image" currentUrl={block.imageUrl} onUpload={(url) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, imageUrl: url } : b))} />
              <MediaUploader type="video" currentUrl={block.videoUrl} onUpload={(url) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, videoUrl: url } : b))} />
            </div>
          </div>
        );
      case 'question':
        return (
          <div className="space-y-4">
            <input type="text" placeholder="Question text" value={block.text} onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, text: e.target.value } : b))} className="w-full text-2xl font-bold outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <MediaUploader type="image" currentUrl={block.imageUrl} onUpload={(url) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, imageUrl: url } : b))} />
              <MediaUploader type="video" currentUrl={block.videoUrl} onUpload={(url) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, videoUrl: url } : b))} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      setError("Please sign in to save studies");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a study title");
      return;
    }

    setSaving(true);
    setError(null);

    const studyData = {
      title: title.trim(),
      type,
      projectId: projectId || null,
      ownerId: auth.currentUser.uid,
      blocks: blocks.map(b => ({ ...b })),
      status: 'draft' as const,
      config: { showTimer: true, deviceType },
      prototypeUrls: prototypeUrls.filter(u => u.trim() !== ''),
      createdAt: new Date().toISOString()
    };
    
    try {
      const docRef = await addDoc(collection(db, 'studies'), studyData);
      console.log('Study saved with ID:', docRef.id);
      setSaved(true);
      setTimeout(() => onComplete(), 1500);
    } catch (err: any) {
      console.error("Save Error:", err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'studies');
      } catch (e: any) {
        try {
          const parsed = JSON.parse(e.message);
          setError(`Permission Error: ${parsed.error}. Please check all fields.`);
        } catch {
          setError(e.message || "Failed to save study. Please check your permissions.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#E9ECEF] p-4 flex flex-col gap-4">
        <h2 className="font-bold text-lg">Workflow</h2>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#6C757D] uppercase">Project</label>
          <select 
            value={projectId || ''} 
            onChange={(e) => setProjectId(e.target.value || null)}
            className="w-full p-2 border border-[#E9ECEF] rounded-lg text-sm"
          >
            <option value="">Select a project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#6C757D] uppercase">Device</label>
          <select 
            value={deviceType} 
            onChange={(e) => setDeviceType(e.target.value as any)}
            className="w-full p-2 border border-[#E9ECEF] rounded-lg text-sm"
          >
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
            <option value="desktop">Desktop</option>
            <option value="laptop">Laptop</option>
            <option value="responsive">Fully Responsive</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#6C757D] uppercase">Variants (Prototype URLs)</label>
          {prototypeUrls.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                type="text" 
                value={url} 
                onChange={(e) => {
                  const newUrls = [...prototypeUrls];
                  newUrls[idx] = e.target.value;
                  setPrototypeUrls(newUrls);
                }}
                className="w-full p-2 border border-[#E9ECEF] rounded-lg text-sm"
              />
              <button onClick={() => setPrototypeUrls(prototypeUrls.filter((_, i) => i !== idx))} className="text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={() => setPrototypeUrls([...prototypeUrls, ''])} className="w-full p-2 text-xs bg-[#F8F9FA] border rounded hover:bg-[#E9ECEF]">
            + Add Variant
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {blocks.map((block, idx) => (
            <div key={block.id} className="flex items-center gap-1">
              <button
                onClick={() => setSelectedBlockId(block.id)}
                className={`flex-1 p-3 text-left rounded-lg border ${selectedBlockId === block.id ? 'border-[#0066FF] bg-[#F0F7FF]' : 'border-[#E9ECEF]'}`}
              >
                {block.type.toUpperCase()}
              </button>
              <div className="flex flex-col">
                <button onClick={() => moveBlock(idx, 'up')} className="p-1 hover:bg-[#E9ECEF] rounded"><ArrowUp size={12} /></button>
                <button onClick={() => moveBlock(idx, 'down')} className="p-1 hover:bg-[#E9ECEF] rounded"><ArrowDown size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['intro', 'context', 'task', 'question', 'thankyou'] as Block['type'][]).map(type => (
            <button key={type} onClick={() => addBlock(type)} className="p-2 text-xs bg-[#F8F9FA] border rounded hover:bg-[#E9ECEF]">
              + {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg text-sm font-bold hover:bg-[#F8F9FA]">
            <Eye size={16} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
        {showPreview ? (
          <StudyPreview blocks={blocks} prototypeUrls={prototypeUrls} title={title} />
        ) : selectedBlock ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E9ECEF] shadow-sm space-y-4">
            <div className="flex justify-end gap-2">
              <button onClick={() => duplicateBlock(selectedBlock)} className="text-[#0066FF] hover:text-[#0052CC] flex items-center gap-1">
                <Copy size={16} /> Duplicate
              </button>
              <button onClick={() => deleteBlock(selectedBlock.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                <Trash2 size={16} /> Delete
              </button>
            </div>
            {renderBlockEditor(selectedBlock)}
          </div>
        ) : (
          <div className="text-center py-20 text-[#6C757D]">Select a block to edit</div>
        )}
      </div>
      
      {/* Footer */}
      <div className="fixed bottom-0 right-0 p-6">
        {saved && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl font-bold">
            Study saved successfully!
          </div>
        )}
        <button 
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-2 px-6 py-3 bg-[#0066FF] text-white rounded-xl font-bold hover:bg-[#0052CC] transition-all shadow-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Finish & Save'} <Save size={20} />
        </button>
      </div>
    </div>
  );
};
