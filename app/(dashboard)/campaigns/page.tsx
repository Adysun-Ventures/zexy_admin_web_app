'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

/** List rows must expose a numeric API id for GET /admin/notifications/:id */
function getNotificationViewId(campaign: { campaign_id?: string; id: string }): string | null {
  const candidates = [campaign.campaign_id, campaign.id].filter(Boolean) as string[];
  for (const c of candidates) {
    if (/^\d+$/.test(String(c))) return String(c);
  }
  return null;
}

function buildFallbackViewUrl(campaign: Campaign): string {
  const params = new URLSearchParams();
  params.set('title', campaign.title || campaign.name || '');
  params.set('sent_date_time', campaign.sent_date_time || campaign.first_sent_at || campaign.createdAt || '');
  params.set('created_by', campaign.created_by || '');
  params.set('targeted_ids', (campaign.targeted_ids || []).join(','));
  return `/notification_list/view/${encodeURIComponent(campaign.id)}?${params.toString()}`;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsApi.list({ limit: 50, offset: 0 });
      setCampaigns(response.campaigns || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-primary/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link href="/notification_list" className="font-medium text-slate-800 hover:text-slate-950">
          Dashboard
        </Link>
        <span className="mx-2">{'>'}</span>
        <span className="font-medium text-slate-400">Notification</span>
      </div>

      <Card className="rounded-md border border-slate-200 shadow-none">
        <CardHeader className="pb-2">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="absolute left-0">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="h-8 rounded-full border-slate-200 px-3 text-xs"
                title="Back"
              >
                <i className="fa-solid fa-arrow-left mr-1.5 text-[10px]" aria-hidden="true" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Notification</h1>
            </div>

            <div className="absolute right-0">
              <Button
                className="rounded-full bg-green-600 px-4 text-white hover:bg-green-700"
                onClick={() => router.push('/campaigns/new')}
              >
                <i className="fa-regular fa-square-plus mr-2 text-sm" aria-hidden="true" />
                New Notification
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No notifications found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-y border-slate-200 bg-slate-50">
                  <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Title
                  </TableHead>
                  <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Targeted IDs
                  </TableHead>
                  <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Sent date &amp; time
                  </TableHead>
                  <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="h-11 border-slate-100">
                    <TableCell className="px-4 text-center text-sm text-slate-700">
                      {campaign.title || campaign.name || '-'}
                    </TableCell>
                    <TableCell className="px-4 text-center text-sm font-medium text-slate-700">
                      {(campaign.targeted_ids?.length ?? 0) > 0
                        ? (campaign.targeted_ids || []).join(', ')
                        : 'All'}
                    </TableCell>
                    <TableCell className="px-4 text-center text-sm text-slate-700">
                      {formatDate(campaign.sent_date_time || campaign.first_sent_at || campaign.createdAt, 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-md border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="View Details"
                          onClick={() => {
                            const viewId = getNotificationViewId(campaign);
                            if (viewId) {
                              router.push(`/notification_list/view/${viewId}`);
                              return;
                            }
                            router.push(buildFallbackViewUrl(campaign));
                          }}
                        >
                          <i className="fa-solid fa-eye text-sm" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
