import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface HealthStatus {
  status: 'ok';
  service: string;
  timestamp: string;
}

export async function fetchHealth(): Promise<HealthStatus> {
  const { data } = await axios.get<HealthStatus>(`${API_URL}/health`);
  return data;
}
