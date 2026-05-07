'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatorPayload, usersApi } from '@/lib/api/users';
import { getDummyCreatorById } from '@/lib/mock/creators';
import { toast } from 'sonner';

type CreatorFormData = CreatorPayload & {
  email: string;
  current_address: string;
  permanent_address: string;
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
  email: '',
  current_address: '',
  permanent_address: '',
};

export default function EditCreatorPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<CreatorFormData>(emptyForm);
  const [creatorName, setCreatorName] = useState('');

  useEffect(() => {
    if (params.id) fetchCreator(Number(params.id));
  }, [params.id]);

  const fetchCreator = async (id: number) => {
    try {
      setInitialLoading(true);
      const creator = await usersApi.getCreatorDetail(id);
      setCreatorName(creator.name || '');
      setFormData({
        mobile: creator.mobile || '',
        username: creator.username || '',
        name: creator.name || '',
        gender: creator.gender || '',
        date_of_birth: creator.date_of_birth ? creator.date_of_birth.split('T')[0] : '',
        city: creator.city || '',
        state: creator.state || '',
        country: creator.country || '',
        email: '',
        current_address: '',
        permanent_address: '',
      });
    } catch (error: any) {
      const fallbackCreator = getDummyCreatorById(id);
      if (!fallbackCreator) {
        toast.error(error.response?.data?.error?.message || 'Failed to load creator details');
        router.push('/creators');
        return;
      }
      setCreatorName(fallbackCreator.name || '');
      setFormData({
        mobile: fallbackCreator.mobile || '',
        username: fallbackCreator.username || '',
        name: fallbackCreator.name || '',
        gender: fallbackCreator.gender || '',
        date_of_birth: fallbackCreator.date_of_birth ? fallbackCreator.date_of_birth.split('T')[0] : '',
        city: fallbackCreator.city || '',
        state: fallbackCreator.state || '',
        country: fallbackCreator.country || '',
        email: '',
        current_address: '',
        permanent_address: '',
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
      const payload: CreatorPayload = {
        mobile: formData.mobile,
        username: formData.username,
        name: formData.name,
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
    <div className="space-y-0">
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
          <div className="mb-0 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/creators/${params.id}`)}
              className="h-8 rounded-full px-3 text-xs"
            >
              <i className="fa-solid fa-arrow-left mr-1.5 text-[10px]" aria-hidden="true" />
              Back
            </Button>

            <h1 className="text-3xl font-bold tracking-tight">Edit Creator</h1>

            <Button
              type="submit"
              form="edit-creator-form"
              className="h-8 rounded-full bg-green-600 px-4 text-xs text-white hover:bg-green-700"
              disabled={isLoading}
            >
              <i className="fa-solid fa-circle-check mr-1.5 text-[11px]" aria-hidden="true" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <form id="edit-creator-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-base font-semibold">Personal Details</h2>
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="border-l-2 border-emerald-500 pl-2 text-sm font-semibold">Basic Information</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => clearSection(['name', 'mobile', 'username', 'gender'])}
                >
                  <i className="fa-solid fa-broom mr-1 text-[9px]" aria-hidden="true" />
                  Clear
                </Button>
              </div>

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
              <div className="flex items-center justify-between">
                <h3 className="border-l-2 border-emerald-500 pl-2 text-sm font-semibold">Additional Details</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => clearSection(['date_of_birth', 'city', 'state', 'country'])}
                >
                  <i className="fa-solid fa-broom mr-1 text-[9px]" aria-hidden="true" />
                  Clear
                </Button>
              </div>

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

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="border-l-2 border-emerald-500 pl-2 text-sm font-semibold">Contact Information</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => clearSection(['email', 'current_address', 'permanent_address'])}
                >
                  <i className="fa-solid fa-broom mr-1 text-[9px]" aria-hidden="true" />
                  Clear
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email ID</Label>
                  <Input id="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="h-9" />
                </div>
                <div />
                <div className="space-y-1.5">
                  <Label htmlFor="current_address">Current Address</Label>
                  <Input id="current_address" value={formData.current_address} onChange={(e) => handleChange('current_address', e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="permanent_address">Permanent Address</Label>
                  <Input id="permanent_address" value={formData.permanent_address} onChange={(e) => handleChange('permanent_address', e.target.value)} className="h-9" />
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
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
