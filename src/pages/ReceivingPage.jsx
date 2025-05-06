"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
import { useBilletData } from "../lib/billet-context"
import { useAuth } from "../lib/auth-context"
import { ArrowLeft, Save, Loader2, AlertCircle, Clipboard } from "lucide-react"
import Header from "../components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import PendingBillets from "../Receiving-Pending"
import ReceivingHistory from "../Receving-History"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"

function WorkflowReceivingPage() {
  const navigate = useNavigate()
  const {
    getPendingBilletRecords,
    getHistoryReceivingRecords,
    addReceivingRecord,
    getRecordsByBilletId,
    updateReceivingRecord,
    getPendingReceivingRecords,
  } = useBilletData()
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [selectedBilletId, setSelectedBilletId] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    time: "",
    ledel: "",
    ccmTotalPieces: "0",
    bpMillTo: "0",
    bpCcmTo: "0",
    millToPcs: "0",
    remark: "",
  })

  const { toast } = useToast()
  const [pendingRecords, setPendingRecords] = useState([])
  const [historyRecords, setHistoryRecords] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/")
      return
    }

    // Safely get records after component is mounted
    setPendingRecords(getPendingReceivingRecords())
    setHistoryRecords(getHistoryReceivingRecords())
  }, [isAuthenticated, navigate, getPendingReceivingRecords, getHistoryReceivingRecords])

  const handleSelectBillet = (billetId) => {
    setSelectedBilletId(billetId)
    const billetData = getRecordsByBilletId(billetId)

    // If there's existing receiving data, use it
    if (billetData.receiving) {
      setFormData({
        time: billetData.receiving.time,
        ledel: billetData.receiving.ledel,
        ccmTotalPieces: billetData.receiving.ccmTotalPieces.toString(),
        bpMillTo: billetData.receiving.bpMillTo.toString(),
        bpCcmTo: billetData.receiving.bpCcmTo.toString(),
        millToPcs: billetData.receiving.millToPcs.toString(),
        remark: billetData.receiving.remark,
      })
    } else {
      // Reset form for new entry
      setFormData({
        time: "",
        ledel: "",
        ccmTotalPieces: "0",
        bpMillTo: "0",
        bpCcmTo: "0",
        millToPcs: "0",
        remark: "",
      })
    }

    setFormErrors({})
    setFormDialogOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!selectedBilletId) {
      errors.billetId = "Please select a billet to receive"
    }

    if (!formData.time) {
      errors.time = "Time is required"
    }

    if (!formData.ledel) {
      errors.ledel = "LEDEL is required"
    }

    if (Number.parseFloat(formData.ccmTotalPieces) < 0) {
      errors.ccmTotalPieces = "CCM Total Pieces must be a positive number"
    }

    if (Number.parseFloat(formData.bpMillTo) < 0) {
      errors.bpMillTo = "B.P. MILL TO must be a positive number"
    }

    if (Number.parseFloat(formData.bpCcmTo) < 0) {
      errors.bpCcmTo = "B.P. CCM TO must be a positive number"
    }

    if (Number.parseFloat(formData.millToPcs) < 0) {
      errors.millToPcs = "MILL TO. Pcs. must be a positive number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!selectedBilletId) {
        throw new Error("No billet selected")
      }

      const billetData = getRecordsByBilletId(selectedBilletId)
      const existingRecord = billetData.receiving

      const recordData = {
        billetId: selectedBilletId,
        time: formData.time,
        ledel: formData.ledel,
        ccmTotalPieces: Number.parseFloat(formData.ccmTotalPieces) || 0,
        bpMillTo: Number.parseFloat(formData.bpMillTo) || 0,
        bpCcmTo: Number.parseFloat(formData.bpCcmTo) || 0,
        millToPcs: Number.parseFloat(formData.millToPcs) || 0,
        remark: formData.remark,
      }

      if (existingRecord && existingRecord.id) {
        // Update existing record
        updateReceivingRecord(existingRecord.id, {
          ...recordData,
          status: "completed",
        })
      } else {
        // Add new record
        addReceivingRecord({
          ...recordData,
        })
      }

      toast({
        title: "Receiving Completed",
        description: `Billet ${selectedBilletId} has been received and is ready for lab testing.`,
      })

      // Reset form and selection
      setSelectedBilletId(null)
      setFormData({
        time: "",
        ledel: "",
        ccmTotalPieces: "0",
        bpMillTo: "0",
        bpCcmTo: "0",
        millToPcs: "0",
        remark: "",
      })
      setFormDialogOpen(false)

      // Refresh the lists
      setPendingRecords(getPendingReceivingRecords())
      setHistoryRecords(getHistoryReceivingRecords())
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save receiving data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900 from-teal-50 to-cyan-100 text-white">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400 flex items-center">
              <Clipboard className="mr-2 h-7 w-7" />
              Billet Receiving
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Process and receive billets for further production
            </p>
          </div>
          <Link to="/workflow">
            <Button
              variant="outline"
              className="border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/30"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflow
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="pending" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="pending">Pending Billets ({pendingRecords.length})</TabsTrigger>
            <TabsTrigger value="history">Receiving History ({historyRecords.length})</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="mt-4">
            <PendingBillets
              pendingRecords={pendingRecords}
              selectedBilletId={selectedBilletId}
              onSelectBillet={handleSelectBillet}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <ReceivingHistory historyRecords={historyRecords} />
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="sm:max-w-xl text-white">
            <DialogHeader>
              <DialogTitle>Billet Receiving Form</DialogTitle>
              <DialogDescription>
                {selectedBilletId
                  ? `Enter receiving details for billet ${selectedBilletId}`
                  : "Select a billet from the list to begin receiving"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-slate-700 dark:text-slate-300">
                    Time
                  </Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500 ${
                      formErrors.time ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {formErrors.time && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.time}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ledel" className="text-slate-700 dark:text-slate-300">
                    LEDEL
                  </Label>
                  <Input
                    id="ledel"
                    name="ledel"
                    value={formData.ledel}
                    onChange={handleChange}
                    className={`border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500 ${
                      formErrors.ledel ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {formErrors.ledel && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.ledel}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ccmTotalPieces" className="text-slate-700 dark:text-slate-300">
                    CCM TOTAL PIECES
                  </Label>
                  <Input
                    id="ccmTotalPieces"
                    name="ccmTotalPieces"
                    type="number"
                    step="1"
                    value={formData.ccmTotalPieces}
                    onChange={handleChange}
                    className={`border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500 ${
                      formErrors.ccmTotalPieces
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  />
                  {formErrors.ccmTotalPieces && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.ccmTotalPieces}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bpMillTo" className="text-slate-700 dark:text-slate-300">
                    B.P. MILL TO
                  </Label>
                  <Input
                    id="bpMillTo"
                    name="bpMillTo"
                    type="number"
                    step="0.01"
                    value={formData.bpMillTo}
                    onChange={handleChange}
                    className={`border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500 ${
                      formErrors.bpMillTo ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {formErrors.bpMillTo && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.bpMillTo}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bpCcmTo" className="text-slate-700 dark:text-slate-300">
                    B.P. CCM TO
                  </Label>
                  <Input
                    id="bpCcmTo"
                    name="bpCcmTo"
                    type="number"
                    step="0.01"
                    value={formData.bpCcmTo}
                    onChange={handleChange}
                    className={`border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500 ${
                      formErrors.bpCcmTo ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {formErrors.bpCcmTo && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.bpCcmTo}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="millToPcs" className="text-slate-700 dark:text-slate-300">
                    MILL TO. Pcs.
                  </Label>
                  <Input
                    id="millToPcs"
                    name="millToPcs"
                    type="number"
                    step="1"
                    value={formData.millToPcs}
                    onChange={handleChange}
                    className={`border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500 ${
                      formErrors.millToPcs ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {formErrors.millToPcs && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.millToPcs}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remark" className="text-slate-700 dark:text-slate-300">
                    Remark
                  </Label>
                  <Input
                    id="remark"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    className="border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormDialogOpen(false)}
                  className="border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/30"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Complete Receiving
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default WorkflowReceivingPage