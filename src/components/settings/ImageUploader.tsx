'use client';

import React, { useRef } from 'react';
import { Camera, ImagePlus, X, Loader2, Building2 } from 'lucide-react';
import { validateImage } from '@/utils/imageUpload';
import { toast } from 'sonner';

interface ImageUploaderProps {
  type: 'logo' | 'cover';
  currentUrl?: string;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  isUploading?: boolean;
  progress?: number;
}

export default function ImageUploader({
  type,
  currentUrl,
  onUpload,
  onRemove,
  isUploading = false,
  progress = 0,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file, type);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file uploaded');
      return;
    }

    onUpload(file);
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  if (type === 'cover') {
    return (
      <div className="space-y-2 w-full">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        
        <div 
          className="relative w-full h-[200px] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden group flex flex-col items-center justify-center transition-all"
        >
          {currentUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentUrl} 
                alt="Hall Cover Preview" 
                className="w-full h-full object-cover rounded-xl"
              />
              
              {/* Dark Hover Overlay */}
              <div 
                onClick={triggerSelect}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 cursor-pointer text-white text-xs font-bold"
              >
                <Camera className="h-5 w-5" />
                <span>Change Cover Image</span>
              </div>

              {/* Remove X Button */}
              {onRemove && !isUploading && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <div 
              onClick={triggerSelect}
              className="flex flex-col items-center gap-2 text-center p-6 cursor-pointer hover:bg-gray-100/50 w-full h-full justify-center"
            >
              <ImagePlus className="h-8 w-8 text-gray-350" />
              <div>
                <span className="text-xs font-bold text-violet-650 hover:underline">Upload Cover Image</span>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Recommended: 1200 x 400px, max 5MB (JPG, PNG, WEBP)</p>
              </div>
            </div>
          )}

          {/* Progressive Loading Progress Bar */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white p-4">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              <div className="w-48 space-y-1 text-center">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Uploading Cover...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LOGO UI
  return (
    <div className="relative shrink-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />

      <div 
        className="relative h-24 w-24 rounded-full border-4 border-white bg-gray-50 shadow-md group overflow-hidden flex items-center justify-center shrink-0"
      >
        {currentUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentUrl} 
              alt="Logo Preview" 
              className="h-full w-full object-cover rounded-full"
            />
            
            {/* Camera Overlay on Hover */}
            <div 
              onClick={triggerSelect}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
            >
              <Camera className="h-4 w-4" />
            </div>
          </>
        ) : (
          <div 
            onClick={triggerSelect}
            className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 h-full w-full bg-gray-100/50"
          >
            <Building2 className="h-7 w-7 text-gray-350" />
          </div>
        )}

        {/* Upload status overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Small action links beneath logo */}
      <div className="mt-2 text-center flex flex-col gap-1 items-center">
        <button
          type="button"
          onClick={triggerSelect}
          disabled={isUploading}
          className="text-[10px] font-bold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer"
        >
          Change Logo
        </button>
        {currentUrl && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={isUploading}
            className="text-[9px] font-bold text-red-500 hover:text-red-750 hover:underline cursor-pointer"
          >
            Remove Logo
          </button>
        )}
      </div>
    </div>
  );
}
