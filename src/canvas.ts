figma.showUI(__html__, { height: 1100, width: 600, themeColors: true });

function sendSelectionToUI() {
  const selection = figma.currentPage.selection[0];
  if (selection) {
    const children =
      "children" in selection
        ? selection.children.map((child) => ({
            id: child.id,
            name: child.name,
            type: child.type,
            children:
              "children" in child
                ? child.children.map((grand) => ({
                    id: grand.id,
                    name: grand.name,
                    type: grand.type,
                  }))
                : undefined,
          }))
        : [];
    figma.ui.postMessage({
      type: "selection",
      node: {
        id: selection.id,
        name: selection.name,
        type: selection.type,
        children,
      },
    });
  } else {
    figma.ui.postMessage({
      type: "selection",
      node: null,
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
