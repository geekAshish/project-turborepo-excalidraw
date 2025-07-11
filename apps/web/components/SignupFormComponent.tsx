"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@repo/ui/Input";
import { FileInput } from "@repo/ui/FileInput";

import { SignupForm, signupSchema } from "../modules/interface/zod-validation";

export default function SignupFormComponent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const photo = watch("photo");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (photo?.length && photo?.length > 0) {
      const file = photo[0];
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);

      if (file) {
        reader.readAsDataURL(file);
      }
    }
  }, [photo]);

  const onSubmit = (data: SignupForm) => {
    console.log("Submitted:", {
      ...data,
      photo: data?.photo && data?.photo[0],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FileInput
        label="Profile Photo"
        register={register("photo")}
        error={errors.photo?.message as string}
      />
      {preview && (
        <Image
          src={preview}
          alt="Preview"
          width={80}
          height={30}
          className="rounded-full object-cover"
        />
      )}

      <Input
        label="Name"
        register={register("name")}
        error={errors.name?.message}
        placeholder="John Doe"
      />
      <Input
        label="Email"
        register={register("email")}
        error={errors.email?.message}
        placeholder="john@example.com"
        type="email"
      />
      <Input
        label="Password"
        register={register("password")}
        error={errors.password?.message}
        placeholder="••••••••"
        type="password"
      />

      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
      >
        Sign Up
      </button>
    </form>
  );
}
