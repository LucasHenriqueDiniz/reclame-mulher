import React from "react";

interface ColorfulDividerProps {
  className?: string;
  colors?: string[];
  height?: string;
}

export function ColorfulDivider({ 
  className = "", 
  colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
  height = "h-1"
}: ColorfulDividerProps) {
  return (
    <div className={`w-full ${height} flex ${className}`}>
      {colors.map((color, index) => (
        <div
          key={index}
          className="flex-1"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

// Variantes pré-definidas
export function BrandColorfulDivider({ className = "" }: { className?: string }) {
  return (
    <ColorfulDivider
      colors={["#1E88E5", "#3BA5FF", "#2A1B55", "#4C2D8F", "#1976D2"]}
      className={className}
    />
  );
}

export function WarmColorfulDivider({ className = "" }: { className?: string }) {
  return (
    <ColorfulDivider
      colors={["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCF7F", "#4ECDC4"]}
      className={className}
    />
  );
}

export function CoolColorfulDivider({ className = "" }: { className?: string }) {
  return (
    <ColorfulDivider
      colors={["#667EEA", "#764BA2", "#F093FB", "#4FACFE", "#00F2FE"]}
      className={className}
    />
  );
}
