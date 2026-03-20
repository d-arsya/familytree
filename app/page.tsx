import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TreesIcon, ArrowRightIcon, HeartIcon, BookOpenIcon, LeafIcon, ImageIcon, BarChart3Icon, CalendarIcon } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Atmospheric Glows */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-primary/10 p-1.5 sm:p-2 rounded-xl">
            <TreesIcon className="size-5 sm:size-6 text-primary" />
          </div>
          <span className="text-base sm:text-lg font-serif font-bold tracking-tight whitespace-nowrap">Keluarga Besar</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="font-medium h-9 sm:h-10 px-2 sm:px-4" asChild>
            <Link href="/tree" className="flex items-center">
              <span className="hidden sm:inline">Buka Pohon Keluarga</span>
              <span className="sm:hidden">Pohon</span>
              <ArrowRightIcon className="ml-1 sm:ml-2 size-3 sm:size-4" />
            </Link>
          </Button>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 pt-12 pb-24">

        {/* Hero Section - Storytelling Focus */}
        <section className="max-w-4xl mx-auto text-center space-y-12 mb-32">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight leading-loose text-foreground">
              Akar yang Kuat,<br />
              <span className="text-primary/80 italic">Cabang yang Membentang</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <span className="h-px w-12 bg-border" />
              <p className="font-medium uppercase tracking-widest text-sm">Kisah Setiap Keluarga</p>
              <span className="h-px w-12 bg-border" />
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground leading-relaxed">
            <p>
              Di setiap sudut dunia, di bawah langit yang sama, ada sebuah benih kecil yang ditanam dengan penuh harap.
              Benih itu adalah cinta dua insan. Dari benih itu, tumbuhlah sebuah pohon kecil yang kami sebut <strong>keluarga</strong>.
            </p>
          </div>

          <div className="py-8">
            <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl bg-card/50 border shadow-lg backdrop-blur-sm">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Keluarga Besar</p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                Haji Abdul Salam (Jokariyo) & Siti Khodijah (Kadikem)
              </h2>
              <Button size="lg" className="rounded-full px-8 mt-4" asChild>
                <Link href="/tree">
                  Jelajahi Silsilah
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Access Features - Moved Up for Visibility */}
        <section className="max-w-4xl mx-auto mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/gallery" className="block group">
              <Card className="bg-card border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ImageIcon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Galeri Foto</h3>
                    <p className="text-xs text-muted-foreground mt-1">Wajah Keluarga</p>
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
                    <h3 className="font-bold">Statistik</h3>
                    <p className="text-xs text-muted-foreground mt-1">Data & Fakta</p>
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
                    <h3 className="font-bold">Kalender</h3>
                    <p className="text-xs text-muted-foreground mt-1">Ultah & Haul</p>
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
                    <h3 className="font-bold">Hubungan</h3>
                    <p className="text-xs text-muted-foreground mt-1">Cek Relasi</p>
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
              Di Mana Semua Cerita Bermula
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pohon itu tumbuh dengan sabar, disirami tawa dan air mata, dipupuk dengan kerja keras dan doa.
              Setiap cabang yang muncul adalah sebuah cerita baru: kelahiran seorang anak, pernikahan yang penuh haru,
              kepergian yang mengharu-biru. Daun-daunnya adalah kenangan—foto di album tua, surat cinta yang mulai menguning,
              resep warisan yang hanya ditulis di ingatan.
            </p>
          </section>

          {/* Chapter 2 */}
          <section className="space-y-6 pl-8 border-l-2 border-primary/20 relative">
            <div className="absolute -left-[9px] top-0 bg-background p-1">
              <div className="size-2 rounded-full bg-primary/40" />
            </div>
            <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
              <ArrowRightIcon className="size-5 text-primary" />
              Ketika Cabang Mulai Menyebar
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Waktu bergulir. Anak-anak tumbuh, memilih jalan masing-masing. Mereka membawa serta benih
              dari pohon induk, menanamnya di tanah baru. Tapi suatu hari, kita mulai bertanya:
              <span className="italic block mt-4 pl-4 border-l border-muted text-foreground/80">"Siapa nama buyut dari pihak ibu? Bagaimana cerita nenek bertemu kakek dulu?"</span>
            </p>
          </section>

          {/* Chapter 3 */}
          <section className="space-y-6 pl-8 border-l-2 border-primary/20 relative">
            <div className="absolute -left-[9px] top-0 bg-background p-1">
              <div className="size-2 rounded-full bg-primary/40" />
            </div>
            <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
              <BookOpenIcon className="size-5 text-primary" />
              Mimpi untuk Menyambung Generasi
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pohon keluarga bukan sekadar diagram dengan kotak dan garis. Ia adalah peta emosional,
              kapsul waktu yang menyimpan warisan, dan jembatan yang menghubungkan masa lalu dengan masa depan.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <Link href="/gallery" className="block group">
                <Card className="bg-muted/30 border-none shadow-none hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 group-hover:text-primary transition-colors">
                      <ImageIcon className="size-4" /> Galeri Keluarga
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Kumpulan foto dan kenangan wajah-wajah anggota keluarga besar.
                  </CardContent>
                </Card>
              </Link>
              <Link href="/statistics" className="block group">
                <Card className="bg-muted/30 border-none shadow-none hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 group-hover:text-primary transition-colors">
                      <BarChart3Icon className="size-4" /> Statistik & Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Analisis data keluarga, sebaran usia, dan statistik menarik lainnya.
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
            <h3 className="text-3xl font-serif font-bold">Mari Mulai Menulis Bab Baru</h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Keluarga adalah satu-satunya warisan yang benar-benar abadi. Mereka adalah akar yang membuat kita berdiri tegak.
              Mari rayakan hubungan hati ini bersama.
            </p>
            <Button size="lg" className="rounded-full h-12 px-8" asChild>
              <Link href="/tree">
                Buka Pohon Keluarga
              </Link>
            </Button>
          </section>

        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2026 Keluarga Besar H. Abdul Salam & Siti Khodijah</p>
      </footer>
    </div>
  )
}
