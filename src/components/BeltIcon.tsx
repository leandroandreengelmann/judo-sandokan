"use client";

import React from "react";

interface BeltIconProps {
  color: string;
  size?: number;
  className?: string;
}

// Mapeamento de cores para códigos de faixa
const beltColors: Record<string, string> = {
  branca: "#FFFFFF",
  bordô: "#800020",
  bordo: "#800020", // alternativa sem acento
  cinza: "#808080",
  azul: "#0066CC",
  amarelo: "#FFD700",
  amarela: "#FFD700", // compatibilidade
  verde: "#228B22",
  roxa: "#8A2BE2",
  marrom: "#8B4513",
  preta: "#000000",
  preto: "#000000", // compatibilidade
};

export const BeltIcon: React.FC<BeltIconProps> = ({
  color,
  size = 48,
  className = "",
}) => {
  const beltColor = beltColors[color.toLowerCase()] || "#6B7280"; // cinza como fallback
  const strokeColor = color.toLowerCase() === "branca" ? "#E5E7EB" : "#374151";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Faixa principal */}
      <rect
        x="2"
        y="10"
        width="20"
        height="4"
        rx="2"
        fill={beltColor}
        stroke={strokeColor}
        strokeWidth="1"
      />

      {/* Nó da faixa */}
      <ellipse
        cx="12"
        cy="12"
        rx="3"
        ry="2"
        fill={beltColor}
        stroke={strokeColor}
        strokeWidth="1"
      />

      {/* Pontas da faixa */}
      <rect
        x="14.5"
        y="14"
        width="1.5"
        height="6"
        rx="0.75"
        fill={beltColor}
        stroke={strokeColor}
        strokeWidth="0.5"
      />
      <rect
        x="8"
        y="14"
        width="1.5"
        height="6"
        rx="0.75"
        fill={beltColor}
        stroke={strokeColor}
        strokeWidth="0.5"
      />

      {/* Gradação/Detalhes para faixas escuras */}
      {(color.toLowerCase() === "preta" ||
        color.toLowerCase() === "preto" ||
        color.toLowerCase() === "marrom") && (
        <rect
          x="4"
          y="11"
          width="16"
          height="2"
          rx="1"
          fill="rgba(255, 255, 255, 0.1)"
        />
      )}

      {/* Estrela especial para faixa bordô */}
      {(color.toLowerCase() === "bordô" || color.toLowerCase() === "bordo") && (
        <g>
          <polygon
            points="12,8 13,10.5 15.5,10.5 13.5,12 14.5,14.5 12,13 9.5,14.5 10.5,12 8.5,10.5 11,10.5"
            fill="rgba(255, 215, 0, 0.8)"
            stroke="#FFD700"
            strokeWidth="0.5"
          />
        </g>
      )}
    </svg>
  );
};

// Componente para exibir faixa com texto
interface BeltDisplayProps {
  color: string;
  showText?: boolean;
  size?: number;
  className?: string;
}

export const BeltDisplay: React.FC<BeltDisplayProps> = ({
  color,
  showText = true,
  size = 48,
  className = "",
}) => {
  const capitalizedColor =
    color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BeltIcon color={color} size={size} />
      {showText && (
        <span className="text-sm font-medium text-gray-700">
          Faixa {capitalizedColor}
        </span>
      )}
    </div>
  );
};

// Hook para obter informações da faixa
export const useBeltInfo = (color: string) => {
  const beltColor = beltColors[color.toLowerCase()];
  const isValidBelt = Boolean(beltColor);

  const beltHierarchy = [
    "branca",
    "bordô",
    "cinza",
    "azul",
    "amarelo",
    "verde",
    "roxa",
    "marrom",
    "preta",
  ];
  const beltLevel = beltHierarchy.indexOf(color.toLowerCase()) + 1;

  return {
    color: beltColor,
    isValid: isValidBelt,
    level: beltLevel,
    name: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
    hierarchy: beltHierarchy,
  };
};
