import axios from "axios";
import { BACKEND_URL } from "../app/config";

export async function getExistingShape(roomId: string) {
  const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
  const messages = res.data.messages;
  console.log(messages);

  const shapes = messages.map((x: { messages: string }) => {
    const messageData = JSON.parse(x.messages);
    return messageData.shape;
  });

  return shapes;
}
