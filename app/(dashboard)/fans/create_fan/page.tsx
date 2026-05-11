'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usersApi, FanCreatePayload, FanPayload } from '@/lib/api/users';
import { toast } from 'sonner';

type FanFormData = FanPayload & {};

const initialForm: FanFormData = {
  mobile: '',
  username: '',
  name: '',
  gender: '',
  date_of_birth: '',
  city: '',
  state: '',
  country: '',
};

export default function CreateFanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FanFormData>(initialForm);
  const [niche, setNiche] = useState('fitness');
  const avatar = 'https://randomuser.me/api/portraits/men/51.jpg';

  const handleChange = (field: keyof FanFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: FanCreatePayload = {
        mobile: formData.mobile,
        username: formData.username,
        name: formData.name,
        role: 'fan',
        is_active: true,
        has_completed_onboarding: true,
        niche: niche.trim() || 'fitness',
        gender: formData.gender,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : '',
        city: formData.city,
        state: formData.state,
        country: formData.country,
        avatar,
      };

      const created = await usersApi.createFan(payload);
      toast.success('Fan created successfully');
      router.push(`/fans/${created.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create fan');
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
        <Link href="/fans" className="font-medium text-slate-800 hover:text-slate-950">
          Fans
        </Link>
        <span className="mx-2 text-slate-500">{'>'}</span>
        <span className="font-medium text-slate-400">Create Fan</span>
      </div>

      <Card className="border border-slate-200 shadow-none py-0">
        <CardContent className="p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/fans')}
              className="h-9 rounded-full px-5 text-sm"
            >
              <i className="fa-solid fa-arrow-left mr-2 text-sm" aria-hidden="true" />
              Back
            </Button>

            <h1 className="text-3xl font-bold tracking-tight">Create Fan</h1>

            <Button
              type="submit"
              form="add-fan-form"
              className="h-9 rounded-full bg-green-600 px-5 text-sm text-white hover:bg-green-700"
              disabled={isLoading}
            >
              <i className="fa-solid fa-circle-check mr-2 text-sm" aria-hidden="true" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <form id="add-fan-form" onSubmit={handleSubmit} className="space-y-6">
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
                <div className="hidden md:block" />
              </div>
            </section>

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/fans')}
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

