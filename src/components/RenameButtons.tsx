import React from "react";

interface RenameButtonsProps {
  onRename: (name: string) => void;
  nodeId?: string;
}

export default function RenameButtons({ onRename, nodeId }: RenameButtonsProps) {
  const nameCandidates = ["Beacons", "Nodes", "Sensors", "RoutePaths", "Pillars", "Structures", "POIs", "Arrows"];
  const [inputValue, setInputValue] = React.useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onRename(inputValue.trim());
      setInputValue("");
    }
  };
  return (
    <div style={{ gap: 3, marginBottom: 10, display: "flex", flexWrap: "wrap", flexDirection: "column" }}>
      <form onSubmit={handleInputSubmit} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="직접 입력..."
          style={{
            background: "#23232A",
            color: "#FFD966",
            borderRadius: 14,
            fontWeight: 500,
            fontSize: 12,
            border: "1px solid #444",
            padding: "4px 10px",
            outline: "none",
            width: 120,
          }}
        />
        <button
          type="submit"
          style={{
            background: "#4ADE80",
            color: "#23232A",
            borderRadius: 14,
            fontWeight: 600,
            fontSize: 12,
            border: "none",
            padding: "4px 10px",
            cursor: "pointer",
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.08)",
          }}
        >
          변경
        </button>
      </form>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
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
    </div>
  );
}
