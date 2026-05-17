import { User, UserDetail } from '@/lib/api/users';

export const dummyFans: User[] = [
  {
    id: 101,
    mobile: '9876543210',
    username: 'ananya01',
    name: 'Ananya Sharma',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    avatar: null,
    role: 'fan',
    is_active: true,
    is_deleted: false,
    has_completed_onboarding: true,
    last_login_at: '2026-05-04T08:20:00.000Z',
    created_at: '2026-03-12T10:10:00.000Z',
  },
  {
    id: 102,
    mobile: '9123456780',
    username: 'rahul_fan',
    name: 'Rahul Verma',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    avatar: null,
    role: 'fan',
    is_active: true,
    is_deleted: false,
    has_completed_onboarding: false,
    last_login_at: '2026-05-03T12:05:00.000Z',
    created_at: '2026-02-02T09:00:00.000Z',
  },
  {
    id: 103,
    mobile: '9988776655',
    username: 'sana_k',
    name: 'Sana Khan',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    avatar: null,
    role: 'fan',
    is_active: false,
    is_deleted: false,
    has_completed_onboarding: true,
    last_login_at: null,
    created_at: '2026-01-20T14:45:00.000Z',
  },
];

export function getDummyFanById(id: number): UserDetail | null {
  const fan = dummyFans.find((item) => item.id === id);
  if (!fan) return null;

  return {
    ...fan,
    category: null,
    onboarding_step: fan.has_completed_onboarding ? 4 : 2,
    onboarding_completed_at: fan.has_completed_onboarding ? fan.created_at : null,
    terms_accepted_at: null,
    privacy_accepted_at: null,
    age_verified_at: null,
    consent_version: null,
    gender: 'other',
    date_of_birth: '1998-01-01',
    city: fan.city ?? null,
    state: fan.state ?? null,
    country: fan.country ?? null,
    preferred_language: 'en',
  };
}
