"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ChevronDown, FileText, Filter, RefreshCw, Search } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Label } from "../components/ui/label"
import { useBilletData } from "../lib/billet-context"
import { useAuth } from "../lib/auth-context"

export default function WorkflowLabTestingPage() {
  const { billetRecords, receivingRecords, labTestingRecords, addLabTestingRecord, refreshData } = useBilletData()

  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form state
  const [selectedBillet, setSelectedBillet] = useState(null)
  const [carbonContent, setCarbonContent] = useState("")
  const [tensileStrength, setTensileStrength] = useState("")
  const [yieldStrength, setYieldStrength] = useState("")
  const [elongation, setElongation] = useState("")
  const [testNotes, setTestNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Get billets that have been received
  const receivedBillets = billetRecords.filter((record) => receivingRecords.some((r) => r.billetId === record.id))

  // Filter records based on search query and status filter
  const filteredRecords = receivedBillets.filter((record) => {
    const matchesSearch =
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.heatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.grade.toLowerCase().includes(searchQuery.toLowerCase())

    const isLabTested = labTestingRecords.some((l) => l.billetId === record.id)

    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "tested" && isLabTested) ||
      (statusFilter === "pending" && !isLabTested)

    return matchesSearch && matchesFilter
  })

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedBillet) return

    const newLabTestingRecord = {
      id: `LAB-${Date.now()}`,
      billetId: selectedBillet.id,
      carbonContent: Number.parseFloat(carbonContent),
      tensileStrength: Number.parseFloat(tensileStrength),
      yieldStrength: Number.parseFloat(yieldStrength),
      elongation: Number.parseFloat(elongation),
      notes: testNotes,
      testedBy: user.name,
      timestamp: new Date().toISOString(),
    }

    addLabTestingRecord(newLabTestingRecord)

    // Reset form
    setCarbonContent("")
    setTensileStrength("")
    setYieldStrength("")
    setElongation("")
    setTestNotes("")
    setSelectedBillet(null)
    setIsDialogOpen(false)
  }

  // Open dialog with billet data
  const openLabTestingDialog = (billet) => {
    setSelectedBillet(billet)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/workflow">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Lab Testing</h1>
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
                {statusFilter === "all" ? "All Status" : statusFilter === "tested" ? "Tested" : "Pending"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("tested")}>Tested</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lab Testing</CardTitle>
          <CardDescription>Process and record lab testing results for received billets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Billet ID</TableHead>
                <TableHead>Heat Number</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Receiving Date</TableHead>
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
                  const isLabTested = labTestingRecords.some((l) => l.billetId === record.id)
                  const labTestingRecord = labTestingRecords.find((l) => l.billetId === record.id)
                  const receivingRecord = receivingRecords.find((r) => r.billetId === record.id)
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.heatNumber}</TableCell>
                      <TableCell>{record.grade}</TableCell>
                      <TableCell>{record.weight}</TableCell>
                      <TableCell>
                        {receivingRecord ? new Date(receivingRecord.timestamp).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        {isLabTested ? (
                          <Badge className="bg-green-500">Tested</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isLabTested ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBillet(record)
                              setCarbonContent(labTestingRecord.carbonContent.toString())
                              setTensileStrength(labTestingRecord.tensileStrength.toString())
                              setYieldStrength(labTestingRecord.yieldStrength.toString())
                              setElongation(labTestingRecord.elongation.toString())
                              setTestNotes(labTestingRecord.notes)
                              setIsDialogOpen(true)
                            }}
                          >
                            View Results
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openLabTestingDialog(record)}>
                            Record Test Results
                          </Button>
                        )}
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
            Showing {filteredRecords.length} of {receivedBillets.length} records
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {labTestingRecords.some((l) => l.billetId === selectedBillet?.id)
                ? "Lab Testing Results"
                : "Record Lab Testing Results"}
            </DialogTitle>
            <DialogDescription>
              {labTestingRecords.some((l) => l.billetId === selectedBillet?.id)
                ? "View the lab testing results for this billet."
                : "Enter the lab testing results for this billet."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billetId">Billet ID</Label>
                  <Input id="billetId" value={selectedBillet?.id || ""} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="heatNumber">Heat Number</Label>
                  <Input id="heatNumber" value={selectedBillet?.heatNumber || ""} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbonContent">Carbon Content (%)</Label>
                  <Input
                    id="carbonContent"
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={carbonContent}
                    onChange={(e) => setCarbonContent(e.target.value)}
                    required
                    readOnly={labTestingRecords.some((l) => l.billetId === selectedBillet?.id)}
                    className={labTestingRecords.some((l) => l.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="tensileStrength">Tensile Strength (MPa)</Label>
                  <Input
                    id="tensileStrength"
                    type="number"
                    step="0.1"
                    min="0"
                    value={tensileStrength}
                    onChange={(e) => setTensileStrength(e.target.value)}
                    required
                    readOnly={labTestingRecords.some((l) => l.billetId === selectedBillet?.id)}
                    className={labTestingRecords.some((l) => l.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yieldStrength">Yield Strength (MPa)</Label>
                  <Input
                    id="yieldStrength"
                    type="number"
                    step="0.1"
                    min="0"
                    value={yieldStrength}
                    onChange={(e) => setYieldStrength(e.target.value)}
                    required
                    readOnly={labTestingRecords.some((l) => l.billetId === selectedBillet?.id)}
                    className={labTestingRecords.some((l) => l.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="elongation">Elongation (%)</Label>
                  <Input
                    id="elongation"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={elongation}
                    onChange={(e) => setElongation(e.target.value)}
                    required
                    readOnly={labTestingRecords.some((l) => l.billetId === selectedBillet?.id)}
                    className={labTestingRecords.some((l) => l.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  readOnly={labTestingRecords.some((l) => l.billetId === selectedBillet?.id)}
                  className={labTestingRecords.some((l) => l.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                />
              </div>
              {labTestingRecords.some((l) => l.billetId === selectedBillet?.id) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="testedBy">Tested By</Label>
                      <Input
                        id="testedBy"
                        value={labTestingRecords.find((l) => l.billetId === selectedBillet?.id)?.testedBy || ""}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timestamp">Timestamp</Label>
                      <Input
                        id="timestamp"
                        value={new Date(
                          labTestingRecords.find((l) => l.billetId === selectedBillet?.id)?.timestamp,
                        ).toLocaleString()}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              {!labTestingRecords.some((l) => l.billetId === selectedBillet?.id) && (
                <Button type="submit">
                  <FileText className="h-4 w-4 mr-2" />
                  Record Test Results
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
