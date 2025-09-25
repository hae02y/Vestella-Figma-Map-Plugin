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

  // ✨ 하이라이트 메시지 처리
  if (msg.type === "flash-elements" && Array.isArray(msg.ids)) {
    msg.ids.forEach((id: string) => {
      const node = figma.getNodeById(id);
      if (!node) return;
      // 타입 및 fill 지원 여부 로그 출력
      const hasFills = "fills" in node;
      if (hasFills) {
        // 기존 fill 저장
        const originalFills = node.fills;
        // 하이라이트 색상 적용 (lime green)
        node.fills = [{ type: "SOLID", color: { r: 0.29, g: 0.87, b: 0.5 }, opacity: 0.7 }];
        setTimeout(() => {
          node.fills = originalFills;
        }, msg.duration || 900);
        if ("visible" in node) node.visible = true;
      } else if (node.type === "GROUP" && "children" in node) {
        // GROUP의 자식 전체에 반짝임 효과 (색상 또는 opacity 반복 변경)
        node.children.forEach((child) => {
          const repeat = 1;
          const interval = 1000;
          // drop shadow 기반 glow 효과
          const glowEffect: Effect = {
            type: "DROP_SHADOW",
            color: { r: 0.29, g: 0.87, b: 0.5, a: 0.95 }, // 더 진하게
            blendMode: "NORMAL",
            offset: { x: 0, y: 0 },
            radius: 64, // 더 멀리 퍼지게
            spread: 30, // 퍼짐 효과 추가
            visible: true,
          } as const;
          const originalEffects = "effects" in child ? child.effects : undefined;
          for (let i = 0; i < repeat; i++) {
            setTimeout(
              () => {
                if ("effects" in child)
                  child.effects = originalEffects
                    ? (Array.from(originalEffects).concat([glowEffect]) as readonly Effect[])
                    : [glowEffect];
              },
              i * interval * 2,
            );
            setTimeout(
              () => {
                if ("effects" in child) child.effects = originalEffects || [];
              },
              i * interval * 2 + interval,
            );
          }
          if ("visible" in child) child.visible = true;
        });
      }
    });
  }
};

figma.on("selectionchange", () => {
  sendSelectionToUI();
});
