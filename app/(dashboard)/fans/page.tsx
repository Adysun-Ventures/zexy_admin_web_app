'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { usersApi, User, UserStats } from '@/lib/api/users';
import { dummyFans } from '@/lib/mock/fans';
import { toast } from 'sonner';

export default function FansPage() {
  const router = useRouter();
  const [fans, setFans] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fanToDelete, setFanToDelete] = useState<number | null>(null);
  const limit = 20;

  const fetchFans = async () => {
    try {
      setLoading(true);
      const response = await usersApi.listFans({
        limit,
        offset: page * limit,
        search: search || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
      });
      const users = response.users?.length ? response.users : dummyFans;
      setFans(users);
      setTotal(response.users?.length ? response.total : dummyFans.length);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load fans');
      setFans(dummyFans);
      setTotal(dummyFans.length);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await usersApi.getFanStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchFans();
    fetchStats();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(0);
    fetchFans();
  };

  const handleDeleteClick = (id: number) => {
    setFanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fanToDelete) return;

    try {
      await usersApi.deleteFan(fanToDelete);
      toast.success('Fan deleted successfully');
      fetchFans();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete fan');
    } finally {
      setDeleteDialogOpen(false);
      setFanToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && (
        <div className="flex items-center gap-6 text-xs">
          <span>Total: <span className="font-semibold">{stats.total_users}</span></span>
          <span className="text-green-600">Active: <span className="font-semibold">{stats.active_users}</span></span>
          <span className="text-red-500">Inactive: <span className="font-semibold">{stats.inactive_users}</span></span>
        </div>
      )}

      <div className="text-sm">
        <Link href="/campaigns" className="font-medium text-slate-800 hover:text-slate-950">
          Dashboard
        </Link>
        <span className="mx-2">{'>'}</span>
        <span className="font-medium text-slate-400">Fans</span>
      </div>

      <Card className="rounded-md border border-slate-200 shadow-none">
        <CardHeader className="pb-2">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="absolute left-0">
              <Button
                variant="outline"
                onClick={() => router.push('/campaigns')}
                className="h-8 rounded-full border-slate-200 px-3 text-xs"
                title="Back"
              >
                <i className="fa-solid fa-arrow-left mr-1.5 text-[10px]" aria-hidden="true" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Fans</h1>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchFans}
                className="h-8 w-8 border-slate-200"
                title="Refresh"
              >
                <i className="fa-solid fa-rotate-right text-xs" aria-hidden="true" />
              </Button>
            </div>
            <div className="absolute right-0">
              <Button
                className="rounded-full bg-green-600 px-4 text-white hover:bg-green-700"
                onClick={() => router.push('/fans/new')}
              >
                <i className="fa-regular fa-square-plus mr-2 text-sm" aria-hidden="true" />
                Add Fan
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">{total}</p>
              <p className="text-xs text-slate-500">Total Fans</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 min-w-20 rounded border border-slate-200 bg-white px-2 text-xs"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="relative w-full max-w-44">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-8 border-slate-200 pl-7 text-xs"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading fans...</div>
          ) : !fans || fans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No fans found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-y border-slate-200 bg-slate-50">
                    <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</TableHead>
                    <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">User Name</TableHead>
                    <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Mobile No</TableHead>
                    <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">City</TableHead>
                    <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</TableHead>
                    <TableHead className="h-9 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fans.map((fan) => (
                    <TableRow key={fan.id} className="h-11 border-slate-100">
                      <TableCell className="px-4 text-center text-sm text-slate-700">{fan.name || '-'}</TableCell>
                      <TableCell className="px-4 text-center text-sm text-slate-700">{fan.username || '-'}</TableCell>
                      <TableCell className="px-4 text-center text-sm font-medium text-slate-700">{fan.mobile || '-'}</TableCell>
                      <TableCell className="px-4 text-center text-sm text-slate-700">{fan.city || '-'}</TableCell>
                      <TableCell className="px-4 text-center">
                        {fan.is_active ? (
                          <Badge variant="secondary" className="h-6 rounded-full bg-green-100 px-2.5 text-xs font-medium text-green-700 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="h-6 rounded-full bg-red-100 px-2.5 text-xs font-medium text-red-700 hover:bg-red-100">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-md border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="View Details"
                            onClick={() => router.push(`/fans/${fan.id}`)}
                          >
                            <i className="fa-solid fa-eye text-sm" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-md border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                            title="Edit"
                            onClick={() => router.push(`/fans/${fan.id}/edit`)}
                          >
                            <i className="fa-solid fa-pen-to-square text-sm" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-md border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            title="Delete"
                            onClick={() => handleDeleteClick(fan.id)}
                          >
                            <i className="fa-regular fa-trash-can text-sm" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <div className="text-xs text-muted-foreground">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} fans
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
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
        title="Delete Fan"
        description="Are you sure you want to delete this fan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
