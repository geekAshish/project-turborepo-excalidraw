import axios from "axios";
import { BACKEND_URL } from "../app/config";

interface ShapeMessage {
  message: string;
}

export async function getExistingShape(roomId: string) {
  try {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const messages: ShapeMessage[] = res.data?.messages || [];

    const shapes = messages
      .map((msg) => {
        try {
          const messageData = JSON.parse(msg.message);
          return messageData.shape;
        } catch (err) {
          console.warn("Invalid message format:", msg.message);
          return null;
        }
      })
      .filter(Boolean); // remove nulls if parsing failed

    return shapes;
  } catch (error: any) {
    console.error(
      "Error fetching shapes:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch existing shapes.");
  }
}

export async function getRoomId(slug: string, token?: string) {
  try {
    const response = await axios.get(`${BACKEND_URL}/room/${slug}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to fetch room ID:",
      error.response?.data || error.message
    );
    throw new Error("Unable to fetch room details.");
  }
}
