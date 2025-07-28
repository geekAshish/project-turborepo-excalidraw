import ClientRoom from "./ClientRoom";

// const ChatRoom1 = async ({ params }: { params: { slug: string } }) => {
//   const slug = (await params).slug;
//   const roomId = await getRoomId(slug);

//   // return <ChatRoom id={roomId.room} />;
//   return <RoomCanvas roomId={roomId.room.id} />;
// };
// export default ChatRoom1;

export default async function ChatRoom1({
  params,
}: {
  params: { slug: string };
}) {
  const slug = (await params).slug;
  return <ClientRoom slug={slug} />;
}
