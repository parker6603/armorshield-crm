import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PrintButton from './PrintButton'

export default async function EstimatePage({ params }: { params: Promise<{ id: string; jobId: string }> }) {
  const { id, jobId } = await params

  const [{ data: client }, { data: job }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('jobs').select('*').eq('id', jobId).single(),
  ])

  if (!client || !job) notFound()

  const estimateNumber = `AS-${jobId.slice(0, 8).toUpperCase()}`
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto">

      {/* Print controls — hidden when printing */}
      <div className="flex items-center gap-3 mb-6 no-print">
        <a href={`/clients/${id}`} className="text-gray-500 hover:text-gray-700 text-sm">← Back to Client</a>
        <PrintButton />
      </div>

      {/* Estimate document */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm" id="estimate">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">🛡️ ArmorShield</h1>
            <p className="text-slate-600 font-medium">Roofing & Construction</p>
            <p className="text-gray-400 text-sm mt-1">Licensed & Insured</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">ESTIMATE</p>
            <p className="text-gray-500 text-sm mt-1">#{estimateNumber}</p>
            <p className="text-gray-400 text-sm">Date: {today}</p>
            <p className="text-gray-400 text-sm">Valid until: {validUntil}</p>
          </div>
        </div>

        {/* Client info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prepared For</p>
            <p className="font-semibold text-gray-900 text-lg">{client.name}</p>
            {client.address && <p className="text-gray-600 text-sm mt-0.5">{client.address}</p>}
            {client.phone && <p className="text-gray-600 text-sm">{client.phone}</p>}
            {client.email && <p className="text-gray-600 text-sm">{client.email}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Project</p>
            <p className="font-semibold text-gray-900 text-lg">{job.title}</p>
            {job.description && <p className="text-gray-600 text-sm mt-0.5">{job.description}</p>}
          </div>
        </div>

        {/* Line items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="text-left px-4 py-2 text-sm font-semibold rounded-tl-lg">Description</th>
              <th className="text-right px-4 py-2 text-sm font-semibold rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{job.title}</p>
                {job.description && <p className="text-gray-500 text-sm mt-0.5">{job.description}</p>}
                {job.notes && <p className="text-gray-400 text-sm mt-0.5 italic">{job.notes}</p>}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                {job.estimate ? `$${job.estimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'TBD'}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold text-gray-700 text-right">Subtotal</td>
              <td className="px-4 py-3 font-semibold text-gray-900 text-right">
                {job.estimate ? `$${job.estimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'TBD'}
              </td>
            </tr>
            <tr className="bg-slate-800 text-white">
              <td className="px-4 py-3 font-bold text-right rounded-bl-lg">TOTAL</td>
              <td className="px-4 py-3 font-bold text-right text-lg rounded-br-lg">
                {job.estimate ? `$${job.estimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'TBD'}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Terms */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-600">
          <p className="font-semibold text-gray-700 mb-1">Terms & Conditions</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>50% deposit required to schedule work</li>
            <li>Remaining balance due upon project completion</li>
            <li>This estimate is valid for 30 days from the date above</li>
            <li>All work performed by licensed and insured professionals</li>
            <li>Prices may vary if additional work is discovered during project</li>
          </ul>
        </div>

        {/* Signature */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="border-b-2 border-gray-300 mb-1 h-10"></div>
            <p className="text-xs text-gray-500">Client Signature</p>
          </div>
          <div>
            <div className="border-b-2 border-gray-300 mb-1 h-10"></div>
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
