import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, MessageCircle, BarChart3, Users, Bot, Zap } from "lucide-react"

const features = [
  {
    title: "Instagram Automation",
    description: "Auto-reply to comments, DMs, and story mentions. Grow your followers organically.",
    icon: Instagram,
    color: "text-pink-500",
    gradient: "from-pink-500/20 to-purple-500/20",
  },
  {
    title: "WhatsApp Business",
    description: "Send broadcast messages, automate support, and recover abandoned carts.",
    icon: MessageCircle,
    color: "text-green-500",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Smart Analytics",
    description: "Track performance, user engagement, and conversion rates in real-time.",
    icon: BarChart3,
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Audience Segmentation",
    description: "Tag and segment users based on their behavior and interactions.",
    icon: Users,
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    title: "AI Chatbots",
    description: "Train AI on your data to answer customer queries 24/7 instantly.",
    icon: Bot,
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-indigo-500/20",
  },
  {
    title: "Visual Flow Builder",
    description: "Create complex automation flows with a simple drag-and-drop interface.",
    icon: Zap,
    color: "text-yellow-500",
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to scale</h2>
          <p className="text-muted-foreground text-lg">
            Powerful tools to automate your marketing, sales, and support across all channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
