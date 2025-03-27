"use client"

export function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 bg-card rounded-lg shadow">
          <h2 className="text-lg font-semibold">Active Deployments</h2>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Deployments</h2>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h2 className="text-lg font-semibold">Success Rate</h2>
          <p className="text-2xl font-bold">95%</p>
        </div>
      </div>
    </div>
  )
} 