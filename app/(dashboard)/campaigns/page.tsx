'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, TrendingUp, Users, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { campaignsApi } from '@/lib/api/campaigns';
import type { Campaign } from '@/types/campaigns';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsApi.list();
      setCampaigns(response.campaigns || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return { 
          color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          label: 'Live'
        };
      case 'completed':
        return { 
          color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500',
          label: 'Done'
        };
      case 'scheduled':
        return { 
          color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          label: 'Queued'
        };
      case 'draft':
        return { 
          color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
          dot: 'bg-slate-500',
          label: 'Draft'
        };
      default:
        return { 
          color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
          dot: 'bg-slate-500',
          label: status
        };
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

  const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipientsCount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative flex items-end justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Campaign Manager</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Campaigns
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Orchestrate notification campaigns across your user base
            </p>
          </div>
          <Button 
            onClick={() => router.push('/campaigns/new')} 
            size="lg" 
            className="gap-2 h-12 px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Campaigns</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-4xl font-bold tracking-tight">{campaigns.length}</p>
              <p className="text-xs text-muted-foreground">{activeCampaigns} currently active</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-emerald-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Reach</span>
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-4xl font-bold tracking-tight">{totalRecipients.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Unique recipients targeted</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-500/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">This Month</span>
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-4xl font-bold tracking-tight">
                {campaigns.filter(c => {
                  const created = new Date(c.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
              <p className="text-xs text-muted-foreground">Campaigns launched</p>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-muted-foreground/25 bg-muted/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
          <div className="relative flex flex-col items-center justify-center py-24 px-8">
            <div className="mb-8 relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                <Plus className="h-12 w-12 text-primary/60" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold mb-3">No campaigns yet</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-md text-lg">
              Launch your first notification campaign to start engaging with your audience
            </p>
            <Button 
              onClick={() => router.push('/campaigns/new')} 
              size="lg"
              className="gap-2 h-12 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              Create Your First Campaign
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              All Campaigns ({campaigns.length})
            </h2>
          </div>
          
          <div className="space-y-2">
            {campaigns.map((campaign, index) => {
              const statusConfig = getStatusConfig(campaign.status);
              return (
                <div
                  key={campaign.id}
                  className="group relative overflow-hidden rounded-xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-md hover:border-primary/30 cursor-pointer"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  style={{
                    animation: `slideIn 0.4s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-6">
                      {/* Main Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-200">
                              {campaign.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {campaign.title}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${statusConfig.color} gap-1.5 px-3 py-1 font-medium shrink-0`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-medium">{campaign.recipientsCount.toLocaleString()}</span>
                            <span className="text-xs">recipients</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{format(new Date(campaign.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Arrow */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
