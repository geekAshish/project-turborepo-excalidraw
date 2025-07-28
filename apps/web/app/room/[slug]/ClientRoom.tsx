"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getRoomId } from "../../../draw/http";
import RoomCanvas from "../../../components/RoomCanvas";

export default function ClientRoom({ slug }: { slug: string }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getRoomId(slug, token || "");
        setRoomId(data.room.id);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load room.");
      }
    };

    fetchRoom();
  }, [slug]);

  if (error) return <p>{error}</p>;
  if (!roomId) return <p>Loading room...</p>;

  return <RoomCanvas roomId={roomId} />;
}
