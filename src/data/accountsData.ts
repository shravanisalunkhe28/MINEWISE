import { UserRole } from '../types';

export interface UserAccount {
  id: string;
  name: string;
  designation: string;
  organization: string;
  role: UserRole;
  assignedMineId?: string;
  assignedRegion?: string;
  avatarInitials: string;
  description: string;
  employeeId?: string;
  email?: string;
  accessLevel?: string;
}

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-gevra-mgr',
    name: 'Er. Rajesh K. Sharma',
    designation: 'General Manager (Mining) & Colliery Head',
    organization: 'Gevra Opencast Project, SECL Korba',
    role: 'mine_manager',
    assignedMineId: 'mine-gevra-oc',
    assignedRegion: 'SECL',
    avatarInitials: 'RS',
    description: 'Mine Manager of Asia’s largest opencast coal mine (50+ Mtpa). Operational data entry, emission hotspot review & solar/FMC simulation.',
  },
  {
    id: 'user-moonidih-mgr',
    name: 'Er. Amitava Sen',
    designation: 'Agent & Colliery Project Officer',
    organization: 'Moonidih Colliery, BCCL Dhanbad',
    role: 'mine_manager',
    assignedMineId: 'mine-moonidih-ug',
    assignedRegion: 'BCCL',
    avatarInitials: 'AS',
    description: 'Underground Degree III Gassy colliery manager managing ventilation air methane (VAM), methane drainage, and longwall power optimization.',
  },
  {
    id: 'user-jharia-mgr',
    name: 'Er. S. N. Mukherjee',
    designation: 'Project Officer (Block-II)',
    organization: 'Jharia Colliery, BCCL Dhanbad',
    role: 'mine_manager',
    assignedMineId: 'mine-jharia-oc',
    assignedRegion: 'BCCL',
    avatarInitials: 'SM',
    description: 'Mine manager with active data anomalies (high diesel consumption and satellite land verification mismatch under review).',
  },
  {
    id: 'user-secl-officer',
    name: 'Dr. Sunita V. Deshmukh',
    designation: 'Chief General Manager (Environment & Decarbonization)',
    organization: 'SECL Bilaspur Headquarters / CIL Western Region',
    role: 'regional_officer',
    assignedRegion: 'SECL',
    avatarInitials: 'SD',
    description: 'Regional PSU sustainability authority overseeing 80+ mines across Chhattisgarh & MP. Approves decarbonization pathways & audits repeated anomalies.',
  },
  {
    id: 'user-ministry-director',
    name: 'Shri Amitabh Kant Varma, IAS',
    designation: 'Joint Secretary (Clean Coal & Sustainable Development)',
    organization: 'Ministry of Coal, Government of India, New Delhi',
    role: 'ministry_official',
    avatarInitials: 'AV',
    description: 'National policymaker tracking sector emissions (MtCO2e), India-wide mine map, state-wise benchmarks, and national 2030/2070 decarbonization targets.',
  },
];
