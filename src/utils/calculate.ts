// 안전한 중점 계산 유틸 (회전/스케일/플립 모두 대응)
export function centerFrom(node: SceneNode) {
  const w = (node as any).width ?? 0;
  const h = (node as any).height ?? 0;
  const m = node.absoluteTransform; // [[a,c,e],[b,d,f]]
  const a = m[0][0], c = m[0][1], e = m[0][2];
  const b = m[1][0], d = m[1][1], f = m[1][2];

  const cx = e + a * (w / 2) + c * (h / 2);
  const cy = f + b * (w / 2) + d * (h / 2);

  // 회전 저장이 필요하면 사용(안 쓰면 0으로 그대로 넣어도 됨)
  const rotateDeg = (node as any).rotation ?? 0;

  return { cx, cy, w, h};
}