"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { FileInput } from "./FileInput";
import { Input } from "./Input";
import { Button } from "@repo/ui/button";

import { SignupForm, signupSchema } from "../modules/interface/zod-validation";
import { signupAction } from "../app/actions/auth";

export default function SignupFormComponent() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    reset,
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const photo = watch("photo");

  useEffect(() => {
    if (photo?.length && photo?.[0]) {
      const file = photo[0];
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [photo]);

  const onSubmit = (data: SignupForm) => {
    const { photo, ...rest } = data;

    startTransition(async () => {
      const res = await signupAction({
        ...rest,
        photo: photo?.[0] || "", // Send single file
      });

      if (!res.success) {
        setError("root", { type: "manual", message: res.error });
      } else {
        toast.success("Signed up successfully!");
        reset(); // reset form
        router.push("/dashboard"); // redirect on success
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 max-w-sm mx-auto"
    >
      <FileInput
        register={register("photo")}
        error={errors.photo?.message as string}
        watchFile={photo}
      />

      <Input
        label="Name"
        name="name"
        register={register("name")}
        error={errors.name?.message}
        placeholder="John Doe"
      />

      <Input
        label="Email"
        name="email"
        register={register("email")}
        error={errors.email?.message}
        placeholder="john@example.com"
        type="email"
      />

      <Input
        label="Password"
        name="password"
        register={register("password")}
        error={errors.password?.message}
        placeholder="••••••••"
        type="password"
      />

      {errors.root?.message && (
        <p className="text-sm text-red-500 text-center">
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
      >
        {pending ? "Signing Up..." : "Sign Up"}
      </Button>
    </form>
  );
}
