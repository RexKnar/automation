import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            New: WhatsApp Business API Integration
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Automate Your World. <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Intelligently.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The all-in-one automation platform for Instagram and WhatsApp. 
            Scale your business with AI-powered chatbots, automated workflows, and smart analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0 shadow-lg shadow-blue-500/25">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
              View Demo
            </Button>
          </div>

          {/* Abstract Dashboard Preview */}
          <div className="mt-16 relative w-full max-w-5xl mx-auto aspect-[16/9] rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            
            {/* Mock UI Elements */}
            <div className="absolute top-4 left-4 right-4 h-8 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            
            <div className="absolute top-16 left-4 bottom-4 w-64 rounded-lg border border-white/5 bg-white/5 p-4 flex flex-col gap-4">
               <div className="h-8 w-full rounded bg-white/10 animate-pulse" />
               <div className="h-4 w-3/4 rounded bg-white/5" />
               <div className="h-4 w-1/2 rounded bg-white/5" />
               <div className="mt-auto h-12 w-full rounded bg-blue-500/20" />
            </div>

            <div className="absolute top-16 left-72 right-4 bottom-4 flex flex-col gap-4">
              <div className="flex gap-4 h-32">
                 <div className="flex-1 rounded-lg border border-white/5 bg-white/5 p-4 relative overflow-hidden">
                    <Zap className="absolute top-4 right-4 text-yellow-400/50 h-6 w-6" />
                    <div className="text-2xl font-bold text-white mb-1">24.5k</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                 </div>
                 <div className="flex-1 rounded-lg border border-white/5 bg-white/5 p-4">
                    <div className="text-2xl font-bold text-white mb-1">98.2%</div>
                    <div className="text-sm text-muted-foreground">Automation Rate</div>
                 </div>
                 <div className="flex-1 rounded-lg border border-white/5 bg-white/5 p-4">
                    <div className="text-2xl font-bold text-white mb-1">1.2M+</div>
                    <div className="text-sm text-muted-foreground">Messages Sent</div>
                 </div>
              </div>
              <div className="flex-1 rounded-lg border border-white/5 bg-white/5 p-4 flex items-center justify-center">
                 <div className="text-muted-foreground">Interactive Workflow Builder Visualization</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
