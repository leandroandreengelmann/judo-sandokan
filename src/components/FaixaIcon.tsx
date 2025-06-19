"use client";

import React from "react";

interface FaixaIconProps {
  type: string;
  color: string;
  size?: number;
  className?: string;
}

export const FaixaIcon: React.FC<FaixaIconProps> = ({
  type,
  color,
  size = 32,
  className = "",
}) => {
  const strokeColor = color === "#FFFFFF" ? "#E5E7EB" : "#374151";

  const renderIcon = () => {
    switch (type) {
      case "mdi:circle":
        return (
          <circle
            cx="12"
            cy="12"
            r="8"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case "mdi:circle-slice-8":
        return (
          <circle
            cx="12"
            cy="12"
            r="8"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case "mdi:star":
        return (
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={color}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
        );

      case "mdi:star-box":
        return (
          <g>
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              fill={color}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <polygon
              points="12,6 13.5,10 17,10 14.5,12.5 15.5,16.5 12,14.5 8.5,16.5 9.5,12.5 7,10 10.5,10"
              fill="#FFD700"
              stroke="#B8860B"
              strokeWidth="0.5"
            />
          </g>
        );

      case "mdi:square":
        return (
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="1"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case "mdi:rectangle":
        return (
          <rect
            x="3"
            y="7"
            width="18"
            height="10"
            rx="1"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case "mdi:diamond":
        return (
          <polygon
            points="12,3 20,12 12,21 4,12"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case "mdi:ellipse":
        return (
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="6"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case "mdi:hexagon":
        return (
          <polygon
            points="12,2 20,7 20,17 12,22 4,17 4,7"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case "mdi:triangle":
        return (
          <polygon
            points="12,3 21,20 3,20"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );

      case "mdi:shield":
        return (
          <path
            d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V14H15.5A1,1 0 0,1 16.5,15V19A1,1 0 0,1 15.5,20H8.5A1,1 0 0,1 7.5,19V15A1,1 0 0,1 8.5,14H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V14H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"
            fill={color}
            stroke={strokeColor}
            strokeWidth="1"
          />
        );

      case "mdi:medal":
        return (
          <g>
            <circle
              cx="12"
              cy="9"
              r="6"
              fill={color}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <path
              d="M8,15 L6,22 L10,20 L12,22 L14,20 L18,22 L16,15"
              fill={color}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="9"
              r="3"
              fill="#FFD700"
              stroke="#B8860B"
              strokeWidth="1"
            />
          </g>
        );

      default:
        return (
          <circle
            cx="12"
            cy="12"
            r="8"
            fill={color}
            stroke={strokeColor}
            strokeWidth="2"
          />
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {renderIcon()}
    </svg>
  );
};
