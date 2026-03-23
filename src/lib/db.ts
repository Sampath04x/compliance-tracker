import fs from 'fs/promises';
import path from 'path';

export interface Client {
  id: string;
  company_name: string;
  country: string;
  entity_type: string;
}

export interface Task {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  due_date: string; // ISO string
  status: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

interface DataStore {
  clients: Client[];
  tasks: Task[];
}

const dataFilePath = path.join(process.cwd(), 'data.json');

const defaultData: DataStore = {
  clients: [
    { id: '1', company_name: 'Tech Innovators LLC', country: 'United States', entity_type: 'LLC' },
    { id: '2', company_name: 'Global Finance Ltd', country: 'United Kingdom', entity_type: 'Corporation' },
    { id: '3', company_name: 'Bavarian Motors GmbH', country: 'Germany', entity_type: 'GmbH' }
  ],
  tasks: [
    {
      id: '1', client_id: '1', title: 'File Q1 Taxes', description: 'Quarterly estimated tax filing',
      category: 'Tax', due_date: '2026-03-31T00:00:00.000Z', status: 'Pending', priority: 'High'
    },
    {
      id: '2', client_id: '1', title: 'Annual Report Filing', description: 'Submit annual business report to the state',
      category: 'Filing', due_date: '2026-04-15T00:00:00.000Z', status: 'Pending', priority: 'Medium'
    },
    {
      id: '3', client_id: '2', title: 'VAT Return', description: 'Monthly VAT return for February',
      category: 'Tax', due_date: '2026-02-28T00:00:00.000Z', status: 'Pending', priority: 'High'
    },
    {
      id: '4', client_id: '3', title: 'Employment Audit', description: 'Annual employment practices audit',
      category: 'Audit', due_date: '2026-05-10T00:00:00.000Z', status: 'Completed', priority: 'Medium'
    }
  ]
};

// Vercel Serverless environment workaround
let inMemoryFallback: DataStore | null = null;
const isVercel = process.env.VERCEL === '1';

export async function readData(): Promise<DataStore> {
  // If running on Vercel, use the in-memory array to bypass "Read-Only Filesystem" errors
  if (isVercel) {
    if (!inMemoryFallback) {
      inMemoryFallback = JSON.parse(JSON.stringify(defaultData));
    }
    return inMemoryFallback!;
  }

  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContents) as DataStore;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await writeData(defaultData);
      return defaultData;
    }
    // If we hit any other error (like EROFS), fallback transparently
    if (!inMemoryFallback) inMemoryFallback = JSON.parse(JSON.stringify(defaultData));
    return inMemoryFallback!;
  }
}

export async function writeData(data: DataStore): Promise<void> {
  if (isVercel) {
    inMemoryFallback = data;
    return;
  }

  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error: any) {
    console.warn("Storage warning: Could not write to disk. Falling back to in-memory storage.");
    inMemoryFallback = data;
  }
}
