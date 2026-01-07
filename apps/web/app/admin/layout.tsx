"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAccessToken } from "@/lib/axios";
import { Sidebar } from "lucide-react"; // Placeholder for icon
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
              Team Management
            </Button>
          </Link>
          <Link href="/admin/tenants">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
              Tenants
            </Button>
          </Link>
          <Link href="/admin/packages">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
              Packages
            </Button>
          </Link>
          <Link href="/admin/referrals">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
              Referrals
            </Button>
          </Link>
          <Link href="/admin/referrals/codes">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
              Referral Codes
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => router.push("/admin/login")}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
