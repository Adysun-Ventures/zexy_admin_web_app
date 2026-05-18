'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usersApi, UserDetail } from '@/lib/api/users';
import { getDummyFanById } from '@/lib/mock/fans';
import { toast } from 'sonner';

export default function FanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [fan, setFan] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchFan(Number(params.id));
    }
  }, [params.id]);

  const fetchFan = async (id: number) => {
    try {
      setLoading(true);
      const data = await usersApi.getFanDetail(id);
      setFan(data);
    } catch (error: any) {
      const fallbackFan = getDummyFanById(id);
      if (fallbackFan) {
        setFan(fallbackFan);
      } else {
        toast.error(error.response?.data?.error?.message || 'Failed to load fan details');
        router.push('/fans');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading fan details...</div>;
  }

  if (!fan) {
    return null;
  }

  const location = [fan.city, fan.state, fan.country].filter(Boolean).join(', ') || '-';
  const formatDob = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/ /g, '-');
  };
  const formatMetaDate = (value: string | null) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/campaigns" className="font-medium text-slate-800 hover:text-slate-950">
          Dashboard
        </Link>
        <span className="mx-2 text-slate-500">{'>'}</span>
        <Link href="/fans" className="font-medium text-slate-800 hover:text-slate-950">
          Fans
        </Link>
        <span className="mx-2 text-slate-500">{'>'}</span>
        <span className="font-medium text-slate-400">{fan.name || 'Fan View'}</span>
      </div>

      <Card className="border border-slate-200 shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/fans')}
              className="h-9 rounded-full px-3"
              title="Back"
            >
              <i className="fa-solid fa-arrow-left mr-2 text-sm" aria-hidden="true" />
              Back
            </Button>

            <div className="text-center">
              <h1 className="text-3xl font-bold">{fan.name || 'Fan Details'}</h1>
            </div>

            <Button
              onClick={() => router.push(`/fans/${fan.id}/edit`)}
              className="h-9 rounded-md bg-orange-500 px-3 text-white hover:bg-orange-600"
              title="Edit Fan"
            >
              <i className="fa-solid fa-pen-to-square mr-2 text-sm" aria-hidden="true" />
              Edit
            </Button>
          </div>

          <CardTitle className="mt-3 flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={fan.is_active ? 'default' : 'secondary'}>
              {fan.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant={fan.has_completed_onboarding ? 'default' : 'outline'}>
              {fan.has_completed_onboarding ? 'Onboarding Complete' : 'Onboarding Pending'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-medium">{fan.mobile || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User Name</p>
              <p className="font-medium">{fan.username || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{fan.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{fan.gender || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">DOB</p>
              <p className="font-medium">{formatDob(fan.date_of_birth)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{location}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-muted-foreground">
            <p>
              Created By {fan.created_by_name || 'Admin'} on {formatMetaDate(fan.created_at)}
            </p>
            <p>
              Updated By {fan.updated_by_name || fan.created_by_name || 'Admin'} on{' '}
              {formatMetaDate(fan.last_login_at || fan.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
