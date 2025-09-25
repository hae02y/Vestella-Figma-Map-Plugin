import React from "react";

interface RenameButtonsProps {
  onRename: (name: string) => void;
  nodeId?: string;
}

export default function RenameButtons({ onRename, nodeId }: RenameButtonsProps) {
  const nameCandidates = ["Beacons", "Nodes", "Sensors", "RoutePaths", "Pillars", "Structures", "POIs", "Arrows"];
  return (
    <div style={{ gap: 3, marginBottom: 10, display: "flex", flexWrap: "wrap" }}>
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
    </div>
  );
}
