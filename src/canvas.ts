figma.showUI(__html__, { height: 600, width: 400, themeColors: true });

function sendSelectionToUI() {
  const selection = figma.currentPage.selection[0];
  const pageName = figma.currentPage.name;
  if (selection) {
    const children =
      "children" in selection
        ? selection.children.map((child) => ({
            id: child.id,
            name: child.name,
            type: child.type,
            x: "x" in child ? child.x : undefined,
            y: "y" in child ? child.y : undefined,
            width: "width" in child ? child.width : undefined,
            height: "height" in child ? child.height : undefined,
            rotation: "rotation" in child ? child.rotation : undefined,
            children:
              "children" in child
                ? child.children.map((grand) => ({
                    id: grand.id,
                    name: grand.name,
                    type: grand.type,
                    x: "x" in grand ? grand.x : undefined,
                    y: "y" in grand ? grand.y : undefined,
                    width: "width" in grand ? grand.width : undefined,
                    height: "height" in grand ? grand.height : undefined,
                    rotation: "rotation" in grand ? grand.rotation : undefined,
                  }))
                : undefined,
          }))
        : [];
    figma.ui.postMessage({
      type: "selection",
      pageName,
      node: {
        id: selection.id,
        name: selection.name,
        type: selection.type,
        x: "x" in selection ? selection.x : undefined,
        y: "y" in selection ? selection.y : undefined,
        width: "width" in selection ? selection.width : undefined,
        height: "height" in selection ? selection.height : undefined,
        rotation: "rotation" in selection ? selection.rotation : undefined,
        children,
      },
    });
  } else {
    figma.ui.postMessage({
      type: "selection",
      node: null,
      pageName,
    });
  }
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "get-selection") {
    sendSelectionToUI();
  }
  if (msg.type === "rename" && typeof msg.name === "string") {
    (async () => {
      if (msg.nodeId) {
        // 특정 id의 노드 이름 변경
        const node = await figma.getNodeByIdAsync(msg.nodeId);
        if (node && "name" in node) {
          node.name = msg.name;
          sendSelectionToUI();
        }
      } else {
        // 선택된 노드 이름 변경 (기존 동작)
        const selection = figma.currentPage.selection[0];
        if (selection) {
          selection.name = msg.name;
          sendSelectionToUI();
        }
      }
    })();
  }

  // ✨ 하이라이트 메시지 처리
  if (msg.type === "flash-elements" && Array.isArray(msg.ids)) {
    (async () => {
      for (const id of msg.ids) {
        const node = await figma.getNodeByIdAsync(id);
        if (!node) continue;
        // fill 지원 여부
        if ("fills" in node) {
          const originalFills = node.fills;
          node.fills = [{ type: "SOLID", color: { r: 0.29, g: 0.87, b: 0.5 }, opacity: 0.7 }];
          setTimeout(() => {
            node.fills = originalFills;
          }, msg.duration || 900);
        }
        if ("visible" in node) node.visible = true;
        if (node.type === "GROUP" && "children" in node) {
          node.children.forEach((child: any) => {
            // child도 fill 지원 시 하이라이트
            if ("fills" in child) {
              const childOriginalFills = child.fills;
              child.fills = [{ type: "SOLID", color: { r: 0.29, g: 0.87, b: 0.5 }, opacity: 0.7 }];
              setTimeout(() => {
                child.fills = childOriginalFills;
              }, msg.duration || 900);
            }
            if ("visible" in child) child.visible = true;
          });
        }
      }
    })();
  }
  // ...existing code...
};

figma.on("selectionchange", () => {
  sendSelectionToUI();
});
