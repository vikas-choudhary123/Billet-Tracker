"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BarChart3, Check, ChevronDown, Clock, Filter, RefreshCw, Search } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { useBilletData } from "../lib/billet-context"

export default function TmtProductionPage() {
  const { billetRecords = [], receivingRecords = [], labTestingRecords = [], tmtPlanningRecords = [], refreshData } = useBilletData() || {}

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    if (refreshData) {
      refreshData()
    }
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Get billets that have completed lab testing
  const eligibleBillets = billetRecords.filter((record) => 
    labTestingRecords.some((lab) => lab.billetId === record.id)
  )

  // Filter records based on search query and status filter
  const filteredRecords = eligibleBillets.filter((record) => {
    const matchesSearch =
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.heatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.grade.toLowerCase().includes(searchQuery.toLowerCase())

    const tmtStatus = tmtPlanningRecords.find((t) => t.billetId === record.id) ? "planned" : "pending"

    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "planned" && tmtStatus === "planned") ||
      (statusFilter === "pending" && tmtStatus === "pending")

    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">TMT Production</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lab Tested Billets</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labTestingRecords.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">TMT Planned</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tmtPlanningRecords.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Planning</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labTestingRecords.length - tmtPlanningRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search billets..."
              className="w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === "all" ? "All Status" : statusFilter === "planned" ? "Planned" : "Pending"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("planned")}>Planned</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button asChild>
          <Link to="/workflow/tmt-planning">
            <BarChart3 className="h-4 w-4 mr-2" />
            Plan TMT Production
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>TMT Production Planning</CardTitle>
          <CardDescription>View and manage TMT production planning for lab-tested billets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Billet ID</TableHead>
                <TableHead>Heat Number</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Lab Test Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const labTest = labTestingRecords.find((lab) => lab.billetId === record.id)
                  const isPlanned = tmtPlanningRecords.some((t) => t.billetId === record.id)
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.heatNumber}</TableCell>
                      <TableCell>{record.grade}</TableCell>
                      <TableCell>{record.weight}</TableCell>
                      <TableCell>{labTest ? new Date(labTest.timestamp).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        {isPlanned ? (
                          <Badge className="bg-green-500">Planned</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/workflow/tmt-planning">{isPlanned ? "View Details" : "Plan Production"}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {eligibleBillets.length} records
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}