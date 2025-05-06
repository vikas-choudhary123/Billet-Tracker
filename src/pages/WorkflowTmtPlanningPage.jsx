"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BarChart3, ChevronDown, Filter, RefreshCw, Search } from "lucide-react"
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

export default function WorkflowTmtPlanningPage() {
  const { billetRecords, labTestingRecords, tmtPlanningRecords, addTmtPlanningRecord, refreshData } = useBilletData()

  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form state
  const [selectedBillet, setSelectedBillet] = useState(null)
  const [diameter, setDiameter] = useState("")
  const [length, setLength] = useState("")
  const [quantity, setQuantity] = useState("")
  const [planningNotes, setPlanningNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Get billets that have been lab tested
  const labTestedBillets = billetRecords.filter((record) => labTestingRecords.some((l) => l.billetId === record.id))

  // Filter records based on search query and status filter
  const filteredRecords = labTestedBillets.filter((record) => {
    const matchesSearch =
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.heatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.grade.toLowerCase().includes(searchQuery.toLowerCase())

    const isPlanned = tmtPlanningRecords.some((t) => t.billetId === record.id)

    const matchesFilter =
      statusFilter === "all" || (statusFilter === "planned" && isPlanned) || (statusFilter === "pending" && !isPlanned)

    return matchesSearch && matchesFilter
  })

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedBillet) return

    const newTmtPlanningRecord = {
      id: `TMT-${Date.now()}`,
      billetId: selectedBillet.id,
      diameter: Number.parseFloat(diameter),
      length: Number.parseFloat(length),
      quantity: Number.parseInt(quantity),
      notes: planningNotes,
      plannedBy: user.name,
      timestamp: new Date().toISOString(),
    }

    addTmtPlanningRecord(newTmtPlanningRecord)

    // Reset form
    setDiameter("")
    setLength("")
    setQuantity("")
    setPlanningNotes("")
    setSelectedBillet(null)
    setIsDialogOpen(false)
  }

  // Open dialog with billet data
  const openTmtPlanningDialog = (billet) => {
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
          <h1 className="text-3xl font-bold tracking-tight">TMT Planning</h1>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>TMT Production Planning</CardTitle>
          <CardDescription>Plan TMT production for lab-tested billets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Billet ID</TableHead>
                <TableHead>Heat Number</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Lab Test Results</TableHead>
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
                  const isPlanned = tmtPlanningRecords.some((t) => t.billetId === record.id)
                  const tmtPlanningRecord = tmtPlanningRecords.find((t) => t.billetId === record.id)
                  const labTestingRecord = labTestingRecords.find((l) => l.billetId === record.id)
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>{record.heatNumber}</TableCell>
                      <TableCell>{record.grade}</TableCell>
                      <TableCell>{record.weight}</TableCell>
                      <TableCell>
                        {labTestingRecord
                          ? `C: ${labTestingRecord.carbonContent}%, TS: ${labTestingRecord.tensileStrength} MPa`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {isPlanned ? (
                          <Badge className="bg-green-500">Planned</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPlanned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBillet(record)
                              setDiameter(tmtPlanningRecord.diameter.toString())
                              setLength(tmtPlanningRecord.length.toString())
                              setQuantity(tmtPlanningRecord.quantity.toString())
                              setPlanningNotes(tmtPlanningRecord.notes)
                              setIsDialogOpen(true)
                            }}
                          >
                            View Plan
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openTmtPlanningDialog(record)}>
                            Create Plan
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
            Showing {filteredRecords.length} of {labTestedBillets.length} records
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id)
                ? "TMT Production Plan"
                : "Create TMT Production Plan"}
            </DialogTitle>
            <DialogDescription>
              {tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id)
                ? "View the TMT production plan for this billet."
                : "Create a TMT production plan for this billet."}
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
                  <Label htmlFor="grade">Grade</Label>
                  <Input id="grade" value={selectedBillet?.grade || ""} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diameter">Diameter (mm)</Label>
                  <Input
                    id="diameter"
                    type="number"
                    step="0.1"
                    min="0"
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value)}
                    required
                    readOnly={tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id)}
                    className={tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="length">Length (m)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    min="0"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    required
                    readOnly={tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id)}
                    className={tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  readOnly={tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id)}
                  className={tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={planningNotes}
                  onChange={(e) => setPlanningNotes(e.target.value)}
                  readOnly={tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id)}
                  className={tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id) ? "bg-muted" : ""}
                />
              </div>
              {tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plannedBy">Planned By</Label>
                      <Input
                        id="plannedBy"
                        value={tmtPlanningRecords.find((t) => t.billetId === selectedBillet?.id)?.plannedBy || ""}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timestamp">Timestamp</Label>
                      <Input
                        id="timestamp"
                        value={new Date(
                          tmtPlanningRecords.find((t) => t.billetId === selectedBillet?.id)?.timestamp,
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
              {!tmtPlanningRecords.some((t) => t.billetId === selectedBillet?.id) && (
                <Button type="submit">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Create Production Plan
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
