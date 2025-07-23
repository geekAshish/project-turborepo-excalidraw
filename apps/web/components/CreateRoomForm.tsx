"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";

const CreateRoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
});

type CreateRoomFormData = z.infer<typeof CreateRoomSchema>;

export default function CreateRoomForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(CreateRoomSchema),
  });

  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const onSubmit = (data: CreateRoomFormData) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // optional, if your middleware checks it
            },
          }
        );

        console.log(res);

        if (res.data.roomId) {
          setMessage({
            type: "success",
            text: `Room created! ID: ${res.data.roomId}`,
          });

          setInterval(() => {
            router.push(`room/${res.data.roomId}`);
          }, 500);
        } else {
          setMessage({
            type: "error",
            text: res.data.msg || "Something went wrong",
          });
        }
      } catch (e: any) {
        setMessage({
          type: "error",
          text: e?.response?.data?.msg || "Failed to create room",
        });
      }
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">🔒 Create a Room</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Room Name
          </label>
          <input
            type="text"
            {...register("name")}
            placeholder="Enter your room name"
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className={`w-full py-2 rounded-md text-white font-medium transition ${
            pending
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {pending ? "Creating..." : "Create Room"}
        </button>
      </form>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
