"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadarChart, ResponsiveContainer, PolarRadiusAxis } from "recharts"

interface RadarChartProps {
	data: {
		subject: string
		value: number
	}[]
}

const CompassAxisTick = ({ payload, x, y, textAnchor  }: any) => {
    return (
      <g className="recharts-layer recharts-polar-angle-axis-tick">
        <text
          x={x}
          y={y}
          textAnchor={textAnchor}
          fill="currentColor"
          className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary/80"
          dy={payload.coordinate > 0 ? 4 : -4} 
        >
          {payload.value}
        </text>
      </g>
    );
  };

export const RadarChart = ({ data }: RadarChartProps) => {
    const plotData = data.map(d => ({...d, fullMark: 100}));

	return (
		<div className="aspect-square w-full max-w-md mx-auto relative">
            <div className="absolute inset-4 rounded-full border-2 border-muted/40 bg-muted/10 pointer-events-none" />

			<ResponsiveContainer width="100%" height="100%">
				<RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={plotData}>
					<PolarGrid 
                        gridType="circle" 
                        stroke="currentColor" 
                        className="text-muted-foreground/20"
                        strokeWidth={1}
                    />

                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
					<PolarAngleAxis
						dataKey="subject"
                        tick={(props) => <CompassAxisTick {...props} />}
                        tickLine={false} 
					/>
					<Radar
						name="Ihr Profil"
						dataKey="value"
						stroke="currentColor"
						fill="currentColor"
						fillOpacity={0.5}
						className="text-primary transition-all duration-500 ease-in-out"
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-out"
					/>
                     <circle
                        cx="50%"
                        cy="50%"
                        r="80%" 
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        className="text-primary/40"
                     />
				</RechartsRadarChart>
			</ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/80 border-2 border-background shadow-sm pointer-events-none" />
		</div>
	)
}
