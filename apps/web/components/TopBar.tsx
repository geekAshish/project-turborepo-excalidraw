import { Tool } from "../modules/interface/shape";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 10,
      }}
    >
      <div className="flex gap-t">
        <IconButton
          onClick={() => {
            setSelectedTool("pen");
          }}
          activated={selectedTool === "pen"}
          icon={<Pencil />}
        />
        <IconButton
          onClick={() => {
            setSelectedTool("rect");
          }}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon />}
        ></IconButton>
        <IconButton
          onClick={() => {
            setSelectedTool("circle");
          }}
          activated={selectedTool === "circle"}
          icon={<Circle />}
        ></IconButton>
      </div>
    </div>
  );
}

export default Topbar;
