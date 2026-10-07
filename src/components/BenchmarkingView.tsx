import React, { useState, useMemo } from 'react';
import { MineRecord, MineType } from '../types';
import { Award, Filter, ArrowUpRight, BarChart2, ShieldCheck, ChevronRight } from 'lucide-react';

interface BenchmarkingViewProps {
  mines: MineRecord[];
  activeMineId?: string;
  onSelectMine: (mineId: string) => void;
}

export const BenchmarkingView: React.FC<BenchmarkingViewProps> = ({
  mines,
  activeMineId,
  onSelectMine,
}) => {
  const [selectedType, setSelectedType] = useState<MineType>('opencast');
  const [rankingMetric, setRankingMetric] = useState<'intensity' | 'reduction' | 'renewable'>('intensity');
  const [filterPsu, setFilterPsu] = useState<string>('all');

  // Filter peers by the SAME mine type (Rule: Never compare OC vs UG unfairly!)
  const peerMines = useMemo(() => {
    return mines.filter(m => {
      if (m.mineType !== selectedType) return false;
      if (filterPsu !== 'all' && m.company !== filterPsu) return false;
      return true;
    });
  }, [mines, selectedType, filterPsu]);

  // Statistics among peers
  const stats = useMemo(() => {
    if (peerMines.length === 0) return { avgIntensity: 0, bestIntensity: 0, bestMine: null };
    const intensities = peerMines.map(m => m.emissions.carbonIntensityTco2ePerTonne);
    const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const best = Math.min(...intensities);
    const bestMine = peerMines.find(m => m.emissions.carbonIntensityTco2ePerTonne === best) || peerMines[0];
    return {
      avgIntensity: avg,
      bestIntensity: best,
      bestMine,
    };
  }, [peerMines]);

  // Sorted list for leaderboard
  const rankedMines = useMemo(() => {
    return [...peerMines].sort((a, b) => {
      if (rankingMetric === 'intensity') {
        return a.emissions.carbonIntensityTco2ePerTonne - b.emissions.carbonIntensityTco2ePerTonne;
      }
      if (rankingMetric === 'reduction') {
        return b.currentReductionPct - a.currentReductionPct;
      }
      // Renewable adoption
      const reA = a.operational.renewableEnergyKWh / (a.operational.gridElectricityKWh || 1);
      const reB = b.operational.renewableEnergyKWh / (b.operational.gridElectricityKWh || 1);
      return reB - reA;
    });
  }, [peerMines, rankingMetric]);

  const psuList = useMemo(() => Array.from(new Set(mines.map(m => m.company))), [mines]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
      {/* Header & Fair Comparison Rule Notice */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#166534]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Colliery Peer Benchmarking & Inter-Mine Decarbonization Standing
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fair standardized comparison restricted strictly to peer collieries of identical extraction methodology
          </p>
        </div>

        {/* Mine Type Tabs (Enforce Fair Comparison) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs font-semibold">
          <button
            onClick={() => setSelectedType('opencast')}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedType === 'opencast'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Opencast vs Opencast
          </button>
          <button
            onClick={() => setSelectedType('underground')}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedType === 'underground'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Underground vs Underground
          </button>
          <button
            onClick={() => setSelectedType('mixed')}
            className={`px-3 py-1.5 rounded transition-colors ${
              selectedType === 'mixed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mixed vs Mixed
          </button>
        </div>
      </div>

      {/* Benchmark Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
            PEER GROUP SIZE
          </span>
          <span className="text-xl font-bold text-slate-900 font-tabular block">
            {peerMines.length} Collieries
          </span>
          <span className="text-[11px] text-slate-400">
            {selectedType.toUpperCase()} technology class
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
            PEER AVERAGE INTENSITY
          </span>
          <span className="text-xl font-bold text-slate-800 font-tabular block">
            {stats.avgIntensity.toFixed(4)}
          </span>
          <span className="text-[11px] text-slate-400">
            tCO2e / tonne of coal extracted
          </span>
        </div>

        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded">
          <span className="text-[10px] text-emerald-800 uppercase font-bold block mb-1">
            BEST-IN-CLASS PEER
          </span>
          <span className="text-xl font-bold text-[#166534] font-tabular block">
            {stats.bestIntensity.toFixed(4)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold truncate block">
            {stats.bestMine?.name || 'N/A'}
          </span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
            PSU FILTER
          </span>
          <select
            value={filterPsu}
            onChange={e => setFilterPsu(e.target.value)}
            className="w-full mt-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium"
          >
            <option value="all">All Subsidiaries / PSUs</option>
            {psuList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Ranking Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Rank By:</span>
            <button
              onClick={() => setRankingMetric('intensity')}
              className={`px-2.5 py-1 rounded font-medium ${
                rankingMetric === 'intensity' ? 'bg-[#166534] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Carbon Intensity (Lowest first)
            </button>
            <button
              onClick={() => setRankingMetric('reduction')}
              className={`px-2.5 py-1 rounded font-medium ${
                rankingMetric === 'reduction' ? 'bg-[#166534] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Decarbonization Progress (%)
            </button>
          </div>
          <span className="text-slate-400 text-[11px]">Click row to open mine workspace</span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Mine / Colliery</th>
                <th className="p-3">PSU / State</th>
                <th className="p-3 text-right">Production (Tonnes)</th>
                <th className="p-3 text-right">Gross Emissions (tCO2e)</th>
                <th className="p-3 text-right">Carbon Intensity (t/t)</th>
                <th className="p-3 text-right">Progress vs Baseline</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedMines.map((m, index) => {
                const isCurrentMine = m.id === activeMineId;
                const isBest = index === 0;

                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMine(m.id)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isCurrentMine ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-slate-700">
                      {isBest ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-bold text-[10px]">
                          1
                        </span>
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {m.name}
                        {isCurrentMine && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-normal">
                            Your Colliery
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{m.code}</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {m.company} · {m.state}
                    </td>
                    <td className="p-3 text-right font-tabular text-slate-700">
                      {m.operational.coalExtractedTonnes.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-tabular text-slate-700">
                      {Math.round(m.emissions.totalGrossEmissions).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#166534] font-tabular">
                      {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)}
                    </td>
                    <td className="p-3 text-right font-tabular font-semibold text-emerald-700">
                      -{m.currentReductionPct}%
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        m.targetStatus === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : m.targetStatus === 'behind'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.targetStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
