"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Clipboard } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Button } from "./components/ui/button"
import { formatDate } from "./lib/utils"

function PendingBillets({ pendingRecords, selectedBilletId, onSelectBillet }) {
  return (
    <Card className="border-teal-200 dark:border-teal-800 shadow-md">
      <CardHeader className="bg-teal-600 text-white dark:bg-teal-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5" />
              Pending Billets
            </CardTitle>
            <CardDescription className="text-teal-100">Select a billet to process receiving</CardDescription>
          </div>
          <Badge className="bg-white text-teal-700">{pendingRecords.length} Records</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {pendingRecords.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No pending billets available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Billet ID</TableHead>
                  <TableHead>Heat Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className={`hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors ${
                      selectedBilletId === record.billetId ? "bg-teal-100 dark:bg-teal-800/40" : ""
                    }`}
                  >
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(record.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium text-teal-700 dark:text-teal-400">{record.billetId}</TableCell>
                    <TableCell>{record.heatNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant={record.status === "pending" ? "outline" : "default"}
                        className={record.status === "pending" ? "bg-slate-100 text-slate-700" : ""}
                      >
                        {record.status === "pending" ? "Pending" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => onSelectBillet(record.billetId)}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        Process
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PendingBillets