import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, DollarSign, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

export function ReferralDashboard() {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, earnings: 0 });
  const [history, setHistory] = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [statsRes, historyRes, userRes] = await Promise.all([
        axiosInstance.get("/referrals/stats"),
        axiosInstance.get("/referrals/history"),
        axiosInstance.get("/users/me"),
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data);
      setReferralCode(userRes.data.referralCode || "Generating...");
    } catch (error) {
      console.error("Failed to fetch referral data", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://app.example.com/signup?ref=${referralCode}`);
    toast.success("Referral link copied!");
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Referral Program</h2>
        <p className="text-gray-400">Invite friends and earn rewards.</p>
      </div>

      {/* Referral Link Section */}
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              readOnly 
              value={`https://app.example.com/signup?ref=${referralCode}`} 
              className="bg-gray-800 border-gray-700 text-gray-300"
            />
            <Button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700">
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.earnings}</div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Referee</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">No referrals yet</TableCell>
                </TableRow>
              ) : (
                history.map((item: any) => (
                  <TableRow key={item.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>User #{item.refereeId.substring(0, 8)}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "COMPLETED" ? "default" : "secondary"} className={item.status === "COMPLETED" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.rewardStatus === "PAID" ? "default" : "outline"} className={item.rewardStatus === "PAID" ? "bg-green-500/10 text-green-500" : ""}>
                        {item.rewardStatus}
                      </Badge>
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
