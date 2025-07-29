import axios from "axios";
import { BACKEND_URL } from "../app/config";
import ChatRoomClient from "./ChatRoomClient";

async function getChats(roomId: string) {
  const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
  return response.data.message;
}

export async function ChatRoom({ id }: { id: string }) {
  let messages: { message: string }[] = [];
  if (id) {
    messages = await getChats(id);
  }

  return <ChatRoomClient id={id} messages={messages} />;
}
