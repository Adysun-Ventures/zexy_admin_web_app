'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Bell, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { campaignsApi } from '@/lib/api/campaigns';
import { toast } from 'sonner';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [targetType, setTargetType] = useState<'campaign' | 'user'>('campaign');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    body: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await campaignsApi.create(formData);
      toast.success('Campaign created successfully!');
      router.push('/campaigns');
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
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
            </div>
            <p className="text-muted-foreground">
              Design and launch a new notification campaign
            </p>
          </div>
        </div>

        {/* Target Type Toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setTargetType('campaign')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              targetType === 'campaign'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Campaign Based
          </button>
          <button
            type="button"
            onClick={() => setTargetType('user')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              targetType === 'user'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            User Based
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-6">
            {/* Campaign Identity */}
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-lg">Campaign Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                      Campaign Name
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Summer Sale 2026"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Internal reference name
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority Level
                    </Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Delivery urgency level
                    </p>
                  </div>
                </div>

                {/* Target Type Specific Fields */}
                {targetType === 'user' && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="userIds" className="text-sm font-medium flex items-center gap-1">
                      Target User IDs
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="userIds"
                      placeholder="e.g., user123, user456, user789"
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of user IDs to target
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Content */}
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-lg">Message Content</h3>
                </div>

                <div className="space-y-6">
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
                disabled={isLoading || !formData.name || !formData.title || !formData.body}
                className="flex-1 h-11 shadow-lg shadow-primary/25"
              >
                {isLoading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
