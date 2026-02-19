
export type Role = 'Manager' | 'Lead' | 'Member';

export interface OrgNode {
  id: string;
  name: string;
  role: Role;
  expanded?: boolean;
  children: OrgNode[];
}

export type UserRole = 'Viewer' | 'Admin';

export interface HierarchyStats {
  totalLeads: number;
  totalMembers: number;
  teamSizes: { name: string; count: number }[];
}

export interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string;
  visible: boolean;
}
