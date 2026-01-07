import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { Plus, Trash2, Mail, Copy, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InviteModal } from './invite-modal';
import { format } from 'date-fns';

interface TeamSettingsProps {
  workspaceId: string;
}

export function TeamSettings({ workspaceId }: TeamSettingsProps) {
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Fetch Members (Need to update workspace endpoint to include members with roles)
  // For now, assuming workspace endpoint returns members
  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/workspaces/${workspaceId}`);
      return data;
    },
  });

  // Fetch Invitations
  const { data: invitations } = useQuery({
    queryKey: ['invitations', workspaceId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/invitations?workspaceId=${workspaceId}`);
      return data;
    },
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/invitations/${id}?workspaceId=${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', workspaceId] });
      toast.success('Invitation cancelled');
    },
  });

  const [editingMember, setEditingMember] = useState<any>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Fetch Roles
  const { data: roles } = useQuery({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/workspaces/${workspaceId}/roles`);
      return data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      if (!editingMember || !selectedRoleId) return;
      await axiosInstance.patch(`/workspaces/${workspaceId}/members/${editingMember.id}`, {
        roleId: selectedRoleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      setEditingMember(null);
      setSelectedRoleId('');
      toast.success('Member role updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await axiosInstance.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('Member removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    },
  });

  return (
    <div className="space-y-8">
      {/* Members Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Team Members</h3>
          <Button onClick={() => setIsInviteOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspace?.members?.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.avatarUrl} />
                      <AvatarFallback>{member.user.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-xs text-muted-foreground">{member.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.userRole?.name || member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.assignedChannels?.length > 0 ? (
                        member.assignedChannels.map((c: any) => (
                          <Badge key={c.id} variant="secondary" className="text-xs">
                            {c.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingMember(member);
                        setSelectedRoleId(member.roleId);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this member?')) {
                          removeMemberMutation.mutate(member.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invitations Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pending Invitations</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations?.filter((i: any) => i.status === 'PENDING').length > 0 ? (
                invitations.filter((i: any) => i.status === 'PENDING').map((invite: any) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invite.email}
                      </div>
                    </TableCell>
                    <TableCell>{invite.role?.name}</TableCell>
                    <TableCell>
                      <Badge variant={invite.status === 'PENDING' ? 'secondary' : 'default'}>
                        {invite.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invite.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const link = `${window.location.origin}/invite?token=${invite.token}`;
                          navigator.clipboard.writeText(link);
                          toast.success('Invitation link copied to clipboard');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteInvitationMutation.mutate(invite.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No pending invitations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        workspaceId={workspaceId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['invitations', workspaceId] });
        }}
      />

      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Role</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role: any) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>Cancel</Button>
            <Button onClick={() => updateRoleMutation.mutate()} disabled={updateRoleMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
