import axios from "axios";
import React from "react";
import { BACKEND_URL } from "../../config";
import RoomCanvas from "../../../components/RoomCanvas";

async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
  return response.data;
}

const ChatRoom1 = async ({ params }: { params: { slug: string } }) => {
  const slug = (await params).slug;
  const roomId = await getRoomId(slug);

  // return <ChatRoom id={roomId.room} />;
  return <RoomCanvas roomId={roomId.room.id} />;
};

export default ChatRoom1;
