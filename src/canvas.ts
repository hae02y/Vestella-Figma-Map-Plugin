figma.showUI(__html__, { height: 600, width: 400, themeColors: true });

function sendSelectionToUI() {
  const selection = figma.currentPage.selection[0];
  const pageName = figma.currentPage.name;
  if (selection) {
    // 중심점 계산 함수
    function getCenter(node: any) {
      if ("absoluteBoundingBox" in node && node.absoluteBoundingBox) {
        const { x, y, width, height } = node.absoluteBoundingBox;
        return { x: x + width / 2, y: y + height / 2, width, height };
      } else if ("x" in node && "y" in node && "width" in node && "height" in node) {
        return { x: node.x + node.width / 2, y: node.y + node.height / 2, width: node.width, height: node.height };
      }
      return { x: undefined, y: undefined, width: undefined, height: undefined };
    }

    function serializeNode(node: any, parentAbs?: { x: number; y: number } | null) {
      const { x, y, width, height } = getCenter(node);
      let children = undefined;
      // 부모 Frame/Group의 absoluteBoundingBox.x, y를 기준점으로 전달
      let parentAbsXY = parentAbs;
      if (node.type === "FRAME" || node.type === "GROUP") {
        // 본인 absoluteBoundingBox 기준
        parentAbsXY = { x: node.absoluteBoundingBox?.x ?? 0, y: node.absoluteBoundingBox?.y ?? 0 };
      }
      if ("children" in node && node.children) {
        children = node.children.map((child: any) => {
          const childCenter = getCenter(child);
          // SVG 기준 좌표: 부모(Frame/Group)의 absoluteBoundingBox.x, y를 빼줌
          let svgX = childCenter.x;
          let svgY = childCenter.y;
          if (parentAbsXY) {
            svgX = (childCenter.x ?? 0) - parentAbsXY.x;
            svgY = (childCenter.y ?? 0) - parentAbsXY.y;
          }
          return {
            id: child.id,
            name: child.name,
            type: child.type,
            x: svgX,
            y: svgY,
            width: childCenter.width,
            height: childCenter.height,
            children:
              "children" in child && child.children
                ? child.children.map((c: any) => serializeNode(c, parentAbsXY))
                : undefined,
          };
        });
      }
      // 본인도 SVG 기준 좌표로 변환(최상위는 그대로)
      let svgX = x,
        svgY = y;
      if (parentAbs && x !== undefined && y !== undefined) {
        svgX = x - parentAbs.x;
        svgY = y - parentAbs.y;
      }
      return {
        id: node.id,
        name: node.name,
        type: node.type,
        x: svgX,
        y: svgY,
        width,
        height,
        children,
      };
    }

    const nodeData = serializeNode(selection, null);
    figma.ui.postMessage({
      type: "selection",
      pageName,
      node: nodeData,
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
    if (msg.nodeId) {
      // 특정 id의 노드 이름 변경
      const node = figma.getNodeById(msg.nodeId);
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
  }
};

figma.on("selectionchange", () => {
  sendSelectionToUI();
});
