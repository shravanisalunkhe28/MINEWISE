import React, { useState } from 'react';
import { AnomalyEvent, MineRecord } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Send, 
  Eye, 
  FileText, 
  MessageSquare,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

interface AnomalyAuditCenterProps {
  mines: MineRecord[];
  onUpdateMineAnomaly: (mineId: string, anomalyId: string, newStatus: AnomalyEvent['status'], notes?: string) => void;
  onOpenMineProfile: (mineId: string) => void;
}

export const AnomalyAuditCenter: React.FC<AnomalyAuditCenterProps> = ({
  mines,
  onUpdateMineAnomaly,
  onOpenMineProfile,
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<{ mine: MineRecord; anomaly: AnomalyEvent } | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');

  // Collect all anomalies across all mines
  const allAnomalies = mines.flatMap(m => 
    m.anomalies.map(a => ({
      mine: m,
      anomaly: a,
    }))
  ).sort((a, b) => (b.anomaly.severity === 'critical' ? 1 : 0) - (a.anomaly.severity === 'critical' ? 1 : 0));

  // Find mines with REPEATED anomalies (e.g., Jharia Block-II has 3 anomalies)
  const repeatedAnomalyMines = mines.filter(m => m.anomalies.length >= 2);

  const handleAction = (status: AnomalyEvent['status']) => {
    if (!selectedAnomaly) return;
    onUpdateMineAnomaly(selectedAnomaly.mine.id, selectedAnomaly.anomaly.id, status, actionNotes);
    setSelectedAnomaly(null);
    setActionNotes('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Colliery Data Integrity & Statutory Anomaly Audit Center
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated statistical variance detection, DGMS engineering threshold checks, and regional audit mandates
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded">
          {allAnomalies.filter(a => a.anomaly.status !== 'resolved').length} Active Flags Requiring Authority Action
        </span>
      </div>

      {/* REPEATED DATA ANOMALY WARNING BANNER (Section 20 Requirement) */}
      {repeatedAnomalyMines.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-red-600" /> Repeated Anomaly Triggers (Mandatory Regional Review)
          </h4>

          {repeatedAnomalyMines.map(m => (
            <div
              key={m.id}
              className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-red-900 uppercase tracking-wide">
                    ⚠ REPEATED DATA ANOMALY ALERT
                  </span>
                  <span className="text-[11px] font-mono bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-bold">
                    {m.anomalies.length} anomalies recorded in recent reporting cycles
                  </span>
                </div>
                <h5 className="text-base font-bold text-slate-900">
                  {m.name} ({m.company} · {m.district}, {m.state})
                </h5>
                <p className="text-xs text-red-800 leading-snug max-w-2xl">
                  {m.anomalies[0]?.message}
                </p>
              </div>

              {/* Action Buttons for Repeated Anomaly */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenMineProfile(m.id)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded shadow-sm transition-colors"
                >
                  Review Colliery Logs
                </button>
                <button
                  onClick={() => {
                    setSelectedAnomaly({ mine: m, anomaly: m.anomalies[0] });
                    setActionNotes('Official clarification requested regarding persistent fuel variance.');
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Clarification</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedAnomaly({ mine: m, anomaly: m.anomalies[0] });
                    setActionNotes('Mandated DGMS / CMPDI Regional Carbon Audit instituted.');
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Flag for Audit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Anomaly Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          All Reported Operational Discrepancies & Satellite Mismatches
        </h4>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-3">Severity</th>
                <th className="p-3">Mine / Colliery</th>
                <th className="p-3">Metric Discrepancy</th>
                <th className="p-3">Variance / Details</th>
                <th className="p-3">Period</th>
                <th className="p-3">Audit Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allAnomalies.map(({ mine, anomaly }) => {
                const isCritical = anomaly.severity === 'critical';
                const isWarning = anomaly.severity === 'warning';

                return (
                  <tr key={anomaly.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isCritical
                          ? 'bg-red-100 text-red-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {anomaly.severity}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{mine.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{mine.company}</span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {anomaly.metric}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs">
                      <div className="truncate text-slate-800 font-medium">{anomaly.message}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Observed: {anomaly.observedValue} (Exp: {anomaly.expectedRange})
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {anomaly.reportingPeriod}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        anomaly.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : anomaly.status === 'flagged_for_audit'
                          ? 'bg-red-100 text-red-800 font-bold'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {anomaly.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedAnomaly({ mine, anomaly })}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded transition-colors"
                      >
                        Take Action
                      </button>
                    </td>
                  </tr>
                );
              })}
              {allAnomalies.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                    No active anomalies detected across the monitored fleet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Regional Authority Anomaly Resolution
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Colliery: {selectedAnomaly.mine.name}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
              <strong className="text-slate-900 block">{selectedAnomaly.anomaly.metric}</strong>
              <p className="text-slate-700">{selectedAnomaly.anomaly.message}</p>
              <span className="text-[11px] text-slate-500 block font-mono">
                Observed: {selectedAnomaly.anomaly.observedValue} · Expected: {selectedAnomaly.anomaly.expectedRange}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Official Directive / Regulatory Audit Notes:
              </label>
              <textarea
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder="Enter statutory inspection orders, clarification demands, or calibration findings..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => handleAction('flagged_for_audit')}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
              >
                1. Institutionalize Mandatory DGMS On-Site Audit
              </button>

              <button
                onClick={() => handleAction('clarification_requested')}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded transition-colors"
              >
                2. Issue 14-Day Statutory Clarification Notice
              </button>

              <button
                onClick={() => handleAction('resolved')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded transition-colors"
              >
                3. Mark as Verified & Close Anomaly (Explanation Accepted)
              </button>

              <button
                onClick={() => setSelectedAnomaly(null)}
                className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-center font-medium mt-1"
              >
                Dismiss Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
