import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  cellphone: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await axios.get<User[]>(`${API_URL}/users`);
  return data;
}
