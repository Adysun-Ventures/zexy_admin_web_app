'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, CheckCircle2, XCircle, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usersApi, UserDetail } from '@/lib/api/users';
import { toast } from 'sonner';

// Safe date formatter
const formatDate = (dateString: string | null | undefined, formatStr: 'full' | 'short' = 'full'): string => {
  if (!dateString) return 'Not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    if (formatStr === 'short') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [creator, setCreator] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCreator(Number(params.id));
    }
  }, [params.id]);

  const fetchCreator = async (id: number) => {
    try {
      setLoading(true);
      const data = await usersApi.getCreatorDetail(id);
      setCreator(data);
    } catch (error: any) {
      console.error('Error fetching creator:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to load creator details');
      router.push('/creators');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return null;
  }

  const location = [creator.city, creator.state, creator.country].filter(Boolean).join(', ') || 'Not specified';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/creators')}
            className="mb-4 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Creators
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                {creator.avatar ? (
                  <img
                    src={creator.avatar}
                    alt={creator.name || 'Creator'}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center ring-4 ring-white dark:ring-slate-800 shadow-xl">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                {creator.is_active && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
                )}
              </div>

              {/* Name & Username */}
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  {creator.name || 'Unnamed Creator'}
                </h1>
                {creator.username && (
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    @{creator.username}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge 
                    variant={creator.is_active ? 'default' : 'secondary'}
                    className={creator.is_active ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                  >
                    {creator.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {creator.niche && (
                    <Badge variant="outline" className="font-normal">
                      {creator.niche}
                    </Badge>
                  )}
                  {creator.is_deleted && (
                    <Badge variant="destructive">Deleted</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline">Edit Profile</Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
                Suspend Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact & Location */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Mobile</p>
                    <p className="font-medium">{creator.mobile}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                    <p className="font-medium">{location}</p>
                  </div>
                </div>

                {creator.preferred_language && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Language</p>
                        <p className="font-medium uppercase">{creator.preferred_language}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Personal Details */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
                Personal Details
              </h2>
              
              <div className="space-y-5">
                {creator.gender && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gender</p>
                    <p className="font-medium capitalize">{creator.gender}</p>
                  </div>
                )}

                {creator.date_of_birth && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Date of Birth</p>
                      <p className="font-medium">{formatDate(creator.date_of_birth, 'short')}</p>
                    </div>
                  </>
                )}

                <Separator />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">User ID</p>
                  <p className="font-mono text-sm">{creator.id}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Activity & Compliance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Onboarding Status */}
            <Card className="p-8 border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold mb-6">Onboarding Status</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
                  <div className="flex items-center gap-3">
                    {creator.has_completed_onboarding ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <span className="text-lg font-semibold">Complete</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-lg font-semibold">Step {creator.onboarding_step} of 4</span>
                      </>
                    )}
                  </div>
                </div>

                {creator.onboarding_completed_at && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Completed On</p>
                    <p className="font-medium">{formatDate(creator.onboarding_completed_at, 'short')}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Compliance & Consent */}
            <Card className="p-8 border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold mb-6">Compliance & Consent</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  {creator.terms_accepted_at ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">Terms & Conditions</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {creator.terms_accepted_at ? formatDate(creator.terms_accepted_at, 'short') : 'Not accepted'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  {creator.privacy_accepted_at ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">Privacy Policy</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {creator.privacy_accepted_at ? formatDate(creator.privacy_accepted_at, 'short') : 'Not accepted'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  {creator.age_verified_at ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">Age Verification</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {creator.age_verified_at ? formatDate(creator.age_verified_at, 'short') : 'Not verified'}
                    </p>
                  </div>
                </div>

                {creator.consent_version && (
                  <div className="flex items-start gap-4">
                    <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Consent Version</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">v{creator.consent_version}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Activity Timeline */}
            <Card className="p-8 border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold mb-6">Activity Timeline</h2>
              
              <div className="space-y-6">
                {creator.last_login_at && (
                  <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Last Login</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(creator.last_login_at)}</p>
                    </div>
                  </div>
                )}

                {creator.onboarding_completed_at && (
                  <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Onboarding Completed</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(creator.onboarding_completed_at)}</p>
                    </div>
                  </div>
                )}

                {creator.created_at && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                      <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Account Created</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(creator.created_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
