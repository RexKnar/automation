"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { data: user, isLoading: isAuthLoading } = useUser();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const { data } = await axiosInstance.get(`/invitations/verify?token=${token}`);
        
        // If user is logged in, check if email matches
        if (user && user.email !== data.email) {
            setError("404 Not Found"); // As requested by user
            setLoading(false);
            return;
        }

        setInvitation(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to verify invitation");
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthLoading) {
        verifyToken();
    }
  }, [token, user, isAuthLoading]);

  const handleAccept = async () => {
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(`/invite?token=${token}`)}`);
      return;
    }

    setAccepting(true);
    try {
      await axiosInstance.post("/invitations/accept", { token });
      toast.success("Invitation accepted! Redirecting...");
      router.push(`/dashboard`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            You have been invited to join <strong>{invitation?.workspace?.name}</strong> as a <strong>{invitation?.role?.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
            <p className="text-sm text-muted-foreground">
              Please log in or sign up to accept this invitation.
            </p>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {user.name?.[0] || "U"}
              </div>
              <div>
                <p className="font-medium">Logged in as {user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAccept} 
            className="w-full" 
            disabled={accepting}
          >
            {accepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? "Accept Invitation" : "Login to Accept"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
