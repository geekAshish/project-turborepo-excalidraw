import React from "react";
// 1:15
const ChatRoom = ({ params }: { params: { slug: string } }) => {
  const slug = params.slug;

  return <div>ChatRoom {slug}</div>;
};

export default ChatRoom;
