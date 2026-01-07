"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Ban, Edit, Plus } from "lucide-react";

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<any>(null);
  const [formData, setFormData] = useState({
    referrerId: "",
    refereeId: "",
    code: "",
    status: "PENDING",
    rewardStatus: "PENDING"
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data } = await axiosInstance.get("/referrals/admin/all");
      setReferrals(data);
    } catch (error) {
      console.error("Failed to fetch referrals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (referral: any = null) => {
    if (referral) {
      setEditingReferral(referral);
      setFormData({
        referrerId: referral.referrerId,
        refereeId: referral.refereeId,
        code: referral.code,
        status: referral.status,
        rewardStatus: referral.rewardStatus
      });
    } else {
      setEditingReferral(null);
      setFormData({
        referrerId: "",
        refereeId: "",
        code: "",
        status: "PENDING",
        rewardStatus: "PENDING"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingReferral) {
        await axiosInstance.post(`/referrals/admin/${editingReferral.id}`, formData);
        toast.success("Referral updated");
      } else {
        await axiosInstance.post("/referrals/admin", formData);
        toast.success("Referral created");
      }
      setIsModalOpen(false);
      fetchReferrals();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axiosInstance.post(`/referrals/admin/${id}/delete`);
      toast.success("Referral deleted");
      fetchReferrals();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await axiosInstance.post(`/referrals/admin/${id}/suspend`);
      toast.success("Referral suspended");
      fetchReferrals();
    } catch (error) {
      toast.error("Suspend failed");
    }
  };

  const handlePayout = async (id: string) => {
    try {
      await axiosInstance.post(`/admin/referrals/${id}/payout`);
      toast.success("Payout marked as complete");
      fetchReferrals();
    } catch (error) {
      toast.error("Failed to process payout");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Referral Management</h2>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Referral
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingReferral ? "Edit Referral" : "Add Referral"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Referrer ID</Label>
              <Input 
                value={formData.referrerId} 
                onChange={(e) => setFormData({...formData, referrerId: e.target.value})}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <Label>Referee ID</Label>
              <Input 
                value={formData.refereeId} 
                onChange={(e) => setFormData({...formData, refereeId: e.target.value})}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reward Status</Label>
              <Select 
                value={formData.rewardStatus} 
                onValueChange={(val) => setFormData({...formData, rewardStatus: val})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
              {editingReferral ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>All Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Referrer</TableHead>
                <TableHead className="text-gray-400">Referee</TableHead>
                <TableHead className="text-gray-400">Code</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Reward</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : referrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">No referrals found</TableCell>
                </TableRow>
              ) : (
                referrals.map((item: any) => (
                  <TableRow key={item.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{item.referrerId}</TableCell>
                    <TableCell>{item.refereeId}</TableCell>
                    <TableCell className="font-mono text-xs">{item.code}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "COMPLETED" ? "default" : item.status === "SUSPENDED" ? "destructive" : "secondary"} className={item.status === "COMPLETED" ? "bg-green-500/10 text-green-500" : item.status === "SUSPENDED" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.rewardStatus === "PAID" ? "default" : "outline"} className={item.rewardStatus === "PAID" ? "bg-green-500/10 text-green-500" : ""}>
                        {item.rewardStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenModal(item)}>
                        <Edit className="h-4 w-4 text-blue-400" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleSuspend(item.id)}>
                        <Ban className="h-4 w-4 text-orange-400" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                      {item.status === "COMPLETED" && item.rewardStatus !== "PAID" && (
                        <Button size="sm" variant="outline" onClick={() => handlePayout(item.id)}>
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
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
