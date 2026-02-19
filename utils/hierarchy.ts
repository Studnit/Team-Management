
import { OrgNode, Role } from '../types';

export const findNode = (root: OrgNode, id: string): OrgNode | null => {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

export const findParent = (root: OrgNode, id: string): OrgNode | null => {
  for (const child of root.children) {
    if (child.id === id) return root;
    const parent = findParent(child, id);
    if (parent) return parent;
  }
  return null;
};

export const updateNode = (root: OrgNode, id: string, updates: Partial<OrgNode>): OrgNode => {
  if (root.id === id) {
    return { ...root, ...updates };
  }
  return {
    ...root,
    children: root.children.map(child => updateNode(child, id, updates))
  };
};

export const addNode = (root: OrgNode, parentId: string, newNode: OrgNode): OrgNode => {
  if (root.id === parentId) {
    return { ...root, children: [...root.children, newNode] };
  }
  return {
    ...root,
    children: root.children.map(child => addNode(child, parentId, newNode))
  };
};

export const removeNode = (root: OrgNode, id: string): OrgNode => {
  return {
    ...root,
    children: root.children
      .filter(child => child.id !== id)
      .map(child => removeNode(child, id))
  };
};

export const moveMember = (root: OrgNode, memberId: string, targetLeadId: string): OrgNode => {
  // 1. Find the member and its current parent
  const parent = findParent(root, memberId);
  const member = findNode(root, memberId);

  if (!parent || !member) return root;

  // 2. Remove member from current parent
  let nextRoot = removeNode(root, memberId);

  // 3. Add member to target lead
  return addNode(nextRoot, targetLeadId, member);
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
