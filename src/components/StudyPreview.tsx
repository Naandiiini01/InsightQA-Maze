import React, { useState } from 'react';
import { Block, Study } from '../types';
import { Play, ArrowRight, Timer, MousePointer2, AlertCircle, Target, CheckCircle2 } from 'lucide-react';

interface StudyPreviewProps {
  blocks: Block[];
  prototypeUrls?: string[];
  title: string;
}

export const StudyPreview: React.FC<StudyPreviewProps> = ({ blocks, prototypeUrls, title }) => {
  const [currentBlockIdx, setCurrentBlockIdx] = useState(0);

  const currentBlock = blocks[currentBlockIdx];

  const nextBlock = () => {
    if (currentBlockIdx < blocks.length - 1) {
      setCurrentBlockIdx(currentBlockIdx + 1);
    }
  };

  const prevBlock = () => {
    if (currentBlockIdx > 0) {
      setCurrentBlockIdx(currentBlockIdx - 1);
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-[#E9ECEF] shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#E9ECEF] font-bold text-sm">Preview: {title}</div>
      <div className="flex-1 p-6 overflow-y-auto">
        {currentBlock ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{currentBlock.type.toUpperCase()}</h2>
            {currentBlock.type === 'intro' && (
              <>
                <h3 className="text-lg font-bold">{currentBlock.title}</h3>
                <p>{currentBlock.description}</p>
              </>
            )}
            {currentBlock.type === 'context' && (
              <p>{currentBlock.scenarioText}</p>
            )}
            {currentBlock.type === 'task' && (
              <>
                <h3 className="text-lg font-bold">{currentBlock.title}</h3>
                <p>{currentBlock.instructions}</p>
              </>
            )}
            {currentBlock.type === 'question' && (
              <p className="font-bold">{currentBlock.text}</p>
            )}
            {currentBlock.imageUrl && <img src={currentBlock.imageUrl} alt="Block media" className="rounded-lg" />}
            {currentBlock.videoUrl && <video src={currentBlock.videoUrl} controls className="rounded-lg" />}
          </div>
        ) : (
          <div className="text-center text-gray-500">No blocks to preview</div>
        )}
      </div>
      <div className="p-4 border-t border-[#E9ECEF] flex justify-between">
        <button onClick={prevBlock} disabled={currentBlockIdx === 0} className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50">Prev</button>
        <button onClick={nextBlock} disabled={currentBlockIdx === blocks.length - 1} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};
