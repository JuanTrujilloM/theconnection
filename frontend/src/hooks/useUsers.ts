import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/lib/api/users';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: 1,
  });
}
