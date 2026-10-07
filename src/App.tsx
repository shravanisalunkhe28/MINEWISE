import React, { useState, useMemo } from 'react';
import { initializeMines, INITIAL_NATIONAL_TARGETS } from './data/minesData';
import { UserAccount } from './data/accountsData';
import { MineRecord, NationalTargets, AnomalyStatus } from './types';
import { LoginScreen } from './components/LoginScreen';
import { MineManagerWorkspace } from './components/workspaces/MineManagerWorkspace';
import { RegionalWorkspace } from './components/workspaces/RegionalWorkspace';
import { MinistryWorkspace } from './components/workspaces/MinistryWorkspace';
import { EmissionFactorsModal } from './components/EmissionFactorsModal';
import { calculationEngine } from './services/calculationEngine';

export default function App() {
  // Master Session State: initially unauthenticated to require active role selection
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [mines, setMines] = useState<MineRecord[]>(() => initializeMines());
  const [nationalTargets, setNationalTargets] = useState<NationalTargets>(INITIAL_NATIONAL_TARGETS);
  const [activeMineId, setActiveMineId] = useState<string>('mine-gevra-oc');

  // Modals
  const [showEmissionFactorsModal, setShowEmissionFactorsModal] = useState<boolean>(false);

  // Active Mine for Mine Manager role
  const activeMine = useMemo(() => {
    return mines.find(m => m.id === activeMineId) || mines[0];
  }, [mines, activeMineId]);

  // Recalculate all mines when CEA emission factors are adjusted
  const handleFactorsUpdated = () => {
    setMines(prev => prev.map(m => {
      const em = calculationEngine.calculateEmissions(
        m.operational,
        m.mineType,
        m.gassinessDegree || 1,
        (m.operational.renewableEnergyKWh * 0.716) / 1000
      );
      return {
        ...m,
        emissions: em,
      };
    }));
  };

  // Handle data submission by mine manager
  const handleDataSubmitted = (updatedMine: MineRecord) => {
    setMines(prev => prev.map(m => (m.id === updatedMine.id ? updatedMine : m)));
  };

  // Handle pathway approval by regional/ministry official
  const handleApprovePathway = (mineId: string, approved: boolean) => {
    setMines(prev => prev.map(m => {
      if (m.id === mineId) {
        return {
          ...m,
          pathwayStatus: approved ? 'approved' : 'draft',
          pathwayApprovedDate: approved ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return m;
    }));
  };

  // Handle anomaly status update
  const handleUpdateMineAnomaly = (mineId: string, anomalyId: string, newStatus: AnomalyStatus, notes?: string) => {
    setMines(prev => prev.map(m => {
      if (m.id === mineId) {
        const updatedAnomalies = m.anomalies.map(a => {
          if (a.id === anomalyId) {
            return {
              ...a,
              status: newStatus,
              auditNotes: notes || a.auditNotes,
            };
          }
          return a;
        });
        return {
          ...m,
          anomalies: updatedAnomalies,
        };
      }
      return m;
    }));
  };

  // Toggle intervention in colliery plan
  const handleToggleIntervention = (interventionId: string) => {
    setMines(prev => prev.map(m => {
      if (m.id === activeMineId) {
        const exists = m.selectedInterventionIds.includes(interventionId);
        const next = exists
          ? m.selectedInterventionIds.filter(id => id !== interventionId)
          : [...m.selectedInterventionIds, interventionId];
        return {
          ...m,
          selectedInterventionIds: next,
        };
      }
      return m;
    }));
  };

  // If logged out or unauthenticated, render Login screen
  if (!currentUser) {
    return (
      <LoginScreen
        mines={mines}
        onLogin={acc => {
          setCurrentUser(acc);
          if (acc.assignedMineId) {
            setActiveMineId(acc.assignedMineId);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F5] text-[#25282C] font-sans">
      {/* ==============================================================
          RENDER DEDICATED WORKSPACE BASED ON USER ROLE
          Strict isolation of navigation, data scope, and features.
          ============================================================== */}

      {currentUser.role === 'mine_manager' && (
        <MineManagerWorkspace
          mine={activeMine}
          currentUser={currentUser}
          onDataSubmitted={handleDataSubmitted}
          onToggleIntervention={handleToggleIntervention}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {currentUser.role === 'regional_officer' && (
        <RegionalWorkspace
          currentUser={currentUser}
          allMines={mines}
          onApprovePathway={handleApprovePathway}
          onUpdateAnomaly={handleUpdateMineAnomaly}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {currentUser.role === 'ministry_official' && (
        <MinistryWorkspace
          currentUser={currentUser}
          allMines={mines}
          nationalTargets={nationalTargets}
          onUpdateNationalTargets={setNationalTargets}
          onApprovePathway={handleApprovePathway}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {/* Statutory Emission Factors Modal */}
      {showEmissionFactorsModal && (
        <EmissionFactorsModal
          onClose={() => setShowEmissionFactorsModal(false)}
          onFactorsUpdated={handleFactorsUpdated}
        />
      )}
    </div>
  );
}
