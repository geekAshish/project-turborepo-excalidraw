import RoomCanvas from "../../../components/RoomCanvas";

const CanvasPage = async ({ params }: { params: { roomId: string } }) => {
  const roomId = (await params).roomId;

  console.log({ roomId });

  return <RoomCanvas roomId={roomId} />;
};

export default CanvasPage;
