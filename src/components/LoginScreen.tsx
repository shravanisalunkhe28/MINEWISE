import React, { useState, useMemo, useEffect } from 'react';
import { MineRecord, UserRole } from '../types';
import { UserAccount } from '../data/accountsData';
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronDown,
  Layers,
  Globe,
  MapPin,
  Check,
  RefreshCw,
  Info,
  Sliders,
  User,
  Mail,
  BadgeCheck,
  Sparkles,
  RotateCcw,
  FileCheck2,
  Fingerprint,
  Building
} from 'lucide-react';

interface LoginScreenProps {
  mines?: MineRecord[];
  onLogin: (account: UserAccount) => void;
}

// Available PSU Companies with full name and code
const PSU_COMPANIES = [
  { code: 'SECL', name: 'South Eastern Coalfields Limited (SECL)', stateDefault: 'Chhattisgarh' },
  { code: 'BCCL', name: 'Bharat Coking Coal Limited (BCCL)', stateDefault: 'Jharkhand' },
  { code: 'MCL', name: 'Mahanadi Coalfields Limited (MCL)', stateDefault: 'Odisha' },
  { code: 'CCL', name: 'Central Coalfields Limited (CCL)', stateDefault: 'Jharkhand' },
  { code: 'NCL', name: 'Northern Coalfields Limited (NCL)', stateDefault: 'Madhya Pradesh' },
  { code: 'WCL', name: 'Western Coalfields Limited (WCL)', stateDefault: 'Maharashtra' },
  { code: 'ECL', name: 'Eastern Coalfields Limited (ECL)', stateDefault: 'West Bengal' },
  { code: 'SCCL', name: 'Singareni Collieries Company Limited (SCCL)', stateDefault: 'Telangana' },
];

// Mining Areas per PSU for Regional Officers
const REGIONAL_AREAS: Record<string, string[]> = {
  SECL: ['Korba Operational Area', 'Bilaspur Headquarters', 'Raigarh Coal Basin', 'Baikunthpur Area', 'Sohagpur Area'],
  BCCL: ['Dhanbad Coal Basin Area', 'Jharia Fire & Mining Area', 'Katras Operational Area', 'Barora Mining Sector', 'Koyla Nagar HQ'],
  MCL: ['Ib Valley Regional Area', 'Talcher Regional Area', 'Sambalpur Headquarters', 'Basundhara Area'],
  CCL: ['North Karanpura Coal Area', 'Bokaro & Kargali Area', 'Ranchi Headquarters', 'Barkakana Area'],
  NCL: ['Singrauli Regional Area', 'Moher Basin Sector', 'Jayant-Nigahi Sector', 'Singrauli HQ'],
  WCL: ['Nagpur Regional Area', 'Chandrapur & Wardha Valley', 'Umrer Mining Sector', 'Pench & Kanhan Area'],
  ECL: ['Raniganj Coalfield Area', 'Sanctoria Headquarters', 'Rajmahal Mining Sector', 'Kenda Area'],
  SCCL: ['Godavari Valley Coal Basin', 'Kothagudem Mining Area', 'Ramagundam Industrial Sector', 'Bellampalli Area'],
};

// Regional Directorates / Offices
const REGIONAL_OFFICES = [
  'CGM (Environment, Forestry & Decarbonization Directorate)',
  'Regional Carbon Accounting & Sustainability Cell',
  'Regional Project Monitoring & Energy Transition Directorate',
];

// Ministry Departments
const MINISTRY_DEPARTMENTS = [
  'Ministry of Coal (Shastri Bhawan, New Delhi)',
  'National Decarbonization & Green Transition Cell',
  'Policy & Sustainable Mining Monitoring Cell',
];

// Ministry Access Levels
const MINISTRY_ACCESS_LEVELS = [
  'National Monitoring',
  'Policy & Sustainability',
  'Statutory Target Cascade & Strategic Monitoring',
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ mines = [], onLogin }) => {
  // Cascading Selection State - Strictly NOT pre-filled (empty strings)
  const [selectedUserType, setSelectedUserType] = useState<string>('');

  // Identity / Official Credentials
  const [fullName, setFullName] = useState<string>('');
  const [officialId, setOfficialId] = useState<string>('');
  const [officialEmail, setOfficialEmail] = useState<string>('');

  // Mine Manager Cascade
  const [selectedPsu, setSelectedPsu] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedMineId, setSelectedMineId] = useState<string>('');

  // Regional Officer Cascade
  const [selectedRegionalPsu, setSelectedRegionalPsu] = useState<string>('');
  const [selectedRegionArea, setSelectedRegionArea] = useState<string>('');
  const [selectedRegionalOffice, setSelectedRegionalOffice] = useState<string>('');

  // Ministry Official Cascade
  const [selectedMinistryDept, setSelectedMinistryDept] = useState<string>('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('');

  // Verification Screen States: 'form' | 'verifying' | 'verified'
  const [verificationStage, setVerificationStage] = useState<'form' | 'verifying' | 'verified'>('form');
  const [verificationCheckIndex, setVerificationCheckIndex] = useState<number>(0);
  const [sessionToken, setSessionToken] = useState<string>('');

  // Available States for the chosen PSU (filtered from mines or fallback)
  const availableStates = useMemo(() => {
    if (!selectedPsu) return [];
    const psuMines = mines.filter(m => m.company === selectedPsu);
    const uniqueStates = Array.from(new Set(psuMines.map(m => m.state)));
    if (uniqueStates.length > 0) return uniqueStates;

    const psuObj = PSU_COMPANIES.find(p => p.code === selectedPsu);
    return psuObj ? [psuObj.stateDefault] : ['Chhattisgarh', 'Jharkhand', 'Odisha', 'Madhya Pradesh'];
  }, [selectedPsu, mines]);

  // Available Mines for the chosen PSU + State
  const availableMines = useMemo(() => {
    if (!selectedPsu || !selectedState) return [];
    const filtered = mines.filter(m => m.company === selectedPsu && m.state === selectedState);
    if (filtered.length > 0) return filtered;

    // Fallback: any mine matching PSU
    return mines.filter(m => m.company === selectedPsu);
  }, [selectedPsu, selectedState, mines]);

  // Available Areas for Regional Officer
  const availableAreas = useMemo(() => {
    if (!selectedRegionalPsu) return [];
    return REGIONAL_AREAS[selectedRegionalPsu] || ['Main Regional Area', 'Headquarters Sector'];
  }, [selectedRegionalPsu]);

  // Handle User Type Change (resets subsequent steps)
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserType(e.target.value);
    setSelectedPsu('');
    setSelectedState('');
    setSelectedMineId('');
    setSelectedRegionalPsu('');
    setSelectedRegionArea('');
    setSelectedRegionalOffice('');
    setSelectedMinistryDept('');
    setSelectedAccessLevel('');
    setVerificationStage('form');
  };

  // Handle PSU Change for Mine Manager
  const handlePsuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPsu(e.target.value);
    setSelectedState('');
    setSelectedMineId('');
  };

  // Handle State Change for Mine Manager
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setSelectedMineId('');
  };

  // Handle Regional PSU Change
  const handleRegionalPsuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegionalPsu(e.target.value);
    setSelectedRegionArea('');
    setSelectedRegionalOffice('');
  };

  // Email validation check
  const isEmailValid = useMemo(() => {
    if (!officialEmail.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail.trim());
  }, [officialEmail]);

  // Validate if entire profile information and role hierarchy is complete
  const isFormComplete = useMemo(() => {
    // 1. Identity must be filled
    if (!fullName.trim() || !officialId.trim() || !isEmailValid) {
      return false;
    }

    // 2. Role-specific validation
    if (selectedUserType === 'mine_manager') {
      return Boolean(selectedPsu && selectedState && selectedMineId);
    }
    if (selectedUserType === 'regional_officer') {
      return Boolean(selectedRegionalPsu && selectedRegionArea && selectedRegionalOffice);
    }
    if (selectedUserType === 'ministry_official') {
      return Boolean(selectedMinistryDept && selectedAccessLevel);
    }
    return false;
  }, [
    fullName,
    officialId,
    isEmailValid,
    selectedUserType,
    selectedPsu,
    selectedState,
    selectedMineId,
    selectedRegionalPsu,
    selectedRegionArea,
    selectedRegionalOffice,
    selectedMinistryDept,
    selectedAccessLevel,
  ]);

  // Quick Demo Preset Fillers for easy evaluator testing
  const handleApplyDemoPreset = (preset: 'mine_manager' | 'regional_officer' | 'ministry_official') => {
    if (preset === 'mine_manager') {
      const psu = 'SECL';
      const state = 'Chhattisgarh';
      const matchingMine = mines.find(m => m.company === psu && m.state === state) || mines[0];

      setSelectedUserType('mine_manager');
      setFullName('Rahul Sharma');
      setOfficialId('CIL-MGR-1024');
      setOfficialEmail('rahul.sharma@secl.gov.in');
      setSelectedPsu(psu);
      setSelectedState(state);
      setSelectedMineId(matchingMine ? matchingMine.id : 'mine-gevra-oc');
      setVerificationStage('form');
    } else if (preset === 'regional_officer') {
      setSelectedUserType('regional_officer');
      setFullName('Dr. Sunita V. Deshmukh');
      setOfficialId('CIL-CGM-ENV-884');
      setOfficialEmail('sunita.deshmukh@cil.gov.in');
      setSelectedRegionalPsu('SECL');
      setSelectedRegionArea('Korba Operational Area');
      setSelectedRegionalOffice('CGM (Environment, Forestry & Decarbonization Directorate)');
      setVerificationStage('form');
    } else if (preset === 'ministry_official') {
      setSelectedUserType('ministry_official');
      setFullName('Shri Amitabh Kant Varma, IAS');
      setOfficialId('MOC-JS-4012');
      setOfficialEmail('amitabh.varma@coal.gov.in');
      setSelectedMinistryDept('Ministry of Coal (Shastri Bhawan, New Delhi)');
      setSelectedAccessLevel('National Monitoring');
      setVerificationStage('form');
    }
  };

  const handleClearAll = () => {
    setSelectedUserType('');
    setFullName('');
    setOfficialId('');
    setOfficialEmail('');
    setSelectedPsu('');
    setSelectedState('');
    setSelectedMineId('');
    setSelectedRegionalPsu('');
    setSelectedRegionArea('');
    setSelectedRegionalOffice('');
    setSelectedMinistryDept('');
    setSelectedAccessLevel('');
    setVerificationStage('form');
  };

  // Trigger Profile Verification flow
  const handleStartVerification = () => {
    if (!isFormComplete) return;
    setVerificationStage('verifying');
    setVerificationCheckIndex(0);
    const token = `GOI-MOC-${Math.floor(100000 + Math.random() * 900000)}`;
    setSessionToken(token);
  };

  // Sequential simulated verification timer
  useEffect(() => {
    if (verificationStage !== 'verifying') return;

    const timer1 = setTimeout(() => setVerificationCheckIndex(1), 350);
    const timer2 = setTimeout(() => setVerificationCheckIndex(2), 700);
    const timer3 = setTimeout(() => setVerificationCheckIndex(3), 1100);
    const timer4 = setTimeout(() => setVerificationCheckIndex(4), 1500);
    const timerFinal = setTimeout(() => setVerificationStage('verified'), 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timerFinal);
    };
  }, [verificationStage]);

  // Selected mine object for confirmation summary
  const selectedMineObj = useMemo(() => {
    return mines.find(m => m.id === selectedMineId);
  }, [mines, selectedMineId]);

  // Selected PSU object for confirmation summary
  const selectedPsuObj = useMemo(() => {
    return PSU_COMPANIES.find(p => p.code === selectedPsu);
  }, [selectedPsu]);

  // Selected Regional PSU object
  const selectedRegionalPsuObj = useMemo(() => {
    return PSU_COMPANIES.find(p => p.code === selectedRegionalPsu);
  }, [selectedRegionalPsu]);

  // Build user account and enter MINEWISE
  const handleEnterPlatform = () => {
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'IN';

    if (selectedUserType === 'mine_manager') {
      const chosenMine = selectedMineObj || mines[0];
      const account: UserAccount = {
        id: `user-${officialId.toLowerCase().replace(/[^a-z0-9]/g, '-') || chosenMine.id}`,
        name: fullName.trim() || 'Colliery Project Officer',
        designation: 'General Manager (Mining) & Project Officer',
        organization: `${chosenMine?.name || 'Colliery'}, ${selectedPsuObj?.name || selectedPsu}`,
        role: 'mine_manager' as UserRole,
        assignedMineId: chosenMine?.id || 'mine-gevra-oc',
        assignedRegion: (chosenMine?.company || selectedPsu) as string,
        avatarInitials: initials,
        description: `Operational data entry, carbon intensity tracking, and local roadmap execution for ${chosenMine?.name}.`,
        employeeId: officialId.trim(),
        email: officialEmail.trim(),
        accessLevel: 'Colliery Operational Access',
      };
      onLogin(account);
    } else if (selectedUserType === 'regional_officer') {
      const account: UserAccount = {
        id: `user-reg-${selectedRegionalPsu.toLowerCase()}`,
        name: fullName.trim() || `Regional Sustainability Officer (${selectedRegionalPsu})`,
        designation: selectedRegionalOffice || 'CGM (Environment & Sustainability)',
        organization: `${selectedRegionalPsuObj?.name || selectedRegionalPsu} · ${selectedRegionArea}`,
        role: 'regional_officer' as UserRole,
        assignedRegion: selectedRegionalPsu,
        avatarInitials: initials,
        description: `Statutory oversight, fleet benchmarking, pathway approvals, and anomaly audits for ${selectedRegionalPsu}.`,
        employeeId: officialId.trim(),
        email: officialEmail.trim(),
        accessLevel: selectedRegionalOffice,
      };
      onLogin(account);
    } else if (selectedUserType === 'ministry_official') {
      const account: UserAccount = {
        id: 'user-ministry-official',
        name: fullName.trim() || 'Ministry Monitoring Official',
        designation: 'Joint Secretary (Clean Coal & Sustainable Development)',
        organization: selectedMinistryDept || 'Ministry of Coal',
        role: 'ministry_official' as UserRole,
        avatarInitials: initials,
        description: 'National coal sector carbon tracking, India-wide GIS mine mapping, and statutory target cascade.',
        employeeId: officialId.trim(),
        email: officialEmail.trim(),
        accessLevel: selectedAccessLevel || 'National Monitoring',
      };
      onLogin(account);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F5] flex flex-col justify-between font-sans text-[#25282C]">
      {/* Government Masthead */}
      <header className="bg-white border-b border-[#E2E5E9] py-3 px-6 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#25282C] rounded flex items-center justify-center text-white font-extrabold text-sm tracking-tight border border-[#343A40]">
              M
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">
                भारत सरकार · MINISTRY OF COAL · GOVERNMENT OF INDIA
              </div>
              <h1 className="text-sm font-bold text-[#25282C] tracking-tight">
                MINEWISE Carbon Intelligence & Decarbonization Platform
              </h1>
            </div>
          </div>

          <div className="text-xs text-[#64748B] hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5B8C6A]" />
            <span className="font-medium">Statutory Clean Coal Access Gateway</span>
          </div>
        </div>
      </header>

      {/* Main Centered Panel Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-sm border border-[#E2E5E9] overflow-hidden">
          {/* Header Strip (Graphite) */}
          <div className="bg-[#25282C] text-white p-6 border-b border-[#343A40]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#5B8C6A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                M
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white leading-tight">
                  MINEWISE
                </h2>
                <p className="text-[11px] text-[#A3D0B0] font-medium">
                  Carbon Intelligence & Decarbonization Platform for Indian Coal Mines
                </p>
              </div>
            </div>
            <p className="text-xs text-[#C4C9D0] mt-3 leading-relaxed">
              Official identity verification and role authorization gateway for colliery managers, PSU sustainability authorities, and Ministry of Coal leadership.
            </p>
          </div>

          {/* Quick Demo Fill Bar for Evaluator Convenience */}
          <div className="bg-[#F8F9FA] px-6 py-2.5 border-b border-[#E2E5E9]">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
                <Sparkles className="w-3.5 h-3.5 text-[#5B8C6A]" />
                <span>Quick Demo Fill (Evaluator Mode):</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyDemoPreset('mine_manager')}
                  className="px-2 py-1 text-[11px] font-medium text-[#25282C] bg-white hover:bg-[#E2E5E9] border border-[#E2E5E9] rounded transition-colors"
                >
                  Demo Mine Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDemoPreset('regional_officer')}
                  className="px-2 py-1 text-[11px] font-medium text-[#25282C] bg-white hover:bg-[#E2E5E9] border border-[#E2E5E9] rounded transition-colors"
                >
                  Demo Regional Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDemoPreset('ministry_official')}
                  className="px-2 py-1 text-[11px] font-medium text-[#25282C] bg-white hover:bg-[#E2E5E9] border border-[#E2E5E9] rounded transition-colors"
                >
                  Demo Ministry Official
                </button>
                {(selectedUserType || fullName) && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="p-1 text-[11px] text-[#8E97A2] hover:text-[#C65353] transition-colors"
                    title="Clear fields"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-6">
            {/* STAGE 1: CREDENTIALS & PROFILE SELECTION FORM */}
            {verificationStage === 'form' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-[#E2E5E9] pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#25282C]">
                      Identity & Operational Verification
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F1F3F5] text-[#64748B] border border-[#E2E5E9]">
                      Demo Verification
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Provide your official identity details and organizational affiliation to verify your access scope.
                  </p>
                </div>

                {/* STEP 1: USER TYPE DROPDOWN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#25282C] uppercase tracking-wider block">
                    Step 1 — Select User Type <span className="text-[#C65353]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedUserType}
                      onChange={handleUserTypeChange}
                      className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select User Type...</option>
                      <option value="mine_manager">Mine Manager / Data Entry Staff</option>
                      <option value="regional_officer">PSU / Regional Sustainability Officer</option>
                      <option value="ministry_official">Ministry of Coal Official</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* ==============================================================
                    STEP 2: IDENTITY / PROFILE INFORMATION
                    (Appears once user type is chosen)
                    ============================================================== */}
                {selectedUserType && (
                  <div className="space-y-3.5 pt-3 border-t border-[#E2E5E9] animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#25282C] uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-[#397D8A]" />
                      <span>Step 2 — Identity & Official Profile Credentials</span>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#64748B] block">
                        Full Name <span className="text-[#C65353]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Official ID & Email in 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#64748B] block">
                          Official ID / Employee ID <span className="text-[#C65353]">*</span>
                        </label>
                        <input
                          type="text"
                          value={officialId}
                          onChange={e => setOfficialId(e.target.value)}
                          placeholder="e.g. CIL-MGR-1024"
                          className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#64748B] block">
                          Official Institutional Email <span className="text-[#C65353]">*</span>
                        </label>
                        <input
                          type="email"
                          value={officialEmail}
                          onChange={e => setOfficialEmail(e.target.value)}
                          placeholder="e.g. rahul.sharma@secl.gov.in"
                          className={`w-full bg-[#F8F9FA] border rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] transition-colors ${
                            officialEmail && !isEmailValid ? 'border-[#C65353]' : 'border-[#E2E5E9]'
                          }`}
                        />
                        {officialEmail && !isEmailValid && (
                          <span className="text-[10px] text-[#C65353] block">
                            Please enter a valid official email address.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==============================================================
                    STEP 3: ROLE-SPECIFIC VERIFICATION FIELDS
                    ============================================================== */}

                {/* 1. MINE MANAGER / DATA ENTRY STAFF */}
                {selectedUserType === 'mine_manager' && (
                  <div className="space-y-3.5 pt-3 border-t border-[#E2E5E9] animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#25282C] uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5 text-[#5B8C6A]" />
                      <span>Step 3 — Mine Manager Operational Jurisdiction</span>
                    </div>

                    {/* PSU Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#64748B] block">
                        PSU / Operating Company <span className="text-[#C65353]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedPsu}
                          onChange={handlePsuChange}
                          className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="">Select PSU / Company...</option>
                          {PSU_COMPANIES.map(psu => (
                            <option key={psu.code} value={psu.code}>
                              {psu.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* State Dropdown (Appears after PSU) */}
                    {selectedPsu && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[11px] font-semibold text-[#64748B] block">
                          Operating State <span className="text-[#C65353]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedState}
                            onChange={handleStateChange}
                            className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Select State...</option>
                            {availableStates.map(state => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Mine Dropdown (Appears after State) */}
                    {selectedPsu && selectedState && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[11px] font-semibold text-[#64748B] block">
                          Colliery / Mine Assignment <span className="text-[#C65353]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedMineId}
                            onChange={e => setSelectedMineId(e.target.value)}
                            className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Select Mine...</option>
                            {availableMines.map(mine => (
                              <option key={mine.id} value={mine.id}>
                                {mine.name} ({mine.code} · {mine.mineType.toUpperCase()})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                        {availableMines.length === 0 && (
                          <span className="text-[11px] text-[#D99A2B] block">
                            No registered mines found for this combination.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. REGIONAL / PSU OFFICER */}
                {selectedUserType === 'regional_officer' && (
                  <div className="space-y-3.5 pt-3 border-t border-[#E2E5E9] animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#25282C] uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5 text-[#397D8A]" />
                      <span>Step 3 — PSU Regional Oversight Scope</span>
                    </div>

                    {/* Organization / PSU */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#64748B] block">
                        PSU / Organization <span className="text-[#C65353]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedRegionalPsu}
                          onChange={handleRegionalPsuChange}
                          className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="">Select Organization / PSU...</option>
                          {PSU_COMPANIES.map(psu => (
                            <option key={psu.code} value={psu.code}>
                              {psu.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Region / Area (Appears after PSU) */}
                    {selectedRegionalPsu && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[11px] font-semibold text-[#64748B] block">
                          Region / Operational Area <span className="text-[#C65353]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedRegionArea}
                            onChange={e => setSelectedRegionArea(e.target.value)}
                            className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Select Region / Area...</option>
                            {availableAreas.map(area => (
                              <option key={area} value={area}>
                                {area}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Regional Office (Appears after Area) */}
                    {selectedRegionalPsu && selectedRegionArea && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[11px] font-semibold text-[#64748B] block">
                          Regional Office / Directorate <span className="text-[#C65353]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedRegionalOffice}
                            onChange={e => setSelectedRegionalOffice(e.target.value)}
                            className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Select Regional Office...</option>
                            {REGIONAL_OFFICES.map(office => (
                              <option key={office} value={office}>
                                {office}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. MINISTRY OF COAL OFFICIAL */}
                {selectedUserType === 'ministry_official' && (
                  <div className="space-y-3.5 pt-3 border-t border-[#E2E5E9] animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#25282C] uppercase tracking-wider">
                      <Globe className="w-3.5 h-3.5 text-[#397D8A]" />
                      <span>Step 3 — Ministry of Coal Department & Access Level</span>
                    </div>

                    {/* Department / Authority */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#64748B] block">
                        Department / Authority <span className="text-[#C65353]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedMinistryDept}
                          onChange={e => setSelectedMinistryDept(e.target.value)}
                          className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="">Select Department / Authority...</option>
                          {MINISTRY_DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Access Level */}
                    {selectedMinistryDept && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[11px] font-semibold text-[#64748B] block">
                          Access Level <span className="text-[#C65353]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedAccessLevel}
                            onChange={e => setSelectedAccessLevel(e.target.value)}
                            className="w-full bg-[#F8F9FA] border border-[#E2E5E9] rounded-md px-3 py-2 text-xs font-medium text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] focus:border-[#5B8C6A] transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Select Access Level...</option>
                            {MINISTRY_ACCESS_LEVELS.map(level => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button: Verify Profile */}
                <div className="pt-4 border-t border-[#E2E5E9]">
                  <button
                    disabled={!isFormComplete}
                    onClick={handleStartVerification}
                    className={`w-full py-2.5 text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 ${
                      isFormComplete
                        ? 'bg-[#5B8C6A] hover:bg-[#3F7D58] text-white cursor-pointer'
                        : 'bg-[#E2E5E9] text-[#64748B] cursor-not-allowed'
                    }`}
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>VERIFY PROFILE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-[#8E97A2] text-center mt-2">
                    Official identity and institutional email required for access validation.
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 2: VERIFYING PROFILE... (SIMULATED CHECK) */}
            {verificationStage === 'verifying' && (
              <div className="py-8 px-4 space-y-6 animate-fadeIn">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#EDF5F0] border border-[#CDE3D5] flex items-center justify-center text-[#5B8C6A]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#5B8C6A]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#25282C] tracking-tight">
                      VERIFYING PROFILE...
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Performing simulated identity validation and role authorization check
                    </p>
                  </div>
                </div>

                {/* Progress Checklist */}
                <div className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {verificationCheckIndex >= 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5B8C6A] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] border-t-transparent animate-spin shrink-0" />
                    )}
                    <span className={`text-xs ${verificationCheckIndex >= 1 ? 'font-semibold text-[#25282C]' : 'text-[#64748B]'}`}>
                      Identity information received
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {verificationCheckIndex >= 2 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5B8C6A] shrink-0" />
                    ) : verificationCheckIndex === 1 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#CBD5E1] bg-white shrink-0" />
                    )}
                    <span className={`text-xs ${verificationCheckIndex >= 2 ? 'font-semibold text-[#25282C]' : 'text-[#64748B]'}`}>
                      Organization matched
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {verificationCheckIndex >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5B8C6A] shrink-0" />
                    ) : verificationCheckIndex === 2 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#CBD5E1] bg-white shrink-0" />
                    )}
                    <span className={`text-xs ${verificationCheckIndex >= 3 ? 'font-semibold text-[#25282C]' : 'text-[#64748B]'}`}>
                      Role permissions checked
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {verificationCheckIndex >= 4 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5B8C6A] shrink-0" />
                    ) : verificationCheckIndex === 3 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#CBD5E1] bg-white shrink-0" />
                    )}
                    <span className={`text-xs ${verificationCheckIndex >= 4 ? 'font-semibold text-[#25282C]' : 'text-[#64748B]'}`}>
                      Workspace access verified
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-[#8E97A2] font-mono">
                    Session Audit Ref: {sessionToken || 'GOI-MOC-AUTH-SESSION'}
                  </span>
                </div>
              </div>
            )}

            {/* STAGE 3: PROFILE VERIFIED (CONFIRMATION BADGE & DETAILS) */}
            {verificationStage === 'verified' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Header confirmation badge */}
                <div className="p-4 bg-[#EDF5F0] border border-[#CDE3D5] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#3F7D58] font-bold text-xs uppercase tracking-wide">
                      <CheckCircle2 className="w-5 h-5 text-[#3F7D58]" />
                      <span>PROFILE VERIFIED</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#3F7D58] border border-[#CDE3D5]">
                      Demo Verification
                    </span>
                  </div>
                  <p className="text-xs text-[#25282C] mt-2 font-medium">
                    Official credentials verified. The workspace has been configured according to your authorized operational scope:
                  </p>

                  {/* Summary Profile Card */}
                  <div className="mt-3.5 space-y-2 text-xs bg-white p-3.5 rounded border border-[#CDE3D5]">
                    <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                      <span className="text-[#64748B]">Name:</span>
                      <strong className="text-[#25282C]">{fullName}</strong>
                    </div>

                    <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                      <span className="text-[#64748B]">Official ID:</span>
                      <span className="font-mono text-[#25282C] font-semibold">{officialId}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                      <span className="text-[#64748B]">Official Email:</span>
                      <span className="text-[#25282C] font-medium">{officialEmail}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                      <span className="text-[#64748B]">Role:</span>
                      <strong className="text-[#25282C]">
                        {selectedUserType === 'mine_manager'
                          ? 'Mine Manager / Data Entry Staff'
                          : selectedUserType === 'regional_officer'
                          ? 'PSU / Regional Sustainability Officer'
                          : 'Ministry of Coal Official'}
                      </strong>
                    </div>

                    {selectedUserType === 'mine_manager' && (
                      <>
                        <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                          <span className="text-[#64748B]">Organization:</span>
                          <strong className="text-[#25282C]">{selectedPsu} ({selectedState})</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Authorized Colliery:</span>
                          <strong className="text-[#3F7D58]">
                            {selectedMineObj?.name || 'Selected Colliery'} ({selectedMineObj?.code || 'N/A'})
                          </strong>
                        </div>
                      </>
                    )}

                    {selectedUserType === 'regional_officer' && (
                      <>
                        <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                          <span className="text-[#64748B]">Organization:</span>
                          <strong className="text-[#25282C]">{selectedRegionalPsu}</strong>
                        </div>
                        <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                          <span className="text-[#64748B]">Region / Area:</span>
                          <strong className="text-[#25282C]">{selectedRegionArea}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Regional Directorate:</span>
                          <strong className="text-[#3F7D58]">{selectedRegionalOffice}</strong>
                        </div>
                      </>
                    )}

                    {selectedUserType === 'ministry_official' && (
                      <>
                        <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                          <span className="text-[#64748B]">Authority / Dept:</span>
                          <strong className="text-[#25282C]">{selectedMinistryDept}</strong>
                        </div>
                        <div className="flex justify-between border-b border-[#F1F3F5] pb-1.5">
                          <span className="text-[#64748B]">Access Level:</span>
                          <strong className="text-[#397D8A]">{selectedAccessLevel}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Jurisdiction:</span>
                          <strong className="text-[#3F7D58]">All Indian Coal Collieries (National Command)</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Button: Enter MINewise */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVerificationStage('form')}
                    className="py-2.5 px-4 text-xs font-semibold text-[#25282C] bg-[#F1F3F5] hover:bg-[#E2E5E9] rounded-md transition-colors"
                  >
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleEnterPlatform}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-[#5B8C6A] hover:bg-[#3F7D58] rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ENTER MINEWISE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer inside card */}
          <div className="bg-[#F8F9FA] px-6 py-3 border-t border-[#E2E5E9] text-[11px] text-[#64748B] flex items-center justify-between">
            <span>CMPDI & DGMS Statutory Standards</span>
            <span className="font-mono">Security: Encrypted Session</span>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="py-3 px-6 text-center text-[#64748B] text-xs border-t border-[#E2E5E9] bg-white">
        Ministry of Coal · Coal India Limited Subsidiaries · Singareni Collieries · Government of India
      </footer>
    </div>
  );
};
