import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Clipboard } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { formatDate } from "./lib/utils"

function ReceivingHistory({ historyRecords }) {
  return (
    <Card className="border-blue-800 shadow-lg">
      <CardHeader className="bg-blue-700 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5" />
              Lab Testing History
            </CardTitle>
            <CardDescription className="text-teal-100">View all completed lab tests</CardDescription>
          </div>
          <Badge className="bg-white text-teal-700">{historyRecords.length} Records</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {historyRecords.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No receiving history found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-1000 hover:bg-blue-950">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Billet ID</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>LEDEL</TableHead>
                  <TableHead>CCM TOTAL PIECES</TableHead>
                  <TableHead>B.P. MILL TO</TableHead>
                  <TableHead>B.P. CCM TO</TableHead>
                  <TableHead>MILL TO. Pcs.</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-blue-950 transition-colors">
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(record.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">{record.billetId}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>{record.ledel}</TableCell>
                    <TableCell className="font-mono">{record.ccmTotalPieces}</TableCell>
                    <TableCell className="font-mono">{record.bpMillTo.toFixed(2)}</TableCell>
                    <TableCell className="font-mono">{record.bpCcmTo.toFixed(2)}</TableCell>
                    <TableCell className="font-mono">{record.millToPcs}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={record.remark}>
                      {record.remark || "-"}
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

export default ReceivingHistory
