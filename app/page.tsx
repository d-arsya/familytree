import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TreesIcon, UsersIcon, SparklesIcon, ShieldCheckIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Glassmorphism background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreesIcon className="size-8 text-primary" />
            <span className="text-xl font-bold">Family Tree</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/tree">Lihat Pohon</Link>
            </Button>
            <Button asChild>
              <Link href="/tree">Mulai</Link>
            </Button>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Jelajahi{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Sejarah Keluarga
              </span>{" "}
              Anda
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Platform silsilah keluarga modern yang dinamis dan kolaboratif.
              Bangun, jelajahi, dan bagikan warisan keluarga dengan cara yang
              indah dan intuitif.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/tree">
                  <TreesIcon className="mr-2 size-5" />
                  Mulai Jelajahi
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Didesain untuk genealogi modern dengan antarmuka yang intuitif dan
              teknologi terkini.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TreesIcon className="size-6 text-primary" />
                </div>
                <CardTitle>Visualisasi Interaktif</CardTitle>
                <CardDescription>
                  Pohon keluarga yang dapat di-zoom dan di-pan dengan mulus di
                  semua perangkat.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <UsersIcon className="size-6 text-primary" />
                </div>
                <CardTitle>Multi-Pasangan</CardTitle>
                <CardDescription>
                  Mendukung struktur keluarga kompleks termasuk blended family
                  dan multi-pasangan.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <SparklesIcon className="size-6 text-primary" />
                </div>
                <CardTitle>Desain Modern</CardTitle>
                <CardDescription>
                  Antarmuka minimalis dengan glassmorphism dan dark mode
                  adaptif.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="size-6 text-primary" />
                </div>
                <CardTitle>Privasi Terjaga</CardTitle>
                <CardDescription>
                  Data keluarga Anda aman dengan enkripsi dan kontrol akses yang
                  ketat.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="glass-strong max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Siap Memulai Perjalanan Silsilah Anda?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Buat pohon keluarga pertama Anda sekarang dan mulai
                  dokumentasikan warisan keluarga untuk generasi mendatang.
                </p>
                <Button size="lg" asChild>
                  <Link href="/tree">
                    <TreesIcon className="mr-2 size-5" />
                    Buat Pohon Keluarga
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TreesIcon className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Modern Family Tree
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Modern Family Tree. Dibuat dengan ❤️ untuk keluarga.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
