'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatorPayload, CreatorUpdatePayload, usersApi } from '@/lib/api/users';
import { getDummyCreatorById } from '@/lib/mock/creators';
import { toast } from 'sonner';

type CreatorFormData = CreatorPayload & {
};

const emptyForm: CreatorFormData = {
  mobile: '',
  username: '',
  name: '',
  gender: '',
  date_of_birth: '',
  city: '',
  state: '',
  country: '',
};

export default function EditCreatorPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<CreatorFormData>(emptyForm);
  const [creatorName, setCreatorName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [role, setRole] = useState<'creator' | 'fan' | 'admin'>('creator');

  useEffect(() => {
    if (params.id) fetchCreator(Number(params.id));
  }, [params.id]);

  const fetchCreator = async (id: number) => {
    try {
      setInitialLoading(true);
      const creator = await usersApi.getCreatorDetail(id);
      setCreatorName(creator.name || '');
      setAvatar(creator.avatar || '');
      setCategory(creator.category || '');
      setIsActive(creator.is_active);
      setRole(creator.role);
      setFormData({
        mobile: creator.mobile || '',
        username: creator.username || '',
        name: creator.name || '',
        gender: creator.gender || '',
        date_of_birth: creator.date_of_birth ? creator.date_of_birth.split('T')[0] : '',
        city: creator.city || '',
        state: creator.state || '',
        country: creator.country || '',
      });
    } catch (error: any) {
      const fallbackCreator = getDummyCreatorById(id);
      if (!fallbackCreator) {
        toast.error(error.response?.data?.error?.message || 'Failed to load creator details');
        router.push('/creators');
        return;
      }
      setCreatorName(fallbackCreator.name || '');
      setAvatar(fallbackCreator.avatar || '');
      setCategory(fallbackCreator.category || '');
      setIsActive(fallbackCreator.is_active);
      setRole(fallbackCreator.role);
      setFormData({
        mobile: fallbackCreator.mobile || '',
        username: fallbackCreator.username || '',
        name: fallbackCreator.name || '',
        gender: fallbackCreator.gender || '',
        date_of_birth: fallbackCreator.date_of_birth ? fallbackCreator.date_of_birth.split('T')[0] : '',
        city: fallbackCreator.city || '',
        state: fallbackCreator.state || '',
        country: fallbackCreator.country || '',
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (field: keyof CreatorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const clearSection = (fields: Array<keyof CreatorFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev };
      fields.forEach((field) => {
        updated[field] = '';
      });
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!params.id) return;
    setIsLoading(true);
    try {
      const payload: CreatorUpdatePayload = {
        username: formData.username,
        name: formData.name,
        avatar,
        category,
        is_active: isActive,
        role,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        city: formData.city,
        state: formData.state,
        country: formData.country,
      };
      await usersApi.updateCreator(Number(params.id), payload);
      toast.success('Creator updated successfully');
      router.push(`/creators/${params.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update creator');
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading creator...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm">
        <Link href="/campaigns" className="font-medium text-slate-800 hover:text-slate-950">
          Dashboard
        </Link>
        <span className="mx-2 text-slate-500">{'>'}</span>
        <Link href="/creators" className="font-medium text-slate-800 hover:text-slate-950">
          Creators
        </Link>
        <span className="mx-2 text-slate-500">{'>'}</span>
        <Link
          href={`/creators/${params.id}`}
          className="font-medium text-slate-800 hover:text-slate-950 transition-colors"
        >
          {creatorName || 'Creator'}
        </Link>
        <span className="mx-2 text-slate-500">{'>'}</span>
        <span className="font-medium text-slate-400">Edit Creator</span>
      </div>

      <Card className="border border-slate-200 shadow-none">
        <CardContent className="p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/creators/${params.id}`)}
              className="h-9 rounded-full px-5 text-sm"
            >
              <i className="fa-solid fa-arrow-left mr-2 text-sm" aria-hidden="true" />
              Back
            </Button>

            <h1 className="text-3xl font-bold tracking-tight">Edit Creator</h1>

            <Button
              type="submit"
              form="edit-creator-form"
              className="h-9 rounded-full bg-green-600 px-5 text-sm text-white hover:bg-green-700"
              disabled={isLoading}
            >
              <i className="fa-solid fa-circle-check mr-2 text-sm" aria-hidden="true" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <form id="edit-creator-form" onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="h-9" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile">Mobile No.</Label>
                  <Input id="mobile" value={formData.mobile} onChange={(e) => handleChange('mobile', e.target.value)} className="h-9" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username">User Name</Label>
                  <Input id="username" value={formData.username} onChange={(e) => handleChange('username', e.target.value)} className="h-9" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date_of_birth">Date Of Birth</Label>
                  <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} className="h-9" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} className="h-9" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={formData.state} onChange={(e) => handleChange('state', e.target.value)} className="h-9" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={formData.country} onChange={(e) => handleChange('country', e.target.value)} className="h-9" required />
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/creators/${params.id}`)}
                className="h-9 rounded-md border-slate-300 px-4 text-sm text-slate-600 hover:bg-slate-100"
              >
                <i className="fa-solid fa-xmark mr-2 text-sm" aria-hidden="true" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 rounded-full bg-green-600 px-5 text-sm text-white hover:bg-green-700"
                disabled={isLoading}
              >
                <i className="fa-solid fa-circle-check mr-2 text-sm" aria-hidden="true" />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
