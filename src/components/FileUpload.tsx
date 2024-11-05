import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File) => void;
}

export function FileUpload({ label, accept, onChange }: FileUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          id={`file-${label}`}
        />
        <label
          htmlFor={`file-${label}`}
          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-white"
        >
          <Upload className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-gray-600">Choose file or drag and drop</span>
        </label>
      </div>
    </div>
  );
}