import React from "react";

export default function VerifiedIcon({
  size = 16,
  status = "verified",
}: {
  size?: number;
  status?: "verified" | "unverified";
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: "middle", marginLeft: 6 }}
    >
      <circle cx="10" cy="10" r="10" fill="#4ADE80" />
      <path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
