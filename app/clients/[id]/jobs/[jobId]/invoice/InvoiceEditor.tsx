'use client'

import { useState } from 'react'

type LineItem = { description: string; amount: string }

type Props = {
  invoiceNumber: string
  today: string
  dueDate: string
  clientName: string
  clientAddress: string
  clientPhone: string
  clientEmail: string
  jobTitle: string
  jobDescription: string
  jobNotes: string
  jobEstimate: number | null
  backHref: string
}

const QUICK_TEMPLATES = [
  { label: 'Full Roof Replacement', desc: 'Complete tear-off and installation of new roofing system including underlayment, ice & water shield, flashing, and ridge cap. Debris removal included.' },
  { label: 'Roof Repair', desc: 'Repair damaged/missing shingles, reseal flashing, and address leak areas. All labor and materials included.' },
  { label: 'Gutter Installation', desc: 'Supply and install seamless K-style aluminum gutters and downspouts with hangers and end caps.' },
  { label: 'Gutter Cleaning', desc: 'Clean and flush all gutters and downspouts. Bag and remove all debris from property.' },
  { label: 'Siding', desc: 'Remove existing siding and install new vinyl siding with house wrap. Includes trim, corners, and cleanup.' },
  { label: 'Emergency Repair', desc: 'Emergency response to prevent further water intrusion. Temporary and/or permanent repair as needed.' },
  { label: 'Inspection', desc: 'Full roof inspection with photo documentation and written findings report.' },
]

function Field({
  value, onChange, placeholder, className = '', multiline = false,
}: {
  value: string; onChange: (v: string) => void
  placeholder?: string; className?: string; multiline?: boolean
}) {
  const base = 'bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-slate-600 w-full print:border-0 ' + className
  if (multiline) {
    return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2} className={base + ' resize-none'} />
  }
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
}

export default function InvoiceEditor(props: Props) {
  const [invNum, setInvNum] = useState(props.invoiceNumber)
  const [date, setDate] = useState(props.today)
  const [dueDate, setDueDate] = useState(props.dueDate)
  const [clientName, setClientName] = useState(props.clientName)
  const [clientAddress, setClientAddress] = useState(props.clientAddress)
  const [clientPhone, setClientPhone] = useState(props.clientPhone)
  const [clientEmail, setClientEmail] = useState(props.clientEmail)
  const [projectTitle, setProjectTitle] = useState(props.jobTitle)
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    description: [props.jobDescription, props.jobNotes].filter(Boolean).join(' — ') || props.jobTitle,
    amount: props.jobEstimate ? String(props.jobEstimate) : '',
  }])
  const [terms, setTerms] = useState(
    'Payment due within 30 days of invoice date\nAccepted: check, cash, Zelle, Venmo\nLate payments subject to 1.5% monthly finance charge\nAll work performed by licensed and insured professionals\nThank you for your business!'
  )

  function updateLine(i: number, field: keyof LineItem, val: string) {
    setLineItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }
  function addLine() { setLineItems(prev => [...prev, { description: '', amount: '' }]) }
  function removeLine(i: number) { setLineItems(prev => prev.filter((_, idx) => idx !== i)) }
  function addTemplate(desc: string) { setLineItems(prev => [...prev, { description: desc, amount: '' }]) }

  const total = lineItems.reduce((sum, item) => {
    const n = parseFloat(item.amount.replace(/[^0-9.]/g, ''))
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  const fmtMoney = (n: number) =>
    n > 0 ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'TBD'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4 no-print">
        <a href={props.backHref} className="text-gray-500 hover:text-gray-700 text-sm">← Back to Client</a>
        <button
          onClick={() => window.print()}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium text-sm ml-auto"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4 no-print">Click any field to edit before printing.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">🛡️ ArmorShield</h1>
            <p className="text-slate-600 font-medium">Roofing & Construction</p>
            <p className="text-gray-400 text-sm mt-1">Licensed & Insured</p>
          </div>
          <div className="text-right space-y-1 w-44">
            <p className="text-2xl font-bold text-gray-900">INVOICE</p>
            <div className="text-sm flex items-center justify-end gap-1">
              <span className="text-gray-500">#</span>
              <Field value={invNum} onChange={setInvNum} className="text-gray-500 text-sm w-32 text-right" />
            </div>
            <div className="text-sm flex items-center justify-end gap-1">
              <span className="text-gray-400">Date:</span>
              <Field value={date} onChange={setDate} className="text-gray-400 text-sm w-28 text-right" />
            </div>
            <div className="text-sm flex items-center justify-end gap-1">
              <span className="text-gray-400">Due:</span>
              <Field value={dueDate} onChange={setDueDate} className="text-gray-400 text-sm w-28 text-right" />
            </div>
          </div>
        </div>

        {/* Bill To + Project */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</p>
            <Field value={clientName} onChange={setClientName} className="font-semibold text-gray-900 text-lg mb-1" placeholder="Client name" />
            <Field value={clientAddress} onChange={setClientAddress} className="text-gray-600 text-sm mb-0.5" placeholder="Address" />
            <Field value={clientPhone} onChange={setClientPhone} className="text-gray-600 text-sm mb-0.5" placeholder="Phone" />
            <Field value={clientEmail} onChange={setClientEmail} className="text-gray-600 text-sm" placeholder="Email" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">For Services</p>
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
                  <Field value={item.description} onChange={v => updateLine(i, 'description', v)} placeholder="Describe the work…" multiline className="text-gray-800" />
                </td>
                <td className="px-4 py-3 text-right">
                  <Field value={item.amount} onChange={v => updateLine(i, 'amount', v)} placeholder="0.00" className="text-gray-900 font-semibold text-right w-24" />
                </td>
                <td className="px-2 no-print">
                  {lineItems.length > 1 && (
                    <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
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
              <td className="px-4 py-3 font-bold text-right rounded-bl-lg">TOTAL DUE</td>
              <td className="px-4 py-3 font-bold text-right text-lg rounded-br-lg">{fmtMoney(total)}</td>
              <td className="no-print" />
            </tr>
          </tfoot>
        </table>

        {/* Add line + quick templates */}
        <div className="flex flex-wrap items-center gap-3 mb-8 no-print">
          <button onClick={addLine} className="text-sm text-slate-600 border border-dashed border-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            + Add Line
          </button>
          <select
            defaultValue=""
            onChange={e => {
              const t = QUICK_TEMPLATES.find(t => t.label === e.target.value)
              if (t) { addTemplate(t.desc); e.target.value = '' }
            }}
            className="text-sm border border-dashed border-slate-400 text-slate-600 rounded-lg px-3 py-1.5 bg-white cursor-pointer hover:bg-slate-50 focus:outline-none"
          >
            <option value="" disabled>⚡ Quick add service…</option>
            {QUICK_TEMPLATES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
        </div>

        {/* Payment terms */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-600">
          <p className="font-semibold text-gray-700 mb-2">Payment Terms</p>
          <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={5} className="w-full bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-slate-600 resize-none text-sm text-gray-600 print:border-0" />
        </div>

        {/* Signature */}
        <div className="grid grid-cols-2 gap-8">
          <div><div className="border-b-2 border-gray-300 mb-1 h-10" /><p className="text-xs text-gray-500">Authorized Signature</p></div>
          <div><div className="border-b-2 border-gray-300 mb-1 h-10" /><p className="text-xs text-gray-500">Payment Date</p></div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Thank you for choosing ArmorShield Roofing & Construction — Licensed & Insured</p>
        </div>
      </div>
    </div>
  )
}
