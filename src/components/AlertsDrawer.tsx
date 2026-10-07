import React from 'react';
import { MineRecord } from '../types';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Satellite, 
  FileCheck, 
  Flame,
  ArrowRight
} from 'lucide-react';

interface AlertsDrawerProps {
  mines: MineRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMine: (mineId: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  mines,
  isOpen,
  onClose,
  onSelectMine,
}) => {
  if (!isOpen) return null;

  // Build systematic alert notifications from real mine states
  const alerts: Array<{
    id: string;
    mineId: string;
    mineName: string;
    type: 'anomaly' | 'target' | 'milestone' | 'approval' | 'satellite';
    severity: 'critical' | 'warning' | 'success' | 'info';
    title: string;
    description: string;
    date: string;
  }> = [];

  mines.forEach(m => {
    // 1. Anomalies
    m.anomalies.forEach(a => {
      alerts.push({
        id: a.id,
        mineId: m.id,
        mineName: m.name,
        type: 'anomaly',
        severity: a.severity === 'critical' ? 'critical' : 'warning',
        title: `⚠ ${a.metric} Anomaly Detected`,
        description: a.message,
        date: a.dateReported,
      });
    });

    // 2. Satellite Mismatch
    if (m.satelliteData.status === 'discrepancy_flagged' || m.satelliteData.status === 'review_required') {
      alerts.push({
        id: `sat-${m.id}`,
        mineId: m.id,
        mineName: m.name,
        type: 'satellite',
        severity: m.satelliteData.status === 'discrepancy_flagged' ? 'critical' : 'warning',
        title: `⚠ Satellite Land Verification Mismatch (${m.satelliteData.discrepancyHa} ha)`,
        description: `Sentinel-2 vegetative index flags deficit vs self-reported ${m.satelliteData.selfReportedReclaimedHa} ha reclamation.`,
        date: m.satelliteData.satellitePassDate,
      });
    }

    // 3. Pathway Approval Pending
    if (m.pathwayStatus === 'pending_approval') {
      alerts.push({
        id: `appr-${m.id}`,
        mineId: m.id,
        mineName: m.name,
        type: 'approval',
        severity: 'info',
        title: '⚠ Colliery Decarbonization Pathway Awaiting Approval',
        description: `Action plan submitted with ₹${m.sustainabilityBudgetCrores} Cr CapEx requiring Regional Officer sign-off.`,
        date: '2026-02-24',
      });
    }

    // 4. Milestone Achieved
    if (m.targetStatus === 'ahead' || m.currentReductionPct >= 20) {
      alerts.push({
        id: `mile-${m.id}`,
        mineId: m.id,
        mineName: m.name,
        type: 'milestone',
        severity: 'success',
        title: `✓ 2030 Interim Milestone Achieved (-${m.currentReductionPct}% cut)`,
        description: `Colliery has successfully outpaced scheduled trajectory through early solar array commissioning.`,
        date: '2026-02-15',
      });
    }

    // 5. Behind Target
    if (m.targetStatus === 'behind' || m.targetStatus === 'critical') {
      alerts.push({
        id: `tgt-${m.id}`,
        mineId: m.id,
        mineName: m.name,
        type: 'target',
        severity: m.targetStatus === 'critical' ? 'critical' : 'warning',
        title: `⚠ Colliery Behind 2030 Decarbonization Target`,
        description: `Current intensity ${m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} t/t exceeds statutory trajectory threshold.`,
        date: '2026-02-20',
      });
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold">Colliery Alerts & Notifications</h3>
              <p className="text-[11px] text-slate-400">{alerts.length} active regulatory notices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.map(item => {
            const isCritical = item.severity === 'critical';
            const isSuccess = item.severity === 'success';
            const isWarning = item.severity === 'warning';

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectMine(item.mineId);
                  onClose();
                }}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-sm ${
                  isCritical
                    ? 'bg-red-50/70 border-red-200'
                    : isSuccess
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-blue-50/70 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`font-bold ${
                    isCritical
                      ? 'text-red-900'
                      : isSuccess
                      ? 'text-emerald-900'
                      : isWarning
                      ? 'text-amber-900'
                      : 'text-blue-900'
                  }`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    {item.date}
                  </span>
                </div>

                <div className="font-semibold text-slate-900 text-[11px] mb-1">
                  {item.mineName}
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
                  {item.description}
                </p>

                <div className="flex justify-end text-[11px] font-semibold text-[#166534] items-center gap-1 hover:underline">
                  <span>Inspect Colliery</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
