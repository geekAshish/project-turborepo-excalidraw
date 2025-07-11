import { UseFormRegisterReturn } from "react-hook-form";

interface FileInputProps {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
}

export const FileInput = ({ label, register, error }: FileInputProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        {...register}
        className={`
          w-full px-3 py-2 text-sm text-gray-700
          bg-white border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-medium
          file:bg-purple-600 file:text-white
          hover:file:bg-purple-700
        `}
      />
    </div>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);
