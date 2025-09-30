import React from "react";

interface MessageProps {
  type?: "success" | "error" | "info";
  text: string;
}

const Message: React.FC<MessageProps> = ({ type = "info", text }) => {
  let color = "#fff";
  if (type === "success") color = "#4ADE80"; // 초록
  if (type === "error") color = "#FF5A5A"; // 빨강
  if (type === "info") color = "#60A5FA"; // 파랑

  return (
    <div
      className="message"
      style={{
        width: "100%",
        backgroundColor: "#353535ff",
        padding: "30px 50px",
        margin: "0 12px 0px 0px",
        borderRadius: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          textAlign: "center",
          fontWeight: 500,
          color,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default Message;
