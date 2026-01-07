"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function PackageManagementPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    prices: "{}",
    limits: "{}",
    features: "{}",
    isCustom: false,
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/plans");
      setPlans(data);
    } catch (error) {
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        slug: plan.slug,
        prices: JSON.stringify(plan.prices || {}, null, 2),
        limits: JSON.stringify(plan.limits, null, 2),
        features: JSON.stringify(plan.features, null, 2),
        isCustom: plan.isCustom,
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        slug: "",
        prices: "{\n  \"USD\": 0,\n  \"INR\": 0\n}",
        limits: "{\n  \"members\": 5,\n  \"contacts\": 1000\n}",
        features: "{\n  \"automation\": true\n}",
        isCustom: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const payload = {
        ...formData,
        prices: JSON.parse(formData.prices),
        limits: JSON.parse(formData.limits),
        features: JSON.parse(formData.features),
      };

      if (editingPlan) {
        await axiosInstance.post(`/admin/plans/${editingPlan.id}`, payload);
        toast.success("Plan updated");
      } else {
        await axiosInstance.post("/admin/plans", payload);
        toast.success("Plan created");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save plan. Check JSON format.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await axiosInstance.post(`/admin/plans/${id}/delete`);
      toast.success("Plan deleted");
      fetchPlans();
    } catch (error) {
      toast.error("Failed to delete plan");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Package Management</h2>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Create Package
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Slug</TableHead>
                <TableHead className="text-gray-400">Prices</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">No plans found</TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="text-gray-500">{plan.slug}</TableCell>
                    <TableCell>
                      {Object.entries(plan.prices || {}).map(([currency, amount]: [string, any]) => (
                        <div key={currency} className="text-xs">
                          {currency}: {amount}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {plan.isCustom ? <Badge variant="secondary">Custom</Badge> : <Badge variant="outline">Standard</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? "default" : "destructive"} className={plan.isActive ? "bg-green-500/10 text-green-500" : ""}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(plan)}>
                          <Pencil className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Package" : "Create Package"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="bg-gray-800 border-gray-700" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                  className="bg-gray-800 border-gray-700" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prices (JSON)</Label>
              <Textarea 
                value={formData.prices} 
                onChange={(e) => setFormData({...formData, prices: e.target.value})} 
                className="bg-gray-800 border-gray-700 font-mono text-xs" 
                rows={3}
                placeholder='{ "USD": 10, "INR": 800 }'
              />
              <p className="text-xs text-gray-500">Format: {"{ \"USD\": 10, \"INR\": 800 }"}</p>
            </div>

            <div className="space-y-2">
              <Label>Limits (JSON)</Label>
              <Textarea 
                value={formData.limits} 
                onChange={(e) => setFormData({...formData, limits: e.target.value})} 
                className="bg-gray-800 border-gray-700 font-mono text-xs" 
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Features (JSON)</Label>
              <Textarea 
                value={formData.features} 
                onChange={(e) => setFormData({...formData, features: e.target.value})} 
                className="bg-gray-800 border-gray-700 font-mono text-xs" 
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.isCustom} 
                  onCheckedChange={(checked) => setFormData({...formData, isCustom: checked})} 
                />
                <Label>Custom Plan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} 
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPlan ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
