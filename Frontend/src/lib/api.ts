import type { EncounterRecord, HospitalAccount, SubscriptionPlanTier } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      const token = localStorage.getItem('meditriage_jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
    return headers;
  }

  // --- Health Check ---
  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- Auth Endpoints ---
  public async login(hospitalId: string, staffId: string, password: string): Promise<{ success: boolean; token?: string; session?: HospitalAccount; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, staffId, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('meditriage_jwt_token', data.token);
        localStorage.setItem('meditriage_hospital_session_v1', JSON.stringify(data.session));
        window.dispatchEvent(new Event('hospital_auth_changed'));
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error connecting to backend' };
    }
  }

  public async upgradePlan(planTier: SubscriptionPlanTier): Promise<{ success: boolean; session?: HospitalAccount; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/upgrade-plan`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ planTier })
      });
      const data = await res.json();
      if (res.ok && data.session) {
        localStorage.setItem('meditriage_hospital_session_v1', JSON.stringify(data.session));
        window.dispatchEvent(new Event('hospital_auth_changed'));
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating plan' };
    }
  }

  // --- Encounter Endpoints ---
  public async getEncounters(category?: string, query?: string): Promise<EncounterRecord[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.append('category', category);
      if (query) params.append('query', query);

      const url = `${API_BASE_URL}/encounters${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch encounters');
      const data = await res.json();
      return data.encounters || [];
    } catch {
      return [];
    }
  }

  public async getEncounterById(id: string): Promise<EncounterRecord | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/encounters/${id}`, { headers: this.getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      return data.encounter || null;
    } catch {
      return null;
    }
  }

  public async createEncounter(formData: any): Promise<{ success: boolean; encounter?: EncounterRecord; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/encounters`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error creating encounter' };
    }
  }

  public async overrideTriage(id: string, category: string, reason: string, overriddenBy?: string): Promise<{ success: boolean; encounter?: EncounterRecord; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/encounters/${id}/override`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ category, reason, overriddenBy })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error overriding triage' };
    }
  }

  public async updateStatus(id: string, status: string): Promise<{ success: boolean; encounter?: EncounterRecord; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/encounters/${id}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating status' };
    }
  }

  public async getStats(): Promise<{ total: number; red: number; yellow: number; green: number; black: number; hasEmergency: boolean } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/encounters/stats`, { headers: this.getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}

export const api = new ApiClient();
