"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateBusiness } from "@/hooks/useBusiness";

interface BusinessDetailsStepProps {
  onNext: () => void;
}

export function BusinessDetailsStep({ onNext }: BusinessDetailsStepProps) {
  const [formData, setFormData] = useState({
    businessName: "",
    businessCategory: "",
    businessAddress: "",
    phone: "",
    email: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });

  const createBusiness = useCreateBusiness();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBusiness.mutateAsync(formData);
      onNext();
    } catch (error) {
      console.error("Failed to create business:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/50 border-white/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Business Details</CardTitle>
        <CardDescription>
          Tell us about your business to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Acme Inc."
                className="bg-white/5 border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessCategory">Business Category</Label>
              <Input
                id="businessCategory"
                value={formData.businessCategory}
                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                placeholder="Retail, Education, etc."
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <Input
                id="businessAddress"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                placeholder="123 Main St, City, Country"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="bg-white/5 border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Business Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@acme.com"
                className="bg-white/5 border-white/10"
                required
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Contact Person Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person Name *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Person Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="john@acme.com"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Person Mobile</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+1 987 654 3210"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
          </div>

          {createBusiness.error && (
            <div className="text-red-500 text-sm">
              {createBusiness.error.message || "Failed to create business"}
            </div>
          )}

          <Button
            type="submit"
            disabled={createBusiness.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 mt-6"
          >
            {createBusiness.isPending ? "Saving..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
