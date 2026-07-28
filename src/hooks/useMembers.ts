import { useState, useEffect } from 'react';
import { Member } from '../types';
import { ApiService } from '../services/apiService';

export function useMembers(initialMembers: Member[]) {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('mbok_de_france_members_v1');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  useEffect(() => {
    ApiService.saveMembers(members);
  }, [members]);

  return { members, setMembers };
}
