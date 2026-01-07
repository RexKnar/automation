"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { BillingSettings } from "@/components/settings/billing-settings";
import { TeamSettings } from "@/components/settings/team-settings";
import { RolesSettings } from "@/components/settings/roles-settings";
import { useUser } from "@/hooks/use-user";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();

  const currentWorkspace = workspaces?.[0]; // Assuming single workspace for now or context-aware

  if (isUserLoading || isWorkspacesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing & Plans</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
            <ProfileSettings user={user} />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Password & Security</h2>
            <SecuritySettings />
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Manage Subscription</h2>
            {currentWorkspace ? (
              <BillingSettings
                workspaceId={currentWorkspace.id}
                currentPlan={currentWorkspace.plan}
              />
            ) : (
              <p>No workspace found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Team Management</h2>
            {currentWorkspace ? (
              <TeamSettings workspaceId={currentWorkspace.id} />
            ) : (
              <p>No workspace found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Roles & Permissions</h2>
            {currentWorkspace ? (
              <RolesSettings workspaceId={currentWorkspace.id} />
            ) : (
              <p>No workspace found.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
