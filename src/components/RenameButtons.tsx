import React from "react";

interface RenameButtonsProps {
  onRename: (name: string) => void;
  nodeId?: string;
}

export default function RenameButtons({ onRename, nodeId }: RenameButtonsProps) {
  const nameCandidates = ["Beacons", "Nodes", "Sensors", "RoutePaths", "Pillars", "Structures", "POIs", "Arrows"];
  const [customName, setCustomName] = React.useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomName(e.target.value);
  };
  const handleCustomRename = () => {
    if (customName.trim()) {
      onRename(customName.trim());
      setCustomName("");
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCustomRename();
    }
  };

  return (
    <div style={{ gap: 3, marginBottom: 10, display: "flex", flexWrap: "wrap", alignItems: "center" }}>
      {nameCandidates.map((name) => (
        <button
          key={name}
          style={{
            background: "#23232A",
            color: "#fff",
            borderRadius: 14,
            fontWeight: 500,
            fontSize: 12,
            border: "1px solid #444",
            padding: "4px 10px",
            cursor: "pointer",
            transition: "background 0.2s",
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onClick={() => onRename(name)}
        >
          <span style={{ fontWeight: 700, color: "#FFD966", fontSize: 11 }}>{name}</span>
          <span style={{ fontSize: 10, color: "#aaa", marginLeft: 2 }}>{nodeId ? `#${nodeId.slice(-4)}` : ""}</span>
        </button>
      ))}
      <div>
        <input
          type="text"
          value={customName}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="직접 입력..."
          style={{
            border: "1px solid #444",
            borderRadius: 10,
            padding: "4px 10px",
            fontSize: 12,
            marginLeft: 8,
            background: "#23232A",
            color: "#fff",
            width: 120,
          }}
        />
        <button
          onClick={handleCustomRename}
          style={{
            background: "#4ADE80",
            color: "#18181B",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12,
            padding: "4px 14px",
            marginLeft: 4,
            cursor: customName.trim() ? "pointer" : "not-allowed",
            opacity: customName.trim() ? 1 : 0.5,
          }}
          disabled={!customName.trim()}
        >
          적용
        </button>
      </div>
    </div>
  );
}
