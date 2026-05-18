'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { campaignsApi } from '@/lib/api/campaigns';
import { usersApi, User } from '@/lib/api/users';
import { toast } from 'sonner';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [creators, setCreators] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [sendToAllCreators, setSendToAllCreators] = useState(true);
  const [userIdInput, setUserIdInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    body: '',
  });

  useEffect(() => {
    const loadCreators = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await usersApi.listCreators({ limit: 100, offset: 0, include_deleted: false });
        setCreators(response.users || []);
      } catch {
        // If it fails, dropdown will still allow manual ID entry.
        setCreators([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadCreators();
  }, []);

  const creatorsById = useMemo(() => {
    const map = new Map<number, User>();
    for (const creator of creators) map.set(creator.id, creator);
    return map;
  }, [creators]);

  const addSelectedUserId = (id: number) => {
    if (!Number.isFinite(id)) return;
    setSelectedUserIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeSelectedUserId = (id: number) => {
    setSelectedUserIds((prev) => prev.filter((x) => x !== id));
  };

  const parseUserIdInput = (value: string): { mode: 'all' | 'id' | 'invalid'; id?: number } => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return { mode: 'invalid' };
    if (trimmed === 'all') return { mode: 'all' };
    const id = Number(trimmed);
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) return { mode: 'invalid' };
    return { mode: 'id', id };
  };

  const commitUserIdInput = () => {
    const parsed = parseUserIdInput(userIdInput);
    if (parsed.mode === 'all') {
      setSendToAllCreators(true);
      setSelectedUserIds([]);
      setUserIdInput('');
      return true;
    }
    if (parsed.mode === 'id' && parsed.id) {
      setSendToAllCreators(false);
      addSelectedUserId(parsed.id);
      setUserIdInput('');
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If user typed an ID and hit submit directly, consume it.
      let nextSelectedIds = selectedUserIds;
      let nextSendToAll = sendToAllCreators;
      if (userIdInput.trim()) {
        const parsed = parseUserIdInput(userIdInput);
        if (parsed.mode === 'all') {
          nextSendToAll = true;
          nextSelectedIds = [];
        } else if (parsed.mode === 'id' && parsed.id) {
          nextSendToAll = false;
          nextSelectedIds = nextSelectedIds.includes(parsed.id) ? nextSelectedIds : [...nextSelectedIds, parsed.id];
        } else {
          toast.error('Please enter a valid numeric creator id (or type "all")');
          setIsLoading(false);
          return;
        }
      }

      const result = await campaignsApi.create({
        title: formData.title,
        body: formData.body,
        ...(!nextSendToAll && nextSelectedIds.length > 0 ? { targeted_ids: nextSelectedIds } : {}),
      });
      toast.success(`Notification queued for ${result.users_targeted} user(s)!`);
      router.push('/notification_list');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
        <span className="font-medium text-slate-400">Create</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-6">
            {/* Message Content */}
            <Card className="border-2 py-0">
              <CardContent className="p-6 space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute left-0">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="h-9 rounded-full px-3"
                      title="Back"
                    >
                      <i className="fa-solid fa-arrow-left mr-2 text-sm" aria-hidden="true" />
                      Back
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Create Notification</h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 pb-2 border-b">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-lg">Message Content</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetedUserId" className="text-sm font-medium">
                      Targeted IDs
                    </Label>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <div className="flex-1">
                        <Input
                          id="targetedUserId"
                          list="creator-ids"
                          placeholder={isLoadingUsers ? 'Loading creators…' : 'Search creator by name / mobile / id (or choose all)'}
                          value={userIdInput}
                          onChange={(e) => setUserIdInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (!commitUserIdInput()) {
                                toast.error('Please enter a valid numeric creator id (or type "all")');
                              }
                            }
                          }}
                          className="h-11"
                        />
                        <datalist id="creator-ids">
                          <option value="all" label="All Creators" />
                          {creators.map((creator) => (
                            <option
                              key={creator.id}
                              value={String(creator.id)}
                              label={`${creator.name || '-'} • ${creator.mobile || '-'} • @${creator.username || '-'}`}
                            />
                          ))}
                        </datalist>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-md"
                        onClick={() => {
                          if (!commitUserIdInput()) {
                            toast.error('Please enter a valid numeric creator id (or type "all")');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    {sendToAllCreators ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSendToAllCreators(false)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                          title="Click to switch to targeted creators"
                        >
                          <span>All Creators</span>
                          <i className="fa-solid fa-pen-to-square text-[10px]" aria-hidden="true" />
                        </button>
                      </div>
                    ) : selectedUserIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedUserIds.map((id) => {
                          const creator = creatorsById.get(id);
                          const label = creator?.name ? `${creator.name} (#${id})` : `#${id}`;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => removeSelectedUserId(id)}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                              title="Remove"
                            >
                              <span>{label}</span>
                              <i className="fa-solid fa-xmark text-[10px]" aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    <p className="text-xs text-muted-foreground">
                      Choose <span className="font-medium">all</span> to notify everyone, or add creator IDs to target specific creators.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium flex items-center gap-1">
                      Notification Title
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="🎉 Summer Sale is Live!"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Headline shown in push notification
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body" className="text-sm font-medium flex items-center gap-1">
                      Message Body
                      <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      id="body"
                      placeholder="Get up to 50% off on all products. Limited time offer!"
                      value={formData.body}
                      onChange={(e) => handleChange('body', e.target.value)}
                      required
                      rows={6}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Main notification content
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formData.body.length} characters
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title || !formData.body}
                className="flex-1 h-11 shadow-lg shadow-primary/25"
              >
                {isLoading ? 'Creating...' : 'Create Notification'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
