'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { campaignsApi } from '@/lib/api/campaigns';
import type { Campaign } from '@/types/campaigns';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Safe date formatter - handles null/undefined/invalid dates
const formatDate = (dateString: string | null | undefined, formatStr: string, fallback: string = 'N/A'): string => {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatStr);
  } catch {
    return fallback;
  }
};

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCampaign(params.id as string);
    }
  }, [params.id]);

  const fetchCampaign = async (id: string) => {
    try {
      const data = await campaignsApi.getById(id);
      setCampaign(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch campaign');
      router.push('/notification_list');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'scheduled':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'draft':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/notification_list" className="font-medium text-slate-800 hover:text-slate-950">
          Dashboard
        </Link>
        <span className="mx-2 text-slate-500">{'>'}</span>
        <Link href="/notification_list" className="font-medium text-slate-800 hover:text-slate-950">
          Notification
        </Link>
        <span className="mx-2 text-slate-500">{'>'}</span>
        <span className="font-medium text-slate-400">View</span>
      </div>

      <Card className="border border-slate-200 shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/notification_list')}
              className="h-9 rounded-full px-3"
              title="Back"
            >
              <i className="fa-solid fa-arrow-left mr-2 text-sm" aria-hidden="true" />
              Back
            </Button>

            <div className="text-center">
              <h1 className="text-3xl font-bold">Notification View</h1>
            </div>

            <Badge variant="outline" className={`${getStatusColor(campaign.status)} px-3 py-1 text-sm`}>
              {campaign.status}
            </Badge>
          </div>

          <CardTitle className="mt-3">Notification #{campaign.id}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{campaign.title || campaign.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sent date &amp; time</p>
              <p className="font-medium">
                {formatDate(campaign.sent_date_time || campaign.first_sent_at || campaign.createdAt, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Targeted IDs</p>
              <p className="font-medium">
                {(campaign.targeted_ids?.length ?? 0) > 0
                  ? (campaign.targeted_ids || []).join(', ')
                  : 'All'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="font-medium">
                {campaign.created_by || 'Unknown'}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
