"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ResourceUsage() {
  // Mock data - in a real app, this would come from an API
  const [data, setData] = useState([
    { name: "CPU", value: 65 },
    { name: "Memory", value: 42 },
    { name: "Storage", value: 28 },
    { name: "Bandwidth", value: 76 },
    { name: "Build Minutes", value: 53 },
  ])

  // Simulate data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(
        data.map((item) => ({
          ...item,
          value: Math.max(5, Math.min(95, item.value + (Math.random() * 10 - 5))),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [data])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select defaultValue="7days">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24hours">Last 24 hours</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Usage"]}
              contentStyle={{
                borderRadius: "6px",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {data.map((item) => (
          <div key={item.name} className="rounded-md border p-2 text-center">
            <div className="text-xs font-medium text-muted-foreground">{item.name}</div>
            <div className="text-lg font-bold">{Math.round(item.value)}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

