"use client";

import { useWorkspaces } from "@/hooks/use-workspaces";
import { Loader2, Plus, Search, Pin, EyeOff, Instagram, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function DashboardPage() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const currentWorkspace = workspaces?.[0];
  const channels = currentWorkspace?.channels || [];

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'INSTAGRAM': return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'WHATSAPP': return <MessageCircle className="w-5 h-5 text-green-600" />;
      case 'EMAIL': return <Mail className="w-5 h-5 text-blue-600" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Tabs defaultValue="accounts" className="w-full">
        <div className="flex items-center justify-between mb-8 border-b">
            <TabsList className="bg-transparent h-auto p-0 space-x-8">
            <TabsTrigger 
                value="accounts" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-4 text-base font-medium text-muted-foreground data-[state=active]:text-foreground bg-transparent"
            >
                Accounts
            </TabsTrigger>
            <TabsTrigger 
                value="templates" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-4 text-base font-medium text-muted-foreground data-[state=active]:text-foreground bg-transparent"
            >
                My Templates
            </TabsTrigger>
            <TabsTrigger 
                value="api" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-4 text-base font-medium text-muted-foreground data-[state=active]:text-foreground bg-transparent"
            >
                API Settings
            </TabsTrigger>
            <TabsTrigger 
                value="reports" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-4 text-base font-medium text-muted-foreground data-[state=active]:text-foreground bg-transparent"
            >
                Message reports
            </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="accounts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search" className="pl-10" />
            </div>
            <Link href="/dashboard/connect">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Account
              </Button>
            </Link>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Live Chats</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Pin</TableHead>
                  <TableHead>Hide</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No accounts connected. Click "Add New Account" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  channels.map((channel: any) => (
                    <TableRow key={channel.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                {getChannelIcon(channel.type)}
                            </div>
                            <div className="flex flex-col">
                                <Link href={`/dashboard/${channel.id}/flows`} className="hover:underline font-semibold text-blue-600">
                                    {channel.name}
                                </Link>
                                <span className="text-xs text-muted-foreground capitalize">{channel.type.toLowerCase()}</span>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">FREE</span>
                      </TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Pin className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <EyeOff className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="p-4 text-center text-muted-foreground">My Templates Content</div>
        </TabsContent>
        <TabsContent value="api">
          <div className="p-4 text-center text-muted-foreground">API Settings Content</div>
        </TabsContent>
        <TabsContent value="reports">
          <div className="p-4 text-center text-muted-foreground">Message Reports Content</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
