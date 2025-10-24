import type React from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"
import type { GeminiAnalysis } from "@/types"

interface RadarChartComponentProps {
  data: GeminiAnalysis["chartData"]
}

const RadarChartComponent: React.FC<RadarChartComponentProps> = ({ data }) => {
  const chartData = [
    { subject: "Risiko", A: data.risiko, fullMark: 100 },
    { subject: "Sparen", A: data.sparen, fullMark: 100 },
    { subject: "Planung", A: data.planung, fullMark: 100 },
    { subject: "Liquidität", A: data.liquiditaet, fullMark: 100 },
    { subject: "Vermögen", A: data.vermoegen, fullMark: 100 },
    { subject: "Lifestyle", A: data.lifestyle, fullMark: 100 },
  ]

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Ihr Profil" dataKey="A" stroke="#749381" fill="#749381" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RadarChartComponent
