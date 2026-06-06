'use client';

import React, { useRef, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadFieldProps {
  name: string;
  label?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function FileUploadField({
  name,
  label,
  helperText = 'PDF, PNG, JPG up to 5MB',
  accept,
  multiple = false,
  className = '',
}: FileUploadFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const filesList: File[] = Array.isArray(value) ? value : value ? [value] : [];

          const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
              const selectedFiles = Array.from(e.target.files);
              onChange(multiple ? [...filesList, ...selectedFiles] : selectedFiles[0]);
            }
          };

          const handleDrag = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === 'dragenter' || e.type === 'dragover') {
              setIsDragActive(true);
            } else if (e.type === 'dragleave') {
              setIsDragActive(false);
            }
          };

          const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
            if (e.dataTransfer.files) {
              const droppedFiles = Array.from(e.dataTransfer.files);
              onChange(multiple ? [...filesList, ...droppedFiles] : droppedFiles[0]);
            }
          };

          const removeFile = (index: number) => {
            if (multiple) {
              const next = filesList.filter((_, i) => i !== index);
              onChange(next.length ? next : null);
            } else {
              onChange(null);
            }
          };

          return (
            <div className="space-y-2">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary-light bg-primary-lighter/40'
                    : errorMessage
                    ? 'border-red-300 bg-red-50/20 hover:bg-red-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/20 hover:bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <Upload className="h-6 w-6 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 font-medium">
                  Click to upload or drag & drop files
                </p>
                <p className="text-xs text-slate-400 mt-1">{helperText}</p>
              </div>

              {/* Uploaded Files Preview list */}
              {filesList.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {filesList.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border border-slate-100 rounded-md p-2 bg-white text-xs shadow-custom-sm"
                    >
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <FileText className="h-4 w-4 text-primary-light shrink-0" />
                        <span className="truncate text-slate-600 font-medium">
                          {file.name}
                        </span>
                        <span className="text-slate-400 font-normal shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-slate-400 hover:text-red-500 rounded p-1 hover:bg-slate-50"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      />

      {errorMessage && (
        <span className="text-xs text-red-500 font-medium">{errorMessage}</span>
      )}
    </div>
  );
}
