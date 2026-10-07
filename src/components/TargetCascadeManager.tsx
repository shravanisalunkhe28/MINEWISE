import React, { useState } from 'react';
import { MineRecord, NationalTargets, UserRole } from '../types';
import { 
  GitFork, 
  CheckCircle2, 
  Clock, 
  ArrowDown, 
  Building2, 
  ShieldCheck, 
  Check, 
  X,
  Sliders,
  TrendingDown
} from 'lucide-react';

interface TargetCascadeManagerProps {
  mines: MineRecord[];
  nationalTargets: NationalTargets;
  currentRole: UserRole;
  onUpdateNationalTarget: (newTargets: NationalTargets) => void;
  onApproveMinePathway: (mineId: string, approved: boolean) => void;
  onOpenMineProfile: (mineId: string) => void;
}

export const TargetCascadeManager: React.FC<TargetCascadeManagerProps> = ({
  mines,
  nationalTargets,
  currentRole,
  onUpdateNationalTarget,
  onApproveMinePathway,
  onOpenMineProfile,
}) => {
  const isMinistry = currentRole === 'ministry_official';
  const isRegional = currentRole === 'regional_officer';

  const [nationalTargetVal, setNationalTargetVal] = useState<number>(nationalTargets.nationalReductionTargetPct);
  const [targetYear, setTargetYear] = useState<number>(nationalTargets.targetYear);
  const [regionalTargets, setRegionalTargets] = useState<Record<string, number>>({ ...nationalTargets.regionalTargets });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSaveNationalTarget = () => {
    onUpdateNationalTarget({
      ...nationalTargets,
      nationalReductionTargetPct: nationalTargetVal,
      targetYear,
      regionalTargets,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  const handleRegionalTargetChange = (region: string, val: number) => {
    setRegionalTargets(prev => ({
      ...prev,
      [region]: val,
    }));
  };

  // Pathways waiting for Regional Approval
  const pendingApprovals = mines.filter(m => m.pathwayStatus === 'pending_approval' || m.pathwayStatus === 'draft');

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-[#166534]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              National Decarbonization Target Cascade & Statutory Pathway Approval
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchical mandate flow: Ministry of Coal → PSU Subsidiary Directorate → Colliery Action Plan
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#166534]" />
          <span>India NDC 2030 / Net-Zero 2070 Architecture</span>
        </div>
      </div>

      {/* Target Hierarchy Cascade Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Level 1: Ministry National Target */}
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              LEVEL 1: MINISTRY NATIONAL
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Mandate Root
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">National Coal Sector Target</h4>
            <p className="text-slate-500 mt-0.5 text-[11px]">
              Set by Ministry of Coal, New Delhi for all CIL & SCCL subsidiaries
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Target Reduction:</span>
              {isMinistry ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={nationalTargetVal}
                    onChange={e => setNationalTargetVal(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-bold text-right"
                  />
                  <span className="font-bold">%</span>
                </div>
              ) : (
                <strong className="text-lg font-bold text-slate-900 font-tabular">
                  -{nationalTargetVal}%
                </strong>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Target Year:</span>
              {isMinistry ? (
                <select
                  value={targetYear}
                  onChange={e => setTargetYear(parseInt(e.target.value))}
                  className="px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                >
                  <option value={2030}>2030 (NDC Commitment)</option>
                  <option value={2035}>2035</option>
                  <option value={2040}>2040</option>
                </select>
              ) : (
                <strong className="font-bold text-slate-900 font-tabular">{targetYear}</strong>
              )}
            </div>

            {isMinistry && (
              <button
                onClick={handleSaveNationalTarget}
                className="w-full mt-2 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{saveSuccess ? 'Target Saved & Cascaded!' : 'Cascade National Target'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Level 2: Regional PSU Targets */}
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              LEVEL 2: REGIONAL / PSU
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Derived Subsidiary
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">Subsidiary Allocated Targets</h4>
            <p className="text-slate-500 mt-0.5 text-[11px]">
              Derived by Regional Sustainability Officers based on reserve geology
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200 max-h-48 overflow-y-auto pr-1">
            {Object.entries(regionalTargets).map(([psu, pct]) => (
              <div key={psu} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                <span className="font-semibold text-slate-800">{psu}</span>
                {isRegional || isMinistry ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={pct}
                      onChange={e => handleRegionalTargetChange(psu, parseFloat(e.target.value) || 0)}
                      className="w-14 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-right font-semibold"
                    />
                    <span className="font-bold text-slate-600">%</span>
                  </div>
                ) : (
                  <strong className="text-slate-900 font-tabular font-semibold">-{pct}%</strong>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Level 3: Colliery Level Targets */}
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              LEVEL 3: COLLIERY DEPLOYMENT
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              Action Plan Execution
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">Colliery Specific Target</h4>
            <p className="text-slate-500 mt-0.5 text-[11px]">
              Assigned directly to Colliery Project Officers and General Managers
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Execution Architecture:
            </span>
            <div className="text-slate-700 leading-snug">
              Every colliery formulates a tailored Decarbonization Pathway combining Solar, FMC Conveyors, and Afforestation.
            </div>
            <div className="text-[11px] text-emerald-800 font-bold pt-1">
              ✓ Requires formal Regional Officer Approval to activate.
            </div>
          </div>
        </div>
      </div>

      {/* Pathway Approvals Section (Regional Officers approve mine pathway before IN PROGRESS) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Colliery Decarbonization Pathways Awaiting Regional Approval
            </h4>
            <p className="text-xs text-slate-500">
              Collieries with submitted action plans requiring statutory clearance before funding is unlocked
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {pendingApprovals.length} Pending Actions
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-3">Mine / Colliery</th>
                <th className="p-3">PSU / State</th>
                <th className="p-3">Proposed Interventions</th>
                <th className="p-3 text-right">Target Reduction</th>
                <th className="p-3 text-right">Required CapEx</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingApprovals.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">
                    <div>{m.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{m.code}</span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {m.company} · {m.state}
                  </td>
                  <td className="p-3 text-slate-700">
                    <span className="font-medium">
                      {m.selectedInterventionIds.length > 0
                        ? `${m.selectedInterventionIds.length} Key Technology Interventions`
                        : 'First-Mile Rail & Solar PV Array'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-tabular font-bold text-emerald-700">
                    -{m.targetReductionPct}%
                  </td>
                  <td className="p-3 text-right font-tabular text-slate-900 font-semibold">
                    ₹{m.sustainabilityBudgetCrores.toFixed(1)} Cr
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-800">
                      {m.pathwayStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenMineProfile(m.id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onApproveMinePathway(m.id, true)}
                        className="px-2.5 py-1 bg-[#166534] hover:bg-[#14532D] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve Pathway</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingApprovals.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                    All colliery pathways are formally approved and in progress.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
