import { useEffect, useState } from "react";
import { View } from "reshaped";
import RenameButtons from "../components/RenameButtons.js";
import Message from "../components/Message.js";
import styles from "./MainPage.module.css";
import VerifiedIcon from "./VerifiedIcon.js";

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
  const [pageName, setPageName] = useState("");
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
        setPageName(event.data.pluginMessage.pageName);
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

  // 이름 규칙 validation 함수
  function validateChildren(children: FigmaNode[]): string[] {
    const errors: string[] = [];
    children.forEach((child) => {
      if (child.type === "FRAME" || child.type === "GROUP") {
        if (!/^[A-Z].*s$/.test(child.name)) {
          errors.push(`${child.name} : 이름은 대문자로 시작하고 s로 끝나야 해요!`);
        }
      }
    });
    return errors;
  }

  // 층(1F, 2F, B1, B2 등)인지 검사
  function isFloorNode(node: FigmaNode | null): boolean {
    if (!node) return false;
    // 예: 1F, 2F, 3F, B1, B2, RF 등
    return /^([1-9][0-9]*F|B[1-9][0-9]*|RF|PH)$/i.test(node.name.trim());
  }

  const validationErrors = validateChildren(children);
  const floorValid = isFloorNode(selectedNode);
  const floorError = selectedNode && !floorValid ? "층을 선택하세요 (예: 1F, 2F, B1, B2, RF 등)" : null;
  const childrenValid = children
    .filter((child) => child.type === "FRAME" || child.type === "GROUP")
    .every((child) => /^[A-Z].*s$/.test(child.name));
  const canProceed = floorValid && childrenValid && !error;

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <View padding={4}>
          <div>
            <div className={styles.title}>
              <h1 className={styles.pageName}>{pageName}</h1>

              {selectedNode ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    Selected Floor : <b className={styles.selected}>{selectedNode.name}</b> ({selectedNode.type})
                    {floorValid && <VerifiedIcon size={18} />}
                  </div>
                  <Message
                    type={error || validationErrors.length > 0 || floorError ? "error" : "success"}
                    text={
                      error
                        ? error
                        : floorError
                          ? floorError
                          : validationErrors.length > 0
                            ? validationErrors.join("\n")
                            : "모든 요소가 정상입니다!"
                    }
                  />
                  <div className={styles.childList} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Child Element
                    {childrenValid && children.length > 0 && <VerifiedIcon size={18} />}
                  </div>
                  <ul>
                    {children.length > 0 ? (
                      children.map((child) => {
                        const isTarget = child.type === "FRAME" || child.type === "GROUP";
                        const valid = !isTarget || /^[A-Z].*s$/.test(child.name);
                        const color = isTarget ? (valid ? "#4ADE80" : "#FF5A5A") : "#fff";
                        return (
                          <li key={child.id} className={styles.childItem}>
                            <span
                              className={styles.childName}
                              style={{ color, cursor: child.children ? "pointer" : "default" }}
                              onClick={() => setRenameTargetId(child.id)}
                            >
                              {child.name}
                              <span className={styles.childType}>({child.type})</span>
                              {renameTargetId === child.id && (
                                <div>
                                  <RenameButtons
                                    onRename={(name: any) => handleChildRename(child.id, name)}
                                    nodeId={child.id}
                                  />
                                </div>
                              )}
                            </span>
                          </li>
                        );
                      })
                    ) : (
                      <li className={styles.noChild}>No Child Elements.</li>
                    )}
                  </ul>
                  <div style={{ marginTop: 16, textAlign: "right" }}>
                    <button
                      className={styles.nextButton}
                      disabled={!canProceed}
                      style={{
                        background: canProceed ? "#4ADE80" : "#23232A",
                        color: canProceed ? "#18181B" : "#888",
                        border: "none",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 16,
                        padding: "12px 32px",
                        cursor: canProceed ? "pointer" : "not-allowed",
                        boxShadow: canProceed ? "0 2px 8px 0 rgba(76,222,128,0.15)" : "none",
                        transition: "all 0.2s",
                      }}
                      onClick={canProceed ? onNext : undefined}
                    >
                      Next
                    </button>
                  </div>
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
