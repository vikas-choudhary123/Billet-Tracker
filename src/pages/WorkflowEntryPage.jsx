"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronDown, FileText, Filter, RefreshCw, Search } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { useBilletData } from "../lib/billet-context"

export default function WorkflowEntryPage() {
  const { billetRecords, refreshData } = useBilletData()
  const [searchQuery, setSearchQuery] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Get unique grades
  const uniqueGrades = [...new Set(billetRecords.map((record) => record.grade))]

  // Filter records based on search query and grade filter
  const filteredRecords = billetRecords.filter((record) => {
    const matchesSearch =
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.heatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.grade.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = gradeFilter === "all" || record.grade === gradeFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/workflow">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Production Records</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
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
                {gradeFilter === "all" ? "All Grades" : gradeFilter}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setGradeFilter("all")}>All Grades</DropdownMenuItem>
              {uniqueGrades.map((grade) => (
                <DropdownMenuItem key={grade} onClick={() => setGradeFilter(grade)}>
                  {grade}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button asChild>
          <Link to="/entry">
            <FileText className="h-4 w-4 mr-2" />
            New Production Entry
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billet Production Records</CardTitle>
          <CardDescription>View all billet production entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Billet ID</TableHead>
                <TableHead>Heat Number</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Length (mm)</TableHead>
                <TableHead>Production Date</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>{record.heatNumber}</TableCell>
                    <TableCell>{record.grade}</TableCell>
                    <TableCell>{record.weight}</TableCell>
                    <TableCell>{record.length}</TableCell>
                    <TableCell>{new Date(record.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{record.operator}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/workflow?billetId=${record.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {billetRecords.length} records
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
