import { User, UserDetail } from '@/lib/api/users';

export const dummyCreators: User[] = [
  {
    id: 201,
    mobile: '9000000001',
    username: '@john_deo01',
    name: 'John Deo',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    avatar: null,
    role: 'creator',
    is_active: true,
    is_deleted: false,
    has_completed_onboarding: true,
    last_login_at: '2026-05-06T09:10:00.000Z',
    created_at: '2026-02-10T09:10:00.000Z',
  },
  {
    id: 202,
    mobile: '9000000002',
    username: '@tony_stark02',
    name: 'Tony Stark',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    avatar: null,
    role: 'creator',
    is_active: true,
    is_deleted: false,
    has_completed_onboarding: false,
    last_login_at: '2026-05-05T10:30:00.000Z',
    created_at: '2026-03-01T10:30:00.000Z',
  },
  {
    id: 203,
    mobile: '9000000003',
    username: '@sana_khan03',
    name: 'Sana Khan',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    avatar: null,
    role: 'creator',
    is_active: false,
    is_deleted: false,
    has_completed_onboarding: true,
    last_login_at: null,
    created_at: '2026-01-15T08:00:00.000Z',
  },
];

export function getDummyCreatorById(id: number): UserDetail | null {
  const creator = dummyCreators.find((item) => item.id === id);
  if (!creator) return null;

  return {
    ...creator,
    category: null,
    onboarding_step: creator.has_completed_onboarding ? 4 : 2,
    onboarding_completed_at: creator.has_completed_onboarding ? creator.created_at : null,
    terms_accepted_at: null,
    privacy_accepted_at: null,
    age_verified_at: null,
    consent_version: null,
    gender: 'other',
    date_of_birth: '1998-01-01',
    city: creator.city ?? null,
    state: creator.state ?? null,
    country: creator.country ?? null,
    preferred_language: 'en',
  };
}

