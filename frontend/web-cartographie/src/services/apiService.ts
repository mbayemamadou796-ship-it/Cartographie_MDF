import { Member, AppUser, CustomZone, AuditLog } from '../types';

export class ApiService {
  static async fetchMembers(): Promise<Member[]> {
    // Client-side local storage fallback / API interface
    const data = localStorage.getItem('mbok_de_france_members_v1');
    return data ? JSON.parse(data) : [];
  }

  static async saveMembers(members: Member[]): Promise<void> {
    localStorage.setItem('mbok_de_france_members_v1', JSON.stringify(members));
  }

  static async fetchZones(): Promise<CustomZone[]> {
    const data = localStorage.getItem('mbok_de_france_custom_zones_v1');
    return data ? JSON.parse(data) : [];
  }

  static async fetchUsers(): Promise<AppUser[]> {
    const data = localStorage.getItem('mbok_de_france_users_v1');
    return data ? JSON.parse(data) : [];
  }

  static async logAuditAction(log: AuditLog): Promise<void> {
    const existing = localStorage.getItem('mbok_de_france_audit_logs_v1');
    const logs: AuditLog[] = existing ? JSON.parse(existing) : [];
    logs.unshift(log);
    localStorage.setItem('mbok_de_france_audit_logs_v1', JSON.stringify(logs));
  }
}
