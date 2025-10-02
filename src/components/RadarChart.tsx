import React from 'react';
import Svg, { Polygon, Circle, G, Text as SvgText } from 'react-native-svg';

type Props = {
  size?: number;
  labels: string[]; // length 5
  values: number[]; // 0-100, length 5
  compareValues?: number[]; // optional benchmark 0-100
};

export function RadarChart({ size = 260, labels, values, compareValues }: Props) {
  const center = size / 2;
  const radius = (size / 2) * 0.75;
  const angle = (2 * Math.PI) / 5;

  const toPoint = (i: number, r: number) => {
    const a = -Math.PI / 2 + angle * i; // start at top
    return [center + r * Math.cos(a), center + r * Math.sin(a)];
  };

  const ring = (ratio: number) =>
    Array.from({ length: 5 }, (_, i) => toPoint(i, radius * ratio).join(',')).join(' ');

  const poly = (vals: number[]) =>
    vals
      .map((v, i) => toPoint(i, (radius * Math.max(0, Math.min(100, v))) / 100).join(','))
      .join(' ');

  return (
    <Svg width={size} height={size}>
      <G>
        {/* rings */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((r, idx) => (
          <Polygon key={idx} points={ring(r)} fill="none" stroke="#E5E7EB" strokeWidth={1} />
        ))}

        {/* benchmark */}
        {compareValues ? (
          <Polygon points={poly(compareValues)} fill="rgba(0,0,0,0.1)" stroke="#6B7280" strokeWidth={1} />
        ) : null}

        {/* user values */}
        <Polygon points={poly(values)} fill="rgba(59,130,246,0.2)" stroke="#3B82F6" strokeWidth={2} />

        {/* labels */}
        {labels.map((l, i) => {
          const [x, y] = toPoint(i, radius + 16);
          return (
            <SvgText key={l} x={x} y={y} fontSize={12} fill="#374151" textAnchor="middle">
              {l}
            </SvgText>
          );
        })}
      </G>
    </Svg>
  );
}





