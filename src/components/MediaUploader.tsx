import React, { useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, Loader2, X } from 'lucide-react';

interface MediaUploaderProps {
  onUpload: (url: string) => void;
  type: 'image' | 'video';
  currentUrl?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ onUpload, type, currentUrl }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onUpload(url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {type === 'image' ? 'Upload Image' : 'Upload Video'}
      </label>
      {currentUrl ? (
        <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
          {type === 'image' ? (
            <img src={currentUrl} alt="Uploaded" className="w-full h-full object-cover" />
          ) : (
            <video src={currentUrl} className="w-full h-full object-cover" />
          )}
          <button 
            onClick={() => onUpload('')}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          {uploading ? (
            <Loader2 className="animate-spin text-blue-600" />
          ) : (
            <>
              <Upload className="text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">Click to upload {type}</span>
            </>
          )}
          <input type="file" className="hidden" accept={type === 'image' ? "image/*" : "video/*"} onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
};
