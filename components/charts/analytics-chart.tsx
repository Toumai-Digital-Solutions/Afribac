"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ChartData {
  name: string
  value: number
  color?: string
}

interface AnalyticsChartProps {
  title: string
  description?: string
  data: ChartData[]
  type: "bar" | "pie" | "line" | "area"
  height?: number
  showTrend?: boolean
  trendValue?: number
  trendLabel?: string
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
]

export function AnalyticsChart({
  title,
  description,
  data,
  type,
  height = 300,
  showTrend = false,
  trendValue = 0,
  trendLabel = "par rapport au mois dernier"
}: AnalyticsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium text-card-foreground">{label}</p>
          <p className="text-primary">
            <span className="text-muted-foreground">Valeur: </span>
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  const renderTrendIndicator = () => {
    if (!showTrend) return null

    const isPositive = trendValue > 0
    const isNegative = trendValue < 0
    const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${
          isPositive ? 'text-success' : 
          isNegative ? 'text-destructive' : 'text-muted-foreground'
        }`} />
        <span className={`text-sm font-medium ${
          isPositive ? 'text-success' : 
          isNegative ? 'text-destructive' : 'text-muted-foreground'
        }`}>
          {isPositive ? '+' : ''}{trendValue}%
        </span>
        <span className="text-sm text-muted-foreground">{trendLabel}</span>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {renderTrendIndicator()}
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
        
        {/* Legend for Pie Charts */}
        {type === "pie" && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Predefined chart data for common use cases
export const sampleData = {
  studyTime: [
    { name: "Lun", value: 2.5 },
    { name: "Mar", value: 3.2 },
    { name: "Mer", value: 1.8 },
    { name: "Jeu", value: 4.1 },
    { name: "Ven", value: 3.7 },
    { name: "Sam", value: 5.2 },
    { name: "Dim", value: 2.9 }
  ],
  
  subjectDistribution: [
    { name: "Mathématiques", value: 35 },
    { name: "Physique", value: 25 },
    { name: "Chimie", value: 20 },
    { name: "Français", value: 15 },
    { name: "Autres", value: 5 }
  ],
  
  monthlyProgress: [
    { name: "Jan", value: 45 },
    { name: "Fév", value: 52 },
    { name: "Mar", value: 48 },
    { name: "Avr", value: 61 },
    { name: "Mai", value: 55 },
    { name: "Jui", value: 67 }
  ],
  
  countryEngagement: [
    { name: "Sénégal", value: 4521 },
    { name: "Côte d'Ivoire", value: 3847 },
    { name: "Mali", value: 2156 },
    { name: "Burkina Faso", value: 1843 },
    { name: "Niger", value: 480 }
  ]
}
