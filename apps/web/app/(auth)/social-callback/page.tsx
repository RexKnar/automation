"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function SocialCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get("token")
        if (token) {
            // Store token securely (e.g., in a cookie or let the backend handle the cookie and just redirect)
            // Since the backend sets the Refresh cookie, we might just need to store the Access token?
            // Or if the app relies on state management for access token.

            // Assuming context or usage of cookies. If the backend set cookies, we might not need to do anything but redirect.
            // But usually we need to put the AT in memory/context.
            // For now, let's just redirect to dashboard, assuming the app deals with the session.
            // If the dashboard needs the AT, we might need to verify session first.

            // A common pattern:
            localStorage.setItem("accessToken", token)
            router.push("/dashboard")
        } else {
            router.push("/login?error=SocialAuthFailed")
        }
    }, [searchParams, router])

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Authenticating...</p>
            </div>
        </div>
    )
}
