"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Input } from "./Input";
import { Button } from "@repo/ui/button";

import { SigninForm, signinSchema } from "../modules/interface/zod-validation";
import { signinAction } from "../modules/apis/auth";

export default function SigninFormComponent() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<SigninForm>({ resolver: zodResolver(signinSchema) });

  const onSubmit = (data: SigninForm) => {
    const { ...rest } = data;

    startTransition(async () => {
      const res = await signinAction({
        ...rest,
      });

      if (!res.success) {
        setError("root", { type: "manual", message: res.error.error });
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
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
