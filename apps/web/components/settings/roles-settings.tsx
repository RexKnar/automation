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
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface RolesSettingsProps {
  workspaceId: string;
}

const MODULES = [
  { id: 'users', label: 'User Management' },
  { id: 'billing', label: 'Billing & Plans' },
  { id: 'channels', label: 'Channel Management' },
  { id: 'flows', label: 'Flow Builder' },
  { id: 'contacts', label: 'Contact Management' },
  { id: 'conversations', label: 'Conversations' },
];

const ACTIONS = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
];

export function RolesSettings({ workspaceId }: RolesSettingsProps) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  // Structure: { [moduleId]: { [actionId]: boolean } }
  const [newRolePermissions, setNewRolePermissions] = useState<Record<string, Record<string, boolean>>>({});

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/workspaces/${workspaceId}/roles`);
      return data;
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/workspaces/${workspaceId}/roles`, {
        name: newRoleName,
        permissions: newRolePermissions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] });
      setIsCreateOpen(false);
      setNewRoleName('');
      setNewRolePermissions({});
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      await axiosInstance.delete(`/workspaces/${workspaceId}/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceId] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    },
  });

  const togglePermission = (moduleId: string, actionId: string) => {
    setNewRolePermissions(prev => {
      const modulePerms = prev[moduleId] || {};
      return {
        ...prev,
        [moduleId]: {
          ...modulePerms,
          [actionId]: !modulePerms[actionId]
        }
      };
    });
  };

  const toggleModuleAll = (moduleId: string, checked: boolean) => {
    setNewRolePermissions(prev => {
      const modulePerms: Record<string, boolean> = {};
      ACTIONS.forEach(action => {
        modulePerms[action.id] = checked;
      });
      return {
        ...prev,
        [moduleId]: modulePerms
      };
    });
  };

  const renderPermissionsSummary = (permissions: any) => {
      if (permissions.all) return 'Full Access';
      
      const activeModules = Object.keys(permissions).filter(key => {
          const mod = permissions[key];
          return typeof mod === 'object' && Object.values(mod).some(v => v === true);
      });

      if (activeModules.length === 0) return 'None';
      if (activeModules.length === MODULES.length) return 'All Modules';
      
      return `${activeModules.length} Modules Access`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Roles & Permissions</h3>
        <Button onClick={() => setIsCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Permissions Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles?.map((role: any) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <Badge variant="secondary">System</Badge>
                  ) : (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {renderPermissionsSummary(role.permissions)}
                </TableCell>
                <TableCell className="text-right">
                  {!role.isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRoleMutation.mutate(role.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Marketing Manager"
              />
            </div>
            
            <div className="space-y-4">
              <Label>Permissions Matrix</Label>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px]">Module</TableHead>
                      {ACTIONS.map(action => (
                        <TableHead key={action.id} className="text-center">{action.label}</TableHead>
                      ))}
                      <TableHead className="text-center">All</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MODULES.map(module => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">{module.label}</TableCell>
                        {ACTIONS.map(action => (
                          <TableCell key={action.id} className="text-center">
                            <Checkbox 
                              checked={!!newRolePermissions[module.id]?.[action.id]}
                              onCheckedChange={() => togglePermission(module.id, action.id)}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={ACTIONS.every(a => !!newRolePermissions[module.id]?.[a.id])}
                            onCheckedChange={(checked) => toggleModuleAll(module.id, checked as boolean)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createRoleMutation.mutate()} 
              disabled={!newRoleName || createRoleMutation.isPending}
            >
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
