"use client";

import { useState } from "react";
import { useGetBusiness, useUpdateBusiness } from "@/hooks/useBusiness";
import { BusinessCard } from "@/components/business/BusinessCard";
import { MetaConnectionStatus } from "@/components/business/MetaConnectionStatus";
import { GoogleConnectionStatus } from "@/components/business/GoogleConnectionStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BusinessPage() {
  const { data: business, isLoading } = useGetBusiness();
  const updateBusiness = useUpdateBusiness();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
  });

  const handleEdit = () => {
    if (business) {
      setFormData({
        businessName: business.businessName,
        contactPerson: business.contactPerson,
        phone: business.phone,
        email: business.email,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusiness.mutateAsync(formData);
    setIsEditDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-8">
        <div className="text-center text-white">
          <p className="mb-4">No business found. Please complete onboarding first.</p>
          <Button onClick={() => window.location.href = "/onboarding"}>
            Start Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Business Settings</h1>
        <p className="text-white/60">Manage your business information and integrations</p>
      </div>

      <div className="grid gap-6">
        <BusinessCard business={business} onEdit={handleEdit} />
        <MetaConnectionStatus />
        <GoogleConnectionStatus />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Edit Business Information</DialogTitle>
            <DialogDescription>
              Update your business details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-businessName">Business Name</Label>
              <Input
                id="edit-businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contactPerson">Contact Person</Label>
              <Input
                id="edit-contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateBusiness.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                {updateBusiness.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
