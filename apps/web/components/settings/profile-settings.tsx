import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

interface ProfileSettingsProps {
  user: any;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.patch(
        `/users/${user.id}`,
        { name }
      );
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">


      <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
