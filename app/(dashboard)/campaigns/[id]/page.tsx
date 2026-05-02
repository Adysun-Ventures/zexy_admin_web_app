'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { campaignsApi } from '@/lib/api/campaigns';
import type { Campaign } from '@/types/campaigns';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
      router.push('/campaigns');
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-muted-foreground mt-1">Campaign details and information</p>
        </div>
        <Badge variant="outline" className={`${getStatusColor(campaign.status)} text-sm px-3 py-1`}>
          {campaign.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(campaign.recipientsCount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total users targeted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(campaign.createdAt), 'MMM d')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(campaign.createdAt), 'yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{campaign.status}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {campaign.sentAt
                ? `Sent ${format(new Date(campaign.sentAt), 'MMM d, yyyy')}`
                : 'Not sent yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Content</CardTitle>
          <CardDescription>The notification message sent to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Title</Label>
            <p className="text-lg font-semibold mt-1">{campaign.title}</p>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Body</Label>
            <p className="text-base mt-1 whitespace-pre-wrap">{campaign.body}</p>
          </div>
        </CardContent>
      </Card>

      {campaign.targetAudience && campaign.targetAudience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
            <CardDescription>User segments targeted by this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {campaign.targetAudience.map((audience, index) => (
                <Badge key={index} variant="secondary">
                  {audience}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Campaign activity timeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div className="flex-1">
              <p className="font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(campaign.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
          </div>

          {campaign.scheduledAt && (
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
              <div className="flex-1">
                <p className="font-medium">Scheduled</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(campaign.scheduledAt), 'MMMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>
            </div>
          )}

          {campaign.sentAt && (
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <p className="font-medium">Sent</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(campaign.sentAt), 'MMMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
