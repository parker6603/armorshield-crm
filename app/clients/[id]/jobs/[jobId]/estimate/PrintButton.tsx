'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium text-sm ml-auto"
    >
      🖨️ Print / Save as PDF
    </button>
  )
}
