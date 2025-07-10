import { UseFormRegisterReturn } from "react-hook-form";

interface FileInputProps {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
}

export const FileInput = ({ label, register, error }: FileInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="file"
      accept="image/*"
      {...register}
      className="w-full text-sm"
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);
