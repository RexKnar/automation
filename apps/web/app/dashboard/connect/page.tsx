"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Instagram, MessageCircle, Facebook, Send } from "lucide-react";

const channels = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Supercharge your social media marketing with Instagram Automation.",
    icon: Instagram,
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
    href: "/dashboard/connect/instagram",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Elevate your marketing with TikTok's seamless automation.",
    icon: ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    color: "text-black dark:text-white",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    href: "#", // Placeholder
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Choose the most popular mobile messaging app in the world and reach 2 billion users.",
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    href: "#", // Placeholder
  },
  {
    id: "messenger",
    name: "Facebook Messenger",
    description: "Create Facebook Messenger automation to keep customers happy.",
    icon: Facebook,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    href: "#", // Placeholder
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Power up your business with Telegram automation.",
    icon: Send,
    color: "text-sky-500",
    bgColor: "bg-sky-100 dark:bg-sky-900/20",
    href: "#", // Placeholder
  },
];

export default function ConnectPage() {
  const router = useRouter();

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
      {/* Left Side - Illustration */}
      <div className="w-1/2 p-12 flex flex-col justify-center border-r dark:border-gray-800">
        <div className="max-w-md mx-auto">
          <div className="relative w-64 h-64 mb-8">
            <Image
              src="/images/dashboard-no-channel.png" // Reusing the toaster for now as per the "Where would you like to start" image
              alt="Start Automation"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Where would you like to start?
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Don&apos;t worry, you can connect other channels later.
          </p>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            &lt; Back
          </button>
        </div>
      </div>

      {/* Right Side - Channel Options */}
      <div className="w-1/2 p-12 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          {channels.map((channel) => (
            <Card
              key={channel.id}
              className="p-6 cursor-pointer hover:shadow-md transition-shadow border-gray-200 dark:border-gray-800"
              onClick={() => router.push(channel.href)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${channel.bgColor}`}>
                  <channel.icon className={`w-8 h-8 ${channel.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {channel.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {channel.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
