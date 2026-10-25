import React from "react";

export interface ArrowIconProps {
  /**
   * "forward" = progression arrow (points right in LTR, points left in RTL)
   * "back" = back arrow (points left in LTR, points right in RTL)
   */
  direction?: "forward" | "back";
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ArrowIcon({
  direction = "forward",
  size = 18,
  className = "",
  style,
}: ArrowIconProps) {
  const isBack = direction === "back";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`arrow-icon ${isBack ? "arrow-icon--back" : "arrow-icon--forward"} ${className}`}
      style={{
        inlineSize: size,
        blockSize: size,
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points={isBack ? "12 19 5 12 12 5" : "12 5 19 12 12 19"} />
    </svg>
  );
}
