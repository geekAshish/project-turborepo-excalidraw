import axios from "axios";
import React from "react";
import { BACKEND_URL } from "../../config";
// 2:15

async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
  return response.data.id;
}

const ChatRoom = async ({ params }: { params: { slug: string } }) => {
  const slug = params.slug;
  const roomId = await getRoomId(slug);

  return <div>ChatRoom {slug}</div>;
};

export default ChatRoom;
