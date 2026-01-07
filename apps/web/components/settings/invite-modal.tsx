import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export function InviteModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Roles
  const { data: roles } = useQuery({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/workspaces/${workspaceId}/roles`);
      return data;
    },
    enabled: isOpen,
  });

  // Fetch Channels
  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/workspaces/${workspaceId}`);
      return data;
    },
    enabled: isOpen,
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(
        `/invitations?workspaceId=${workspaceId}`,
        {
          email,
          roleId,
          channelIds: selectedChannels,
        }
      );
      toast.success('Invitation sent successfully');
      onSuccess();
      onClose();
      setEmail('');
      setRoleId('');
      setSelectedChannels([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an email invitation to join your workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
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
          
          <div className="space-y-2">
            <Label>Channel Access</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
              {workspace?.channels?.length > 0 ? (
                workspace.channels.map((channel: any) => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={channel.id} 
                      checked={selectedChannels.includes(channel.id)}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                    <label
                      htmlFor={channel.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {channel.name} ({channel.type})
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No channels connected.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
