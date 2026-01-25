import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TreesIcon, ArrowRightIcon, HeartIcon, BookOpenIcon, LeafIcon, ImageIcon, BarChart3Icon, CalendarIcon } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Atmospheric Glows */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={36} height={36} />
          <span className="text-lg font-serif font-bold tracking-tight">Family Heritage</span>
        </div>
        <Button variant="ghost" className="font-medium" asChild>
          <Link href="/tree">Explore Family Tree <ArrowRightIcon className="ml-2 size-4" /></Link>
        </Button>
      </nav>

      <main className="relative z-10 container mx-auto px-6 pt-12 pb-24">

        {/* Hero Section - Storytelling Focus */}
        <section className="max-w-4xl mx-auto text-center space-y-12 mb-32">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight leading-loose text-foreground">
              Deep Roots,<br />
              <span className="text-primary/80 italic">Boundless Branches</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <span className="h-px w-12 bg-border" />
              <p className="font-medium uppercase tracking-widest text-sm">Every Family's Legacy</p>
              <span className="h-px w-12 bg-border" />
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground leading-relaxed">
            <p>
              In every corner of the world, under the same vast sky, a small seed is planted with hope.
              That seed is the bond between people. From that seed grows a majestic tree we call <strong>family</strong>.
            </p>
          </div>

          <div className="py-8">
            <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-card/50 border shadow-lg backdrop-blur-sm">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Our Collective Heritage</p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                Connecting Generations Past, Present, and Future
              </h2>
              <div className="flex flex-col gap-4 items-center">
                <Button size="lg" className="rounded-full px-8 mt-4" asChild>
                  <Link href="/tree">
                    Discover Our Lineage
                  </Link>
                </Button>
                <div className="text-sm text-balance max-w-sm mt-2">
                  <p>We invite you to contribute your story and help us complete this living archive.</p>
                  <p className="mt-2 text-muted-foreground">
                    Interested in this platform? Contact the developer at{" "}
                    <a href="https://disyfa.space" target="_blank" className="text-primary hover:underline font-semibold">
                      disyfa.space
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Features */}
        <section className="max-w-4xl mx-auto mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/gallery" className="block group">
              <Card className="bg-card border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ImageIcon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Photo Gallery</h3>
                    <p className="text-xs text-muted-foreground mt-1">Faces of Family</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/statistics" className="block group">
              <Card className="bg-card border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <BarChart3Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Statistics</h3>
                    <p className="text-xs text-muted-foreground mt-1">Facts & Figures</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/calendar" className="block group">
              <Card className="bg-card border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <CalendarIcon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Calendar</h3>
                    <p className="text-xs text-muted-foreground mt-1">Events & Remembrance</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/calculator" className="block group">
              <Card className="bg-card border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <HeartIcon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Relationships</h3>
                    <p className="text-xs text-muted-foreground mt-1">Find Connections</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Story Chapters */}
        <div className="max-w-3xl mx-auto space-y-24">

          {/* Chapter 1 */}
          <section className="space-y-6 pl-8 border-l-2 border-primary/20 relative">
            <div className="absolute -left-[9px] top-0 bg-background p-1">
              <div className="size-2 rounded-full bg-primary" />
            </div>
            <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
              <LeafIcon className="size-5 text-primary" />
              Where Every Journey Begins
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The tree grows with patience, watered by laughter and tears, nurtured by hard work and dreams.
              Each branch that emerges is a new beginning: the birth of a child, a heartfelt union,
              a departure that leaves a mark on our hearts. Its leaves are memories—photos in old albums,
              handwritten notes, and traditions passed down through time.
            </p>
          </section>

          {/* Chapter 2 */}
          <section className="space-y-6 pl-8 border-l-2 border-primary/20 relative">
            <div className="absolute -left-[9px] top-0 bg-background p-1">
              <div className="size-2 rounded-full bg-primary/40" />
            </div>
            <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
              <ArrowRightIcon className="size-5 text-primary" />
              As the Branches Expand
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Time marches on. Children grow, choosing their own paths across the globe. They carry with them roots
              from the original tree, planting them in new soils. But along the way, we often stop and wonder:
              <span className="italic block mt-4 pl-4 border-l border-muted text-foreground/80">"What were our ancestors' names? What stories lie behind these faces in the photographs?"</span>
            </p>
          </section>

          {/* Chapter 3 */}
          <section className="space-y-6 pl-8 border-l-2 border-primary/20 relative">
            <div className="absolute -left-[9px] top-0 bg-background p-1">
              <div className="size-2 rounded-full bg-primary/40" />
            </div>
            <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
              <BookOpenIcon className="size-5 text-primary" />
              Connecting the Generations
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A family tree is more than just diagrams and lines. It is an emotional map,
              a time capsule of our collective heritage, and a bridge that connects our past with our future.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <Link href="/gallery" className="block group">
                <Card className="bg-muted/30 border-none shadow-none hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 group-hover:text-primary transition-colors">
                      <ImageIcon className="size-4" /> Family Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    A collection of photos and preserved memories of our family members.
                  </CardContent>
                </Card>
              </Link>
              <Link href="/statistics" className="block group">
                <Card className="bg-muted/30 border-none shadow-none hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 group-hover:text-primary transition-colors">
                      <BarChart3Icon className="size-4" /> Statistics & Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Insights into our family demographics, age distribution, and more.
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* Closing */}
          <section className="text-center space-y-8 pt-12">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <HeartIcon className="size-8 text-primary fill-primary/20" />
            </div>
            <h3 className="text-3xl font-serif font-bold">Start Writing Your Chapter</h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Our families are the only legacy that truly lasts forever. They are the roots that keep us grounded.
              Let's celebrate these connections together.
            </p>
            <Button size="lg" className="rounded-full h-12 px-8" asChild>
              <Link href="/tree">
                Explore the Family Tree
              </Link>
            </Button>
          </section>

        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2026 Collective Family Heritage Archive</p>
      </footer>
    </div>
  )
}
