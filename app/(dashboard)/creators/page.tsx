'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Trash2, RefreshCw, Eye, Edit, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { usersApi, User, UserStats } from '@/lib/api/users';
import { toast } from 'sonner';

export default function CreatorsPage() {
  const router = useRouter();
  const [creators, setCreators] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creatorToDelete, setCreatorToDelete] = useState<number | null>(null);
  const limit = 20;

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const response = await usersApi.listCreators({
        limit,
        offset: page * limit,
        search: search || undefined,
      });
      console.log('API Response:', response);
      console.log('Users array:', response.users);
      setCreators(response.users);
      setTotal(response.total);
    } catch (error: any) {
      console.error('Error fetching creators:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await usersApi.getCreatorStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchCreators();
    fetchStats();
  }, [page]);

  const handleSearch = () => {
    setPage(0);
    fetchCreators();
  };

  const handleDeleteClick = (id: number) => {
    setCreatorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!creatorToDelete) return;

    try {
      await usersApi.deleteCreator(creatorToDelete);
      toast.success('Creator deleted successfully');
      fetchCreators();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete creator');
    } finally {
      setDeleteDialogOpen(false);
      setCreatorToDelete(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Never';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Never';
    }
  };

  const getLastActivity = (user: User): string => {
    const dates = [user.last_login_at].filter(Boolean);
    if (dates.length === 0) return 'Never';
    
    try {
      const timestamps = dates.map(d => new Date(d!).getTime()).filter(t => !isNaN(t));
      if (timestamps.length === 0) return 'Never';
      
      const mostRecent = new Date(Math.max(...timestamps));
      return formatDate(mostRecent.toISOString());
    } catch {
      return 'Never';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creators</h1>
          <p className="text-muted-foreground">Manage content creators on the platform</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Creator
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Creators</CardDescription>
              <CardTitle className="text-3xl">{stats.total_users}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.active_users}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Onboarded</CardDescription>
              <CardTitle className="text-3xl">{stats.completed_onboarding}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.pending_onboarding}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name, username, or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="max-w-md"
              />
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={fetchCreators}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading creators...</div>
          ) : !creators || creators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No creators found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creators.map((creator) => (
                    <TableRow key={creator.id}>
                      <TableCell className="font-medium">{creator.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {creator.avatar && (
                            <img
                              src={creator.avatar}
                              alt={creator.name || 'Avatar'}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span>{creator.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{creator.username || '-'}</TableCell>
                      <TableCell>{creator.mobile}</TableCell>
                      <TableCell>
                        {creator.is_active ? (
                          <Badge variant="default" className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {creator.has_completed_onboarding ? (
                          <Badge variant="default">Complete</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getLastActivity(creator)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View Details"
                            onClick={() => router.push(`/creators/${creator.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                            onClick={() => handleDeleteClick(creator.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} creators
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={(page + 1) * limit >= total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Creator"
        description="Are you sure you want to delete this creator? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
