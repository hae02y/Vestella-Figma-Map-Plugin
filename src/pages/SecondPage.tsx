import { View } from "reshaped";

export default function SecondPage({ onNext }: { onNext?: () => void }) {
  return (
    <div
      style={{
        width: 700,
        height: 1100,
        background: "#18181B",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.12)",
      }}
    >
      <View padding={4}>
        <div
          style={{
            background: "#23232A",
            padding: 32,
            borderRadius: 12,
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
            color: "#fff",
            minWidth: 240,
            textAlign: "center",
            width: 600,
          }}
        >
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: "#fff" }}>
            두 번째 화면입니다!
          </h2>
          {onNext && (
            <button
              style={{
                marginTop: 32,
                background: "#4ADE80",
                color: "#18181B",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
                boxShadow: "0 2px 8px 0 rgba(76,222,128,0.15)",
              }}
              onClick={onNext}
            >
              다음 단계로
            </button>
          )}
        </div>
      </View>
    </div>
  );
}
