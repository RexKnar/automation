import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechFlow",
    content: "AutoFlow has completely transformed how we handle customer support. Our response time dropped by 80% within the first week.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    name: "Michael Chen",
    role: "E-commerce Owner",
    company: "StyleHub",
    content: "The WhatsApp automation features are a game-changer. We've seen a 3x increase in abandoned cart recovery since implementing it.",
    avatar: "https://i.pravatar.cc/150?u=michael",
  },
  {
    name: "Jessica Williams",
    role: "Social Media Manager",
    company: "BuzzCreate",
    content: "Managing 50+ Instagram accounts was a nightmare until AutoFlow. The visual flow builder makes it so easy to set up complex campaigns.",
    avatar: "https://i.pravatar.cc/150?u=jessica",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-white/5">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Trusted by 10,000+ businesses</h2>
          <p className="text-muted-foreground text-lg">
            See what our customers have to say about their experience with AutoFlow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
