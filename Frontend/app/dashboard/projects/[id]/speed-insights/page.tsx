"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, RefreshCw, Zap, Smartphone, Monitor, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export default function SpeedInsightsPage({ params }: { params: { id: string } }) {
  // Mock data - in a real app, this would come from your API
  const performanceData = {
    mobile: {
      performance: 78,
      accessibility: 92,
      bestPractices: 85,
      seo: 95,
      pwa: 60,
      firstContentfulPaint: "1.8s",
      speedIndex: "2.4s",
      largestContentfulPaint: "2.9s",
      timeToInteractive: "3.5s",
      totalBlockingTime: "250ms",
      cumulativeLayoutShift: "0.12",
    },
    desktop: {
      performance: 92,
      accessibility: 95,
      bestPractices: 90,
      seo: 98,
      pwa: 60,
      firstContentfulPaint: "0.9s",
      speedIndex: "1.2s",
      largestContentfulPaint: "1.5s",
      timeToInteractive: "1.8s",
      totalBlockingTime: "120ms",
      cumulativeLayoutShift: "0.05",
    },
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 50) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 50) return "bg-orange-500"
    return "bg-red-500"
  }

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 className="h-4 w-4 text-green-500" />
    if (score >= 50) return <AlertTriangle className="h-4 w-4 text-orange-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Speed Insights</h2>
          <Badge variant="outline" className="ml-2">
            Beta
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="latest">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Report</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="lastweek">Last Week</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="mobile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mobile" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="desktop" className="gap-2">
            <Monitor className="h-4 w-4" />
            Desktop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Core Web Vitals and Lighthouse scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-5">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`flex h-24 w-24 items-center justify-center rounded-full ${getScoreBg(performanceData.mobile.performance)} text-white text-2xl font-bold`}
                    >
                      {performanceData.mobile.performance}
                    </div>
                    <span className="mt-2 text-sm font-medium">Performance</span>
                  </div>
                  <div className="space-y-4 md:col-span-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Accessibility</span>
                        <span className={`text-sm font-medium ${getScoreColor(performanceData.mobile.accessibility)}`}>
                          {performanceData.mobile.accessibility}
                        </span>
                      </div>
                      <Progress value={performanceData.mobile.accessibility} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Best Practices</span>
                        <span className={`text-sm font-medium ${getScoreColor(performanceData.mobile.bestPractices)}`}>
                          {performanceData.mobile.bestPractices}
                        </span>
                      </div>
                      <Progress value={performanceData.mobile.bestPractices} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">SEO</span>
                        <span className={`text-sm font-medium ${getScoreColor(performanceData.mobile.seo)}`}>
                          {performanceData.mobile.seo}
                        </span>
                      </div>
                      <Progress value={performanceData.mobile.seo} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">PWA</span>
                        <span className={`text-sm font-medium ${getScoreColor(performanceData.mobile.pwa)}`}>
                          {performanceData.mobile.pwa}
                        </span>
                      </div>
                      <Progress value={performanceData.mobile.pwa} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>Key metrics that affect user experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">LCP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.mobile.largestContentfulPaint === "2.9s" ? 80 : 0)}
                      <span className="text-sm">{performanceData.mobile.largestContentfulPaint}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">FID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.mobile.totalBlockingTime === "250ms" ? 75 : 0)}
                      <span className="text-sm">{performanceData.mobile.totalBlockingTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">CLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.mobile.cumulativeLayoutShift === "0.12" ? 85 : 0)}
                      <span className="text-sm">{performanceData.mobile.cumulativeLayoutShift}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">FCP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.mobile.firstContentfulPaint === "1.8s" ? 90 : 0)}
                      <span className="text-sm">{performanceData.mobile.firstContentfulPaint}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">TTI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.mobile.timeToInteractive === "3.5s" ? 70 : 0)}
                      <span className="text-sm">{performanceData.mobile.timeToInteractive}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
              <CardDescription>Suggestions to improve your site's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Eliminate render-blocking resources</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline
                      and deferring all non-critical JS/styles.
                    </p>
                    <Button variant="link" size="sm" className="px-0 mt-1">
                      Learn more
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Properly size images</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Serve images that are appropriately-sized to save cellular data and improve load time.
                    </p>
                    <Button variant="link" size="sm" className="px-0 mt-1">
                      Learn more
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Serve images in next-gen formats</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Image formats like WebP and AVIF often provide better compression than PNG or JPEG, which means
                      faster downloads and less data consumption.
                    </p>
                    <Button variant="link" size="sm" className="px-0 mt-1">
                      Learn more
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="desktop" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Core Web Vitals and Lighthouse scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-5">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`flex h-24 w-24 items-center justify-center rounded-full ${getScoreBg(performanceData.desktop.performance)} text-white text-2xl font-bold`}
                    >
                      {performanceData.desktop.performance}
                    </div>
                    <span className="mt-2 text-sm font-medium">Performance</span>
                  </div>
                  <div className="space-y-4 md:col-span-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Accessibility</span>
                        <span className={`text-sm font-medium ${getScoreColor(performanceData.desktop.accessibility)}`}>
                          {performanceData.desktop.accessibility}
                        </span>
                      </div>
                      <Progress value={performanceData.desktop.accessibility} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Best Practices</span>
                        <span className={`text-sm font-medium ${getScoreColor(performanceData.desktop.bestPractices)}`}>
                          {performanceData.desktop.bestPractices}
                        </span>
                      </div>
                      <Progress value={performanceData.desktop.bestPractices} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">SEO</span>
                        <span className={`text-sm font-medium ${getScoreColor(performanceData.desktop.seo)}`}>
                          {performanceData.desktop.seo}
                        </span>
                      </div>
                      <Progress value={performanceData.desktop.seo} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">PWA</span>
                        <span className={`text-sm font-medium ${getScoreColor(performanceData.desktop.pwa)}`}>
                          {performanceData.desktop.pwa}
                        </span>
                      </div>
                      <Progress value={performanceData.desktop.pwa} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>Key metrics that affect user experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">LCP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.desktop.largestContentfulPaint === "1.5s" ? 95 : 0)}
                      <span className="text-sm">{performanceData.desktop.largestContentfulPaint}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">FID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.desktop.totalBlockingTime === "120ms" ? 90 : 0)}
                      <span className="text-sm">{performanceData.desktop.totalBlockingTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">CLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.desktop.cumulativeLayoutShift === "0.05" ? 95 : 0)}
                      <span className="text-sm">{performanceData.desktop.cumulativeLayoutShift}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">FCP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.desktop.firstContentfulPaint === "0.9s" ? 98 : 0)}
                      <span className="text-sm">{performanceData.desktop.firstContentfulPaint}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">TTI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(performanceData.desktop.timeToInteractive === "1.8s" ? 92 : 0)}
                      <span className="text-sm">{performanceData.desktop.timeToInteractive}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
