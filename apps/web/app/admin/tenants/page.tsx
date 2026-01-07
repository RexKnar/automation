"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { Loader2, Power, PowerOff, Calendar as CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Filters
  const [regDateRange, setRegDateRange] = useState<DateRange | undefined>();
  const [renewDateRange, setRenewDateRange] = useState<DateRange | undefined>();
  const [selectedPlan, setSelectedPlan] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tenantsRes, plansRes] = await Promise.all([
        axiosInstance.get("/admin/tenants"),
        axiosInstance.get("/admin/plans"),
      ]);
      setTenants(tenantsRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setProcessing(id);
    try {
      await axiosInstance.post(`/admin/tenants/${id}/toggle`);
      setTenants(tenants.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
      toast.success(`Tenant ${!currentStatus ? 'activated' : 'suspended'}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setProcessing(null);
    }
  };

  const updatePlan = async (id: string, planId: string) => {
    setProcessing(id);
    try {
      await axiosInstance.post(`/admin/tenants/${id}/plan`, { planId });
      setTenants(tenants.map(t => t.id === id ? { ...t, planId, currentPlan: plans.find(p => p.id === planId) } : t));
      toast.success("Plan updated successfully");
    } catch (error) {
      toast.error("Failed to update plan");
    } finally {
      setProcessing(null);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    // Plan Filter
    if (selectedPlan !== "all" && tenant.planId !== selectedPlan) return false;

    // Registered Date Filter
    if (regDateRange?.from) {
      const regDate = new Date(tenant.createdAt);
      if (regDate < regDateRange.from) return false;
      if (regDateRange.to && regDate > regDateRange.to) return false;
    }

    // Renewal Date Filter
    if (renewDateRange?.from) {
      const lastPayment = tenant.payments?.[0];
      const lastPaymentDate = lastPayment ? new Date(lastPayment.createdAt) : null;
      const renewalDate = lastPaymentDate ? new Date(lastPaymentDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
      
      if (!renewalDate) return false; // Or true if we want to show N/A? Assuming filter implies existence.
      if (renewalDate < renewDateRange.from) return false;
      if (renewDateRange.to && renewalDate > renewDateRange.to) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Tenant Management</h2>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Registered Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Registered Date</label>
          <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-900 border-gray-800 text-white hover:bg-gray-800",
                  !regDateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {regDateRange?.from ? (
                  regDateRange.to ? (
                    <>
                      {format(regDateRange.from, "LLL dd, y")} -{" "}
                      {format(regDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(regDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={regDateRange?.from}
                selected={regDateRange}
                onSelect={setRegDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {regDateRange && <Button variant="ghost" size="icon" onClick={() => setRegDateRange(undefined)}><X className="h-4 w-4" /></Button>}
          </div>
        </div>

        {/* Renewal Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Renewal Date</label>
          <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="renew-date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-900 border-gray-800 text-white hover:bg-gray-800",
                  !renewDateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {renewDateRange?.from ? (
                  renewDateRange.to ? (
                    <>
                      {format(renewDateRange.from, "LLL dd, y")} -{" "}
                      {format(renewDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(renewDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={renewDateRange?.from}
                selected={renewDateRange}
                onSelect={setRenewDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {renewDateRange && <Button variant="ghost" size="icon" onClick={() => setRenewDateRange(undefined)}><X className="h-4 w-4" /></Button>}
          </div>
        </div>

        {/* Package Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Package</label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger className="w-full bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Filter by Package" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all">All Packages</SelectItem>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Workspaces ({filteredTenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Members</TableHead>
                <TableHead className="text-gray-400">Contacts</TableHead>
                <TableHead className="text-gray-400">Channels</TableHead>
                <TableHead className="text-gray-400">Last Payment</TableHead>
                <TableHead className="text-gray-400">Renewal</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-400">No tenants found matching filters</TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => {
                  const instaCount = tenant.channels?.filter((c: any) => c.type === 'INSTAGRAM').length || 0;
                  const waCount = tenant.channels?.filter((c: any) => c.type === 'WHATSAPP').length || 0;
                  const emailCount = tenant.channels?.filter((c: any) => c.type === 'EMAIL').length || 0;
                  
                  const lastPayment = tenant.payments?.[0];
                  const lastPaymentDate = lastPayment ? new Date(lastPayment.createdAt) : null;
                  const renewalDate = lastPaymentDate ? new Date(lastPaymentDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;

                  return (
                  <TableRow key={tenant.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="font-medium">
                      <div>{tenant.name}</div>
                      <div className="text-xs text-gray-500">{tenant.slug}</div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={tenant.planId} 
                        onValueChange={(val) => updatePlan(tenant.id, val)}
                        disabled={processing === tenant.id}
                      >
                        <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 h-8">
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} {plan.isCustom ? '(Custom)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{tenant._count?.members || 0}</TableCell>
                    <TableCell>{tenant._count?.contacts || 0}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2 text-xs">
                        <span title="Instagram" className="flex items-center"><span className="w-2 h-2 rounded-full bg-pink-500 mr-1"></span>{instaCount}</span>
                        <span title="WhatsApp" className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>{waCount}</span>
                        <span title="Email" className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>{emailCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {lastPaymentDate ? lastPaymentDate.toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {renewalDate ? renewalDate.toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenant.isActive ? "default" : "destructive"} className={tenant.isActive ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}>
                        {tenant.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(tenant.id, tenant.isActive)}
                        disabled={processing === tenant.id}
                        className={tenant.isActive ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" : "text-green-400 hover:text-green-300 hover:bg-green-900/20"}
                      >
                        {processing === tenant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : tenant.isActive ? (
                          <><PowerOff className="h-4 w-4 mr-2" /> Suspend</>
                        ) : (
                          <><Power className="h-4 w-4 mr-2" /> Activate</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
