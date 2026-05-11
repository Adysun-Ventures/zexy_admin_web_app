'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatorCreatePayload, CreatorPayload, usersApi } from '@/lib/api/users';
import { toast } from 'sonner';

type CreatorFormData = CreatorPayload & {
  email: string;
  current_address: string;
};

const initialForm: CreatorFormData = {
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
};

export default function CreateCreatorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatorFormData>(initialForm);
  const [niche, setNiche] = useState('fitness');
  const avatar = 'https://randomuser.me/api/portraits/women/44.jpg';

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
    setIsLoading(true);
    try {
      const payload: CreatorCreatePayload = {
        mobile: formData.mobile,
        username: formData.username,
        name: formData.name,
        role: 'creator',
        is_active: true,
        has_completed_onboarding: true,
        niche: niche.trim() || 'fitness',
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        avatar,
      };

      const created = await usersApi.createCreator(payload);
      toast.success('Creator created successfully');
      router.push(`/creators/${created.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create creator');
    } finally {
      setIsLoading(false);
    }
  };

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
        <span className="font-medium text-slate-400">Create Creator</span>
      </div>

      <Card className="border border-slate-200 shadow-none py-0">
        <CardContent className="p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/creators')}
              className="h-9 rounded-full px-5 text-sm"
            >
              <i className="fa-solid fa-arrow-left mr-2 text-sm" aria-hidden="true" />
              Back
            </Button>

            <h1 className="text-3xl font-bold tracking-tight">Create Creator</h1>

            <Button
              type="submit"
              form="add-creator-form"
              className="h-9 rounded-full bg-green-600 px-5 text-sm text-white hover:bg-green-700"
              disabled={isLoading}
            >
              <i className="fa-solid fa-circle-check mr-2 text-sm" aria-hidden="true" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <form id="add-creator-form" onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile">Mobile No.</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username">User Name</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="Enter username"
                    className="h-9"
                    required
                  />
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
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Enter city"
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Enter state"
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Enter country"
                    className="h-9"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="space-y-1.5 md:col-span-3">
                  <Label htmlFor="niche">Niche</Label>
                  <Input
                    id="niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="fitness"
                    className="h-9"
                  />
                </div>
              </div>
            </section>

            {/* <section className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email ID</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="h-9"
                  />
                </div>
                <div />
                <div className="space-y-1.5">
                  <Label htmlFor="current_address">Current Address</Label>
                  <Input
                    id="current_address"
                    value={formData.current_address}
                    onChange={(e) => handleChange('current_address', e.target.value)}
                    placeholder="Enter current address"
                    className="h-9"
                  />
                </div>
              </div>
            </section> */}

            <div className="flex items-center justify-between pb-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/creators')}
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

