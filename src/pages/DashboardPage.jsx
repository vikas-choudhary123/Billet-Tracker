"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBilletData } from "@/lib/billet-context"
import { useAuth } from "@/lib/auth-context"
import {
  RefreshCw,
  Factory,
  Layers,
  FlaskRoundIcon as Flask,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const {
    records,
    receivingRecords,
    labTestingRecords,
    refreshData,
    getPendingBilletRecords,
    getPendingReceivingRecords,
    getPendingLabTestingRecords,
  } = useBilletData()

  const { isAuthenticated, hasPermission, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [timeRange, setTimeRange] = useState("all") // "today", "week", "month", "all"

  // Only render after first mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Only run this effect if we're mounted and auth is not loading
    if (!isMounted || authLoading) return

    if (!isAuthenticated) {
      navigate("/")
      return
    }

    // Safely get records after component is mounted
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await refreshData()
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isMounted, authLoading, isAuthenticated, navigate, refreshData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }

  // Filter records based on time range
  const filterRecordsByTime = (records) => {
    if (timeRange === "all") return records

    const now = new Date()
    const cutoff = new Date()

    if (timeRange === "today") {
      cutoff.setHours(0, 0, 0, 0)
    } else if (timeRange === "week") {
      cutoff.setDate(now.getDate() - 7)
    } else if (timeRange === "month") {
      cutoff.setMonth(now.getMonth() - 1)
    }

    return records.filter((record) => new Date(record.timestamp) >= cutoff)
  }

  // Get filtered records
  const filteredProduction = filterRecordsByTime(records)
  const filteredReceiving = filterRecordsByTime(receivingRecords)
  const filteredLabTesting = filterRecordsByTime(labTestingRecords)

  // If not mounted yet or auth is loading, show a skeleton
  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-teal-100">
        <Header />
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Get pending counts
  const pendingBillets = getPendingBilletRecords().length
  const pendingReceiving = getPendingReceivingRecords().length
  const pendingLabTesting = getPendingLabTestingRecords().length

  // Calculate totals
  const totalProduction = filteredProduction.length
  const totalReceiving = filteredReceiving.length
  const totalLabTests = filteredLabTesting.length

  // Calculate completion percentages
  const totalRecords = totalProduction + totalReceiving + totalLabTests
  const completedRecords = totalLabTests
  const completionPercentage = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0

  // Calculate total production volume
  const totalProductionVolume = filteredProduction.reduce((sum, record) => sum + (Number(record.productionCmd) || 0), 0)
  const totalScrapVolume = filteredProduction.reduce((sum, record) => sum + (Number(record.scrapCmd) || 0), 0)

  return (
    <div className="min-h-screen bg-slate-900 from-cyan-50 to-teal-100 text-white">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">Production Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Monitor and analyze your production records</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center space-x-2 mr-2">
              <label htmlFor="timeRange" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Time Range:
              </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-2 py-1"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-400 dark:hover:bg-cyan-900/30"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 text-white">
          <Card className="border-cyan-200 dark:border-cyan-800 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Production Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{totalProduction}</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Total records</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Production Volume:</span>
                      <span className="font-medium">{totalProductionVolume.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Scrap Volume:</span>
                      <span className="font-medium">{totalScrapVolume.toFixed(2)} MT</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-teal-200 dark:border-teal-800 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-teal-700 dark:text-teal-400 flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{pendingBillets + pendingReceiving + pendingLabTesting}</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Total pending tasks</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Production:</span>
                      <Badge className="bg-yellow-500">{pendingBillets}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Receiving:</span>
                      <Badge className="bg-yellow-500">{pendingReceiving}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lab Testing:</span>
                      <Badge className="bg-yellow-500">{pendingLabTesting}</Badge>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-800 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Workflow Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{completionPercentage}%</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Workflow completion</p>
                  <div className="mt-4">
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {completedRecords} of {totalRecords} records completed
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-700 dark:text-amber-400 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="space-y-2">
                    {pendingBillets > 0 && (
                      <Link to="/workflow/entry">
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white justify-between">
                          <span>Production Entry</span>
                          <Badge className="bg-white text-amber-700 ml-2">{pendingBillets}</Badge>
                        </Button>
                      </Link>
                    )}
                    {pendingReceiving > 0 && (
                      <Link to="/workflow/receiving">
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white justify-between">
                          <span>Receiving</span>
                          <Badge className="bg-white text-amber-700 ml-2">{pendingReceiving}</Badge>
                        </Button>
                      </Link>
                    )}
                    {pendingLabTesting > 0 && (
                      <Link to="/workflow/lab-testing">
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white justify-between">
                          <span>Lab Testing</span>
                          <Badge className="bg-white text-amber-700 ml-2">{pendingLabTesting}</Badge>
                        </Button>
                      </Link>
                    )}
                    {pendingBillets === 0 && pendingReceiving === 0 && pendingLabTesting === 0 && (
                      <div className="text-center p-2 text-slate-500 dark:text-slate-400">
                        No pending tasks. All workflows are up to date!
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workflow Status Card */}
        <Card className="border-cyan-200 dark:border-cyan-800 shadow-md mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400">Production Workflow Status</CardTitle>
            <CardDescription>Track billets through the production pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                  <div className="relative flex justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center z-10">
                        1
                      </div>
                      <span className="text-sm mt-2">Production</span>
                      <span className="text-xs text-cyan-600 font-bold">{pendingBillets} pending</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center z-10">
                        2
                      </div>
                      <span className="text-sm mt-2">Receiving</span>
                      <span className="text-xs text-teal-600 font-bold">{pendingReceiving} pending</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10">
                        3
                      </div>
                      <span className="text-sm mt-2">Lab Testing</span>
                      <span className="text-xs text-emerald-600 font-bold">{pendingLabTesting} pending</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Production Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="border-cyan-200 dark:border-cyan-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400">Production Statistics</CardTitle>
              <CardDescription>Key metrics for production performance</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Total Production</div>
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {totalProductionVolume.toFixed(2)} MT
                      </div>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Total Scrap</div>
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {totalScrapVolume.toFixed(2)} MT
                      </div>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Efficiency Rate</div>
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {totalProductionVolume + totalScrapVolume > 0
                          ? ((totalProductionVolume / (totalProductionVolume + totalScrapVolume)) * 100).toFixed(1)
                          : "0"}
                        %
                      </div>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-300">Avg. Production</div>
                      <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {totalProduction > 0 ? (totalProductionVolume / totalProduction).toFixed(2) : "0"} MT
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-cyan-200 dark:border-cyan-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400">Quick Actions</CardTitle>
              <CardDescription>Access common tasks and workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {hasPermission("production") && (
                  <Link to="/workflow/entry">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white justify-start">
                      <Factory className="mr-2 h-4 w-4" />
                      New Production Entry
                    </Button>
                  </Link>
                )}
                {hasPermission("receiving") && (
                  <Link to="/workflow/receiving">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white justify-start">
                      <Layers className="mr-2 h-4 w-4" />
                      Billet Receiving
                    </Button>
                  </Link>
                )}
                {hasPermission("labTesting") && (
                  <Link to="/workflow/lab-testing">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-start">
                      <Flask className="mr-2 h-4 w-4" />
                      Lab Testing
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
