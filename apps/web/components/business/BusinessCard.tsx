"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, User } from "lucide-react";

interface BusinessCardProps {
  business: {
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    isOnboarded: boolean;
  };
  onEdit: () => void;
}

export function BusinessCard({ business, onEdit }: BusinessCardProps) {
  return (
    <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Your business details and contact information</CardDescription>
          </div>
          <Button onClick={onEdit} variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Business Name</div>
            <div className="font-medium">{business.businessName}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Contact Person</div>
            <div className="font-medium">{business.contactPerson}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Phone</div>
            <div className="font-medium">{business.phone}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{business.email}</div>
          </div>
        </div>

        {business.isOnboarded && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <span className="text-xl">✓</span>
              <span>Onboarding Complete</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
