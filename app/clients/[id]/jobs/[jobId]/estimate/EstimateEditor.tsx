'use client'

import { useState } from 'react'

type LineItem = { description: string; amount: string }

type Props = {
  estimateNumber: string
  today: string
  validUntil: string
  clientName: string
  clientAddress: string
  clientPhone: string
  clientEmail: string
  jobTitle: string
  jobDescription: string
  jobNotes: string
  backHref: string
}

function Field({
  value,
  onChange,
  placeholder,
  className = '',
  multiline = false,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  multiline?: boolean
}) {
  const base =
    'bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-slate-600 w-full print:border-0 ' +
    className
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={base + ' resize-none'}
      />
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={base}
    />
  )
}

export default function EstimateEditor(props: Props) {
  const [estNum, setEstNum] = useState(props.estimateNumber)
  const [date, setDate] = useState(props.today)
  const [validUntil, setValidUntil] = useState(props.validUntil)
  const [clientName, setClientName] = useState(props.clientName)
  const [clientAddress, setClientAddress] = useState(props.clientAddress)
  const [clientPhone, setClientPhone] = useState(props.clientPhone)
  const [clientEmail, setClientEmail] = useState(props.clientEmail)
  const [projectTitle, setProjectTitle] = useState(props.jobTitle)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      description:
        props.jobDescription || props.jobNotes
          ? [props.jobDescription, props.jobNotes].filter(Boolean).join(' — ')
          : props.jobTitle,
      amount: '',
    },
  ])
  const [terms, setTerms] = useState(
    '50% deposit required to schedule work\nRemaining balance due upon project completion\nThis estimate is valid for 30 days from the date above\nAll work performed by licensed and insured professionals\nPrices may vary if additional work is discovered during project'
  )

  function updateLine(i: number, field: keyof LineItem, val: string) {
    setLineItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)))
  }

  function addLine() {
    setLineItems((prev) => [...prev, { description: '', amount: '' }])
  }

  function removeLine(i: number) {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  const total = lineItems.reduce((sum, item) => {
    const n = parseFloat(item.amount.replace(/[^0-9.]/g, ''))
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  const fmtMoney = (n: number) =>
    n > 0
      ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : 'TBD'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Controls — hidden on print */}
      <div className="flex items-center gap-3 mb-6 no-print">
        <a href={props.backHref} className="text-gray-500 hover:text-gray-700 text-sm">
          ← Back to Client
        </a>
        <button
          onClick={() => window.print()}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium text-sm ml-auto"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-4 no-print">
        Click any field to edit before printing.
      </p>

      {/* Estimate document */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">🛡️ ArmorShield</h1>
            <p className="text-slate-600 font-medium">Roofing & Construction</p>
            <p className="text-gray-400 text-sm mt-1">Licensed & Insured</p>
          </div>
          <div className="text-right space-y-1 w-44">
            <p className="text-2xl font-bold text-gray-900">ESTIMATE</p>
            <div className="text-sm">
              <span className="text-gray-500 mr-1">#</span>
              <Field value={estNum} onChange={setEstNum} className="text-gray-500 text-sm w-32 text-right" />
            </div>
            <div className="text-sm flex items-center justify-end gap-1">
              <span className="text-gray-400">Date:</span>
              <Field value={date} onChange={setDate} className="text-gray-400 text-sm w-28 text-right" />
            </div>
            <div className="text-sm flex items-center justify-end gap-1">
              <span className="text-gray-400">Valid:</span>
              <Field value={validUntil} onChange={setValidUntil} className="text-gray-400 text-sm w-28 text-right" />
            </div>
          </div>
        </div>

        {/* Client + Project info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prepared For</p>
            <Field value={clientName} onChange={setClientName} className="font-semibold text-gray-900 text-lg mb-1" placeholder="Client name" />
            <Field value={clientAddress} onChange={setClientAddress} className="text-gray-600 text-sm mb-0.5" placeholder="Address" />
            <Field value={clientPhone} onChange={setClientPhone} className="text-gray-600 text-sm mb-0.5" placeholder="Phone" />
            <Field value={clientEmail} onChange={setClientEmail} className="text-gray-600 text-sm" placeholder="Email" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Project</p>
            <Field value={projectTitle} onChange={setProjectTitle} className="font-semibold text-gray-900 text-lg" placeholder="Project title" />
          </div>
        </div>

        {/* Line items */}
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="text-left px-4 py-2 text-sm font-semibold rounded-tl-lg">Description</th>
              <th className="text-right px-4 py-2 text-sm font-semibold w-32 rounded-tr-lg">Amount</th>
              <th className="w-8 no-print" />
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <Field
                    value={item.description}
                    onChange={(v) => updateLine(i, 'description', v)}
                    placeholder="Describe the work..."
                    multiline
                    className="text-gray-800"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Field
                    value={item.amount}
                    onChange={(v) => updateLine(i, 'amount', v)}
                    placeholder="0.00"
                    className="text-gray-900 font-semibold text-right w-24"
                  />
                </td>
                <td className="px-2 no-print">
                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLine(i)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                      title="Remove line"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold text-gray-700 text-right">Subtotal</td>
              <td className="px-4 py-3 font-semibold text-gray-900 text-right">{fmtMoney(total)}</td>
              <td className="no-print" />
            </tr>
            <tr className="bg-slate-800 text-white">
              <td className="px-4 py-3 font-bold text-right rounded-bl-lg">TOTAL</td>
              <td className="px-4 py-3 font-bold text-right text-lg rounded-br-lg">{fmtMoney(total)}</td>
              <td className="no-print" />
            </tr>
          </tfoot>
        </table>

        {/* Add line button — hidden on print */}
        <div className="mb-8 no-print">
          <button
            onClick={addLine}
            className="text-sm text-slate-600 border border-dashed border-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            + Add Line Item
          </button>
        </div>

        {/* Terms */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-600">
          <p className="font-semibold text-gray-700 mb-2">Terms & Conditions</p>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={5}
            className="w-full bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-slate-600 resize-none text-sm text-gray-600 print:border-0"
          />
        </div>

        {/* Signature */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="border-b-2 border-gray-300 mb-1 h-10" />
            <p className="text-xs text-gray-500">Client Signature</p>
          </div>
          <div>
            <div className="border-b-2 border-gray-300 mb-1 h-10" />
            <p className="text-xs text-gray-500">Date</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Thank you for choosing ArmorShield Roofing & Construction</p>
        </div>
      </div>
    </div>
  )
}
