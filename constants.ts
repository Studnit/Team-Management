
import { OrgNode } from './types';

// Helper to generate unique IDs if missing
const createId = () => Math.random().toString(36).substr(2, 9);

export const INITIAL_DATA: OrgNode = {
  id: "root-manager",
  name: "Sumant Upasani",
  role: "Manager",
  children: [
    {
      id: "l1",
      name: "Harshal Chaudhari",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Hemantkumar Nikole", role: "Member", children: [] },
        { id: createId(), name: "Nagamani Gatti", role: "Member", children: [] },
        { id: createId(), name: "Vaishnavi Mate", role: "Member", children: [] },
        { id: createId(), name: "Ashrin Shaik", role: "Member", children: [] },
        { id: createId(), name: "Praneetha Chandragiri", role: "Member", children: [] }
      ]
    },
    {
      id: "l2",
      name: "Rushikesh Kadam",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Dipak Pawar", role: "Member", children: [] },
        { id: createId(), name: "Rohit Sonawane", role: "Member", children: [] },
        { id: createId(), name: "Prathamesh Chitodikar", role: "Member", children: [] }
      ]
    },
    {
      id: "l3",
      name: "Prakash Borude",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Nilesh Dhongade", role: "Member", children: [] },
        { id: createId(), name: "Kalyani Wabale", role: "Member", children: [] },
        { id: createId(), name: "Raghav Naulakha", role: "Member", children: [] }
      ]
    },
    {
      id: "l4",
      name: "Vishal Gaikwad",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Arjav Jain", role: "Member", children: [] },
        { id: createId(), name: "Akash deshmukh", role: "Member", children: [] },
        { id: createId(), name: "Tushar Phatak", role: "Member", children: [] }
      ]
    },
    {
      id: "l5",
      name: "Vrushabh Mundhe",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Prabhat kashyap", role: "Member", children: [] }
      ]
    },
    {
      id: "l6",
      name: "Gayatri Kelhe",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Amol Datal", role: "Member", children: [] },
        { id: createId(), name: "Edara Venkata Lakshmi Siva Swetha", role: "Member", children: [] },
        { id: createId(), name: "Devi srilakshmi Gudimetla", role: "Member", children: [] },
        { id: createId(), name: "ManiTeja Chittabattina", role: "Member", children: [] },
        { id: createId(), name: "Vishnu Vardhan Lekkala", role: "Member", children: [] },
        { id: createId(), name: "Yuva Sai Reddy Vaka", role: "Member", children: [] },
        { id: createId(), name: "SivaPuram KartikaPriya", role: "Member", children: [] }
      ]
    },
    {
      id: "l7",
      name: "Sanket Bargal",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Shivam Sonawane", role: "Member", children: [] },
        { id: createId(), name: "Kunal Shinde", role: "Member", children: [] },
        { id: createId(), name: "Nithyananda Thalla", role: "Member", children: [] },
        { id: createId(), name: "Swagata Ranagar", role: "Member", children: [] },
        { id: createId(), name: "Atharva Sharma", role: "Member", children: [] },
        { id: createId(), name: "Kartik Machare", role: "Member", children: [] },
        { id: createId(), name: "Sushant Gavade", role: "Member", children: [] }
      ]
    },
    {
      id: "l8",
      name: "Gaurav Shitole",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Deepti Soni", role: "Member", children: [] },
        { id: createId(), name: "Dhruv Naina", role: "Member", children: [] },
        { id: createId(), name: "Hitendra Patel", role: "Member", children: [] },
        { id: createId(), name: "Lekhana Somayajula", role: "Member", children: [] },
        { id: createId(), name: "Sumith Venkat Nallabothula", role: "Member", children: [] }
      ]
    },
    {
      id: "l9",
      name: "Pratik Patil",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Kritika Singh", role: "Member", children: [] },
        { id: createId(), name: "Shivani Sakanure", role: "Member", children: [] },
        { id: createId(), name: "Anusha Kanthed", role: "Member", children: [] },
        { id: createId(), name: "Shubham Gilbile", role: "Member", children: [] },
        { id: createId(), name: "Harshitha Bhavnasai", role: "Member", children: [] }
      ]
    },
    {
      id: "l10",
      name: "Dheeraj Shukla",
      role: "Lead",
      expanded: true,
      children: [
        { id: createId(), name: "Parag Jain", role: "Member", children: [] },
        { id: createId(), name: "Ishita Sakhala", role: "Member", children: [] },
        { id: createId(), name: "Kalyani Raut", role: "Member", children: [] },
        { id: createId(), name: "Akhila Ravi", role: "Member", children: [] }
      ]
    }
  ]
};

export const ADMIN_PASSWORD = "admin123";
export const STORAGE_KEY = "org_flow_hierarchy_v1";
