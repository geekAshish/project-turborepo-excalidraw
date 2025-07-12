"use client";

import { useEffect, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { CameraIcon } from "lucide-react";

interface FileInputProps {
  label?: string;
  register: UseFormRegisterReturn;
  error?: string;
  watchFile: FileList | null;
}

export const FileInput = ({
  label,
  register,
  error,
  watchFile,
}: FileInputProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (watchFile?.length) {
      const file = watchFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      if (file) {
        reader.readAsDataURL(file);
      }
    }
  }, [watchFile]);

  return (
    <div className="flex flex-col justify-center items-center gap-3">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <label
        htmlFor="file-input"
        className="relative group w-28 h-28 rounded-full bg-gray-100 hover:bg-gray-200 overflow-hidden cursor-pointer shadow-md transition-all duration-300 border border-gray-300 flex items-center justify-center"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            <CameraIcon className="w-6 h-6" />
          </div>
        )}

        <input
          id="file-input"
          type="file"
          accept="image/*"
          {...register}
          className="absolute inset-0 opacity-0 cursor-pointer hidden"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
