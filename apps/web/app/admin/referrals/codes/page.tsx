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
import { Trash2, Edit, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminReferralCodesPage() {
  const [codes, setCodes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    referrerId: "",
    type: "ALIAS",
    isActive: "true",
    rewardType: "FLAT",
    rewardAmount: "0",
    eligiblePlans: [] as string[],
    rewardTrigger: "FIRST_PURCHASE",
    renewalRewardType: "NONE",
    renewalRewardAmount: "0",
    maxUsage: "",
    expiryDate: ""
  });

  useEffect(() => {
    fetchCodes();
    fetchPlans();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data } = await axiosInstance.get("/referrals/admin/codes/all");
      setCodes(data);
    } catch (error) {
      console.error("Failed to fetch codes", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/plans");
      setPlans(data);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  };

  const handleOpenModal = (code: any = null) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        referrerId: code.referrerId,
        type: code.type,
        isActive: code.isActive ? "true" : "false",
        rewardType: code.rewardType || "FLAT",
        rewardAmount: code.rewardAmount?.toString() || "0",
        eligiblePlans: code.eligiblePlans || [],
        rewardTrigger: code.rewardTrigger || "FIRST_PURCHASE",
        renewalRewardType: code.renewalRewardType || "NONE",
        renewalRewardAmount: code.renewalRewardAmount?.toString() || "0",
        maxUsage: code.maxUsage?.toString() || "",
        expiryDate: code.expiryDate ? (new Date(code.expiryDate).toISOString().split('T')[0] ?? "") : ""
      });
    } else {
      setEditingCode(null);
      setFormData({
        code: "",
        referrerId: "",
        type: "ALIAS",
        isActive: "true",
        rewardType: "FLAT",
        rewardAmount: "0",
        eligiblePlans: [],
        rewardTrigger: "FIRST_PURCHASE",
        renewalRewardType: "NONE",
        renewalRewardAmount: "0",
        maxUsage: "",
        expiryDate: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        isActive: formData.isActive === "true",
        rewardAmount: parseFloat(formData.rewardAmount),
        renewalRewardAmount: parseFloat(formData.renewalRewardAmount),
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
      };

      if (editingCode) {
        await axiosInstance.post(`/referrals/admin/codes/${editingCode.id}`, payload);
        toast.success("Code updated");
      } else {
        await axiosInstance.post("/referrals/admin/codes", payload);
        toast.success("Code created");
      }
      setIsModalOpen(false);
      fetchCodes();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axiosInstance.post(`/referrals/admin/codes/${id}/delete`);
      toast.success("Code deleted");
      fetchCodes();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const togglePlan = (planId: string) => {
    setFormData(prev => {
      const plans = prev.eligiblePlans.includes(planId)
        ? prev.eligiblePlans.filter(id => id !== planId)
        : [...prev.eligiblePlans, planId];
      return { ...prev, eligiblePlans: plans };
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Referral Codes</h2>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Create Code
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCode ? "Edit Code" : "Create Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="bg-gray-800 border-gray-700"
                  placeholder="e.g. SUMMER2024"
                />
              </div>
              <div>
                <Label>Referrer ID</Label>
                <Input 
                  value={formData.referrerId} 
                  onChange={(e) => setFormData({...formData, referrerId: e.target.value})}
                  className="bg-gray-800 border-gray-700"
                  placeholder="UUID"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                  <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="ALIAS">Alias</SelectItem>
                    <SelectItem value="CAMPAIGN">Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.isActive} onValueChange={(val) => setFormData({...formData, isActive: val})}>
                  <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <h4 className="mb-2 font-medium">Reward Configuration</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reward Type</Label>
                  <Select value={formData.rewardType} onValueChange={(val) => setFormData({...formData, rewardType: val})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="FLAT">Flat Amount</SelectItem>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reward Amount</Label>
                  <Input 
                    type="number"
                    value={formData.rewardAmount} 
                    onChange={(e) => setFormData({...formData, rewardAmount: e.target.value})}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Eligible Plans</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {plans.map((plan: any) => (
                  <div key={plan.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={plan.id} 
                      checked={formData.eligiblePlans.includes(plan.id)}
                      onCheckedChange={() => togglePlan(plan.id)}
                      className="border-gray-600"
                    />
                    <label htmlFor={plan.id} className="text-sm text-gray-300 cursor-pointer">
                      {plan.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trigger</Label>
                <Select value={formData.rewardTrigger} onValueChange={(val) => setFormData({...formData, rewardTrigger: val})}>
                  <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="FIRST_PURCHASE">First Purchase Only</SelectItem>
                    <SelectItem value="RECURRING">Recurring (Every Payment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input 
                  type="date"
                  value={formData.expiryDate} 
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <h4 className="mb-2 font-medium">Renewal Reward (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.renewalRewardType} onValueChange={(val) => setFormData({...formData, renewalRewardType: val})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="FLAT">Flat Amount</SelectItem>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input 
                    type="number"
                    value={formData.renewalRewardAmount} 
                    onChange={(e) => setFormData({...formData, renewalRewardAmount: e.target.value})}
                    className="bg-gray-800 border-gray-700"
                    disabled={formData.renewalRewardType === "NONE"}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Max Usage Limit</Label>
              <Input 
                type="number"
                value={formData.maxUsage} 
                onChange={(e) => setFormData({...formData, maxUsage: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
              {editingCode ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Active Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Code</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Reward</TableHead>
                <TableHead className="text-gray-400">Trigger</TableHead>
                <TableHead className="text-gray-400">Usage</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">No codes found</TableCell>
                </TableRow>
              ) : (
                codes.map((item: any) => (
                  <TableRow key={item.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="font-mono font-bold">{item.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.rewardType === "FLAT" ? `$${item.rewardAmount}` : `${item.rewardAmount}%`}
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {item.rewardTrigger}
                    </TableCell>
                    <TableCell>{item.usageCount} {item.maxUsage ? `/ ${item.maxUsage}` : ""}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "secondary"} className={item.isActive ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenModal(item)}>
                        <Edit className="h-4 w-4 text-blue-400" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
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
