import React from "react";
// 2:15
const ChatRoom = ({ params }: { params: { slug: string } }) => {
  const slug = params.slug;

  return <div>ChatRoom {slug}</div>;
};

export default ChatRoom;
