import { useEffect, useState } from "react";
import { View } from "reshaped";
import RenameButtons from "../components/RenameButtons.js";
import Message from "../components/Message.js";

interface MainPageProps {
  onNext: () => void;
}

type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
};

export default function MainPage({ onNext }: MainPageProps) {
  let pageName = "";
  const [selectedNode, setSelectedNode] = useState<FigmaNode | null>(null);
  const [children, setChildren] = useState<FigmaNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage && event.data.pluginMessage.type === "selection") {
        const node = event.data.pluginMessage.node as FigmaNode;
        console.log("[Figma selection node]", node);
        setSelectedNode(node);
        setChildren(node?.children || []);
        setError(null);
        pageName = event.data.pluginMessage.pageName;
      }
    };
    window.addEventListener("message", handleMessage);
    // Figma에 selection 요청
    parent.postMessage({ pluginMessage: { type: "get-selection" } }, "*");
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleNodeClick = (node: FigmaNode) => {
    console.log("[Clicked node]", node);
    setSelectedNode(node);
    setChildren(node.children || []);
    setRenameTargetId(null); // 자식 클릭 시 초기화
    if (!node.children || node.children.length === 0) {
      setError("이 노드에는 자식이 없습니다.");
    } else {
      setError(null);
    }
  };

  // 자식 노드 옆 이름 변경
  const handleChildRename = (childId: string, name: string) => {
    parent.postMessage({ pluginMessage: { type: "rename", name, nodeId: childId } }, "*");
    setRenameTargetId(null); // 버튼 숨김
  };

  // 모든 프레임/그룹 자식 노드가 규칙에 맞는지 검사
  const allValid = children
    .filter((child) => child.type === "FRAME" || child.type === "GROUP")
    .every((child) => /^[A-Z].*s$/.test(child.name));

  return (
    <div
      style={{
        width: 600,
        height: 800,
        background: "#18181B",
        display: "flex",
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.12)",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <View padding={4}>
          <div>
            <div style={{ color: "#fff", marginBottom: 16, fontWeight: 600, fontSize: 12 }}>
              <div>{pageName}</div>
              {selectedNode ? (
                <>
                  <div>
                    선택된 요소: <b>{selectedNode.name}</b> ({selectedNode.type})
                  </div>
                  <Message type="success" text={error ?? "저장에 성공했습니다!"} />
                  <div style={{ marginTop: 12 }}>자식노드:</div>
                  <ul>
                    {children.length > 0 ? (
                      children.map((child) => (
                        <li key={child.id} style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
                          {(() => {
                            // 이름 규칙: 맨 앞 대문자, 끝 s
                            const isTarget = child.type === "FRAME" || child.type === "GROUP";
                            let valid = true;
                            if (isTarget) {
                              valid = /^[A-Z].*s$/.test(child.name);
                            }
                            const color = isTarget ? (valid ? "#4ADE80" : "#FF5A5A") : "#fff";
                            return (
                              <span
                                style={{ cursor: child.children ? "pointer" : "default", flex: 1, color }}
                                onClick={() => setRenameTargetId(child.id)}
                              >
                                {child.name} <span style={{ color: "#aaa", fontSize: 14 }}>({child.type})</span>
                                {isTarget && !valid && (
                                  <span style={{ color: "#FF5A5A", fontSize: 11, marginLeft: 6 }}>
                                    이름은 대문자로 시작하고 s로 끝나야 해요!
                                  </span>
                                )}
                              </span>
                            );
                          })()}
                          {renameTargetId === child.id && (
                            <div style={{ display: "block" }}>
                              <RenameButtons
                                onRename={(name: any) => handleChildRename(child.id, name)}
                                nodeId={child.id}
                              />
                            </div>
                          )}
                        </li>
                      ))
                    ) : (
                      <li style={{ color: "#aaa" }}>자식 노드가 없습니다.</li>
                    )}
                  </ul>
                </>
              ) : (
                <div>Figma에서 그룹 또는 프레임을 선택하세요.</div>
              )}
            </div>
          </div>
        </View>
      </div>
    </div>
  );
}
