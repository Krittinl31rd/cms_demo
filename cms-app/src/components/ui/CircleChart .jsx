import React from "react";

// Reusable CircleChart component
const CircleChart = ({
  segments,
  highlightSegments = [],
  outerLabels = [],
}) => {
  const radius = 100; // circle radius
  const center = radius;
  const angleStep = (2 * Math.PI) / segments.length;

  return (
    <svg
      width={radius * 2 + 40}
      height={radius * 2 + 40}
      viewBox={`-20 -20 ${radius * 2 + 40} ${radius * 2 + 40}`}
      className="mx-auto"
    >
      {/* Outer circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        className="stroke-black fill-none"
      />

      {/* Segments */}
      {segments.map((seg, i) => {
        const startAngle = i * angleStep - Math.PI / 2;
        const endAngle = (i + 1) * angleStep - Math.PI / 2;

        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);

        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        const pathData = `
          M ${center} ${center}
          L ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
          Z
        `;

        return (
          <g key={i}>
            {/* Highlighted background */}
            <path
              d={pathData}
              className={
                highlightSegments.includes(i)
                  ? "fill-black/60 stroke-red-500"
                  : "fill-white stroke-black"
              }
            />

            {/* Segment label */}
            <text
              x={center + (radius / 2) * Math.cos(startAngle + angleStep / 2)}
              y={center + (radius / 2) * Math.sin(startAngle + angleStep / 2)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold"
            >
              {seg.label}
            </text>

            {/* Value text */}
            <text
              x={center + (radius - 20) * Math.cos(startAngle + angleStep / 2)}
              y={center + (radius - 20) * Math.sin(startAngle + angleStep / 2)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs"
            >
              {seg.value}
            </text>
          </g>
        );
      })}

      {/* Outer labels (12/3/6/9 etc, outside the circle) */}
      {outerLabels.map((lbl, i) => {
        const offset = radius + 10; // distance outside the circle
        const positions = [
          [center, center - offset], // top
          [center + offset, center], // right
          [center, center + offset], // bottom
          [center - offset, center], // left
        ];

        const pos = positions[i];
        return (
          <text
            key={lbl}
            x={pos[0]}
            y={pos[1]}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-red-600 font-bold"
          >
            {lbl}
          </text>
        );
      })}
    </svg>
  );
};

// Main app
export default function App() {
  const leftSegments = [
    { label: 4, value: "5K" },
    { label: 5, value: "6.5K" },
    { label: 6, value: "5.5K" },
    { label: 6, value: "5K" },
    { label: 3, value: "4.5K" },
    { label: 3, value: "4K" },
    { label: 3, value: "3K" },
    { label: 3, value: "2K" },
    { label: 4, value: "4.5K" },
    { label: 5, value: "5.5K" },
    { label: 6, value: "6K" },
    { label: 6, value: "6.5K" },
  ];

  const rightSegments = [
    { label: 1, value: "2K" },
    { label: 2, value: "2.5K" },
    { label: 3, value: "3K" },
    { label: 4, value: "3.5K" },
    { label: 5, value: "3.5K" },
    { label: 6, value: "4K" },
    { label: 7, value: "3.5K" },
    { label: 8, value: "2.5K" },
  ];

  return (
    <div className="flex justify-center gap-4 items-center ">
      {/* Left circle */}
      <CircleChart
        segments={leftSegments}
        highlightSegments={[]} // no highlight
        outerLabels={["12", "3", "6", "9"]}
      />

      {/* Right circle */}
      <CircleChart
        segments={rightSegments}
        highlightSegments={[0, 1, 2, 3]} // highlight half circle
        outerLabels={["00", "03", "6", "9"]}
      />
    </div>
  );
}
