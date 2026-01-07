"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/users");
      setAdmins(data);
    } catch (error) {
      toast.error("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
        <Button onClick={() => toast.info("Create Admin Modal - To Be Implemented")}>
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Internal Team</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Role</TableHead>
                <TableHead className="text-gray-400">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">No team members found</TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="font-medium">{admin.name || "N/A"}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500">
                        {admin.role}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
