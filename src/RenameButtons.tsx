import React from "react";

interface RenameButtonsProps {
  onRename: (name: string) => void;
  nodeId?: string;
}

export default function RenameButtons({ onRename, nodeId }: RenameButtonsProps) {
  const nameCandidates = ["Beacons", "Nodes", "Sensors"];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 10,
        minWidth: 0,
        maxWidth: 480,
        width: "100%",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        overflowX: "visible"
      }}
    >
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
            padding: "4px 12px",
            cursor: "pointer",
            transition: "background 0.2s",
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 4,
            minWidth: 100,
            flexGrow: 0,
            flexShrink: 1,
            flexBasis: "calc(33% - 12px)",
            maxWidth: "100%",
            wordBreak: "keep-all"
          }}
          onClick={() => onRename(name)}
        >
          <span style={{ fontWeight: 700, color: "#FFD966", fontSize: 11 }}>{name}</span>
          <span style={{ fontSize: 10, color: "#aaa", marginLeft: 2 }}>{nodeId ? `#${nodeId.slice(-4)}` : ""}</span>
          <span style={{ fontSize: 10, marginLeft: 4 }}>이름!</span>
        </button>
      ))}
    </div>
  );
}
