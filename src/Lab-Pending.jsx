"use client"

import { Clipboard } from "lucide-react"
import { formatDate } from "./lib/utils"

function LabPending({ pendingRecords, selectedBilletId, onSelectBillet }) {
  return (
    <div className="rounded-lg border border-blue-700 shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-blue-800 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clipboard className="h-5 w-5" />
              Pending Lab Tests
            </h3>
            <p className="text-sm text-teal-100">Select a billet to perform lab testing</p>
          </div>
          <span className="px-2 py-1 rounded-full bg-white text-teal-700 text-xs font-medium">
            {pendingRecords.length} Records
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        {pendingRecords.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No pending lab tests available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-950 hover:bg-blue-950">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billet ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heat Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors ${
                      selectedBilletId === record.billetId ? "bg-teal-100 dark:bg-teal-800/40" : ""
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(record.timestamp)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-teal-700 dark:text-teal-400">
                      {record.billetId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {record.heatNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={
                          record.status === "pending"
                            ? "px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700"
                            : "px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800"
                        }
                      >
                        {record.status === "pending" ? "Pending" : "In Progress"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectBillet(record.billetId)}
                        className="text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition"
                      >
                        Process
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default LabPending