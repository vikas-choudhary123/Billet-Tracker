"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { useBilletData } from "../lib/billet-context"
import Header from "../components/header"
import { AlertCircle, Save, Loader2 } from "lucide-react"
import { useToast } from "../hooks/use-toast"

export default function Entry() {
  const { isAuthenticated, hasPermission } = useAuth()
  const navigate = useNavigate()
  const { addBilletRecord } = useBilletData()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    billetId: "",
    heatNumber: "",
    drCell: "",
    pilot: "",
    metCook: "",
    sillicoMn: "",
    authriseCook: "",
    productionCmd: "",
    scrapCmd: "",
    remarks: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("entry")
  const [sectionOpen, setSectionOpen] = useState(false)
  const [gradeOpen, setGradeOpen] = useState(false)

  // Only render after first mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        navigate("/")
        return
      }

      if (!hasPermission("production")) {
        navigate("/dashboard")
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this page.",
        })
      }
    }
  }, [isMounted, isAuthenticated, hasPermission, navigate, toast])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.billetId.trim()) newErrors.billetId = "Billet ID is required"
    if (!formData.heatNumber.trim()) newErrors.heatNumber = "Heat Number is required"
    if (!formData.productionCmd.trim()) newErrors.productionCmd = "Production CMD is required"
    else if (isNaN(formData.productionCmd) || Number(formData.productionCmd) <= 0) {
      newErrors.productionCmd = "Production CMD must be a positive number"
    }

    if (formData.scrapCmd.trim() && (isNaN(formData.scrapCmd) || Number(formData.scrapCmd) < 0)) {
      newErrors.scrapCmd = "Scrap CMD must be a non-negative number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Close dropdown
    if (name === "section") setSectionOpen(false)
    if (name === "grade") setGradeOpen(false)

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Add timestamp
      const recordWithTimestamp = {
        ...formData,
        timestamp: new Date().toISOString(),
        status: "pending", // Initial status
      }

      await addBilletRecord(recordWithTimestamp)

      toast({
        title: "Success",
        description: "Billet record has been created successfully.",
      })

      // Reset form
      setFormData({
        billetId: "",
        heatNumber: "",
        drCell: "",
        pilot: "",
        metCook: "",
        sillicoMn: "",
        authriseCook: "",
        productionCmd: "",
        scrapCmd: "",
        remarks: "",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create billet record. Please try again.",
      })
      console.error("Error creating billet record:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If not mounted yet, don't render anything
  if (!isMounted) {
    return null
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated || !hasPermission("production")) {
    return null
  }

  const sections = ["100x100", "120x120", "150x150", "160x160", "200x200"]
  const grades = ["Fe500", "Fe500D", "Fe550", "Fe550D", "Fe600"]

  return (
    <div className="min-h-screen bg-slate-900 from-cyan-50 to-teal-100">
      <Header />

      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cyan-500">Billet Production Entry</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Create new billet production records</p>
        </div>

        {/* Tabs */}
        <div className="w-full">
          {/* Tab buttons */}
          <div className="flex border-b border-gray-900 mb-4">
            <button
              onClick={() => setActiveTab("entry")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "entry" ? "text-cyan-500 border-b-2 border-cyan-500" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Production Entry
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "help" ? "text-cyan-500 border-b-2 border-cyan-500" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Help & Guidelines
            </button>
          </div>

          {/* Entry Tab Content */}
          {activeTab === "entry" && (
            <div className="bg-slate-900 border border-cyan-800 rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-medium text-cyan-400">New Billet Record</h2>
                <p className="text-sm text-gray-300">Enter the details of the new billet production</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Billet ID */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="billetId"
                        className={`block text-sm font-medium ${errors.billetId ? "text-red-500" : "text-gray-200"}`}
                      >
                        Billet ID
                      </label>
                      <input
                        id="billetId"
                        name="billetId"
                        value={formData.billetId}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-gray-700 border ${
                          errors.billetId ? "border-red-500" : "border-gray-600"
                        } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                        placeholder="Enter billet ID"
                      />
                      {errors.billetId && <p className="text-red-500 text-sm">{errors.billetId}</p>}
                    </div>

                    {/* Heat Number */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="heatNumber"
                        className={`block text-sm font-medium ${errors.heatNumber ? "text-red-500" : "text-gray-200"}`}
                      >
                        Heat Number
                      </label>
                      <input
                        id="heatNumber"
                        name="heatNumber"
                        value={formData.heatNumber}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-gray-700 border ${
                          errors.heatNumber ? "border-red-500" : "border-gray-600"
                        } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                        placeholder="Enter heat number"
                      />
                      {errors.heatNumber && <p className="text-red-500 text-sm">{errors.heatNumber}</p>}
                    </div>

                    {/* Dr Cell */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="drCell"
                        className="block text-sm font-medium text-gray-200"
                      >
                        Dr Cell
                      </label>
                      <input
                        id="drCell"
                        name="drCell"
                        value={formData.drCell}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter Dr Cell"
                      />
                    </div>

                    {/* Pilot */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="pilot"
                        className="block text-sm font-medium text-gray-200"
                      >
                        Pilot
                      </label>
                      <input
                        id="pilot"
                        name="pilot"
                        value={formData.pilot}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter Pilot"
                      />
                    </div>

                    {/* Met Cook */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="metCook"
                        className="block text-sm font-medium text-gray-200"
                      >
                        Met Cook
                      </label>
                      <input
                        id="metCook"
                        name="metCook"
                        value={formData.metCook}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter Met Cook"
                      />
                    </div>

                    {/* Sillico Mn */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="sillicoMn"
                        className="block text-sm font-medium text-gray-200"
                      >
                        Sillico Mn
                      </label>
                      <input
                        id="sillicoMn"
                        name="sillicoMn"
                        value={formData.sillicoMn}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter Sillico Mn"
                      />
                    </div>

                    {/* Authroise Cook */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="authriseCook"
                        className="block text-sm font-medium text-gray-200"
                      >
                        Authroise Cook
                      </label>
                      <input
                        id="authriseCook"
                        name="authriseCook"
                        value={formData.authriseCook}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter Authroise Cook"
                      />
                    </div>

                    {/* Production CMD */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="productionCmd"
                        className={`block text-sm font-medium ${errors.productionCmd ? "text-red-500" : "text-gray-200"}`}
                      >
                        Production CMD (MT)
                      </label>
                      <input
                        id="productionCmd"
                        name="productionCmd"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.productionCmd}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-gray-700 border ${
                          errors.productionCmd ? "border-red-500" : "border-gray-600"
                        } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                        placeholder="Enter production CMD"
                      />
                      {errors.productionCmd && <p className="text-red-500 text-sm">{errors.productionCmd}</p>}
                    </div>

                    {/* Scrap CMD */}
                    <div className="space-y-2 text-white">
                      <label
                        htmlFor="scrapCmd"
                        className={`block text-sm font-medium ${errors.scrapCmd ? "text-red-500" : "text-gray-200"}`}
                      >
                        Scrap CMD (MT)
                      </label>
                      <input
                        id="scrapCmd"
                        name="scrapCmd"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.scrapCmd}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-gray-700 border ${
                          errors.scrapCmd ? "border-red-500" : "border-gray-600"
                        } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                        placeholder="Enter scrap CMD"
                      />
                      {errors.scrapCmd && <p className="text-red-500 text-sm">{errors.scrapCmd}</p>}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2 text-white">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-200">
                      Remarks (Optional)
                    </label>
                    <textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      placeholder="Enter any additional remarks or notes"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Error</h3>
                        <p className="text-sm">Please correct the errors in the form before submitting.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex justify-between text-white rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Record
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Help Tab Content */}
          {activeTab === "help" && (
            <div className="bg-gray-800 border border-cyan-800 rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-medium text-cyan-400">Help & Guidelines</h2>
                <p className="text-sm text-gray-300">Instructions for creating billet production records</p>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-cyan-400">Billet ID Format</h3>
                  <p className="text-sm text-gray-300">
                    Billet IDs should follow the format: YYYYMMDD-XXX where YYYYMMDD is the date and XXX is a sequential
                    number.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-cyan-400">Heat Number</h3>
                  <p className="text-sm text-gray-300">
                    Heat numbers should match the format used in the melt shop (e.g., H12345).
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-cyan-400">Production & Scrap CMD</h3>
                  <p className="text-sm text-gray-300">
                    Enter the production and scrap values in metric tons (MT). Production CMD is required, while Scrap
                    CMD is optional.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-cyan-400">Workflow</h3>
                  <p className="text-sm text-gray-300">
                    After creating a billet record, it will proceed through the following workflow:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-300 pl-4 space-y-1">
                    <li>Production Entry (current step)</li>
                    <li>Billet Receiving</li>
                    <li>Lab Testing</li>
                    <li>TMT Planning</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}