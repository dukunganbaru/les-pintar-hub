import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"

const PricingSection = () => {
  const packages = [
    {
      name: "Paket SD",
      grade: "Kelas 1-6",
      price: "75.000",
      originalPrice: "100.000",
      duration: "90 menit",
      popular: false,
      features: [
        "Guru datang ke rumah",
        "Materi sesuai kurikulum",
        "Laporan perkembangan",
        "Konsultasi orang tua",
        "Buku panduan"
      ]
    },
    {
      name: "Paket SMP",
      grade: "Kelas 7-9", 
      price: "85.000",
      originalPrice: "110.000",
      duration: "90 menit",
      popular: true,
      features: [
        "Guru berpengalaman",
        "Fokus UN & Ujian Sekolah",
        "Materi lengkap semua mapel",
        "Try out berkala",
        "Konsultasi akademik",
        "Report progress"
      ]
    },
    {
      name: "Paket SMA",
      grade: "Kelas 10-12",
      price: "95.000", 
      originalPrice: "125.000",
      duration: "90 menit",
      popular: false,
      features: [
        "Guru spesialis bidang",
        "Persiapan UTBK & PTN",
        "Strategi mengerjakan soal",
        "Simulasi ujian",
        "Bimbingan jurusan",
        "Akses e-learning"
      ]
    },
    {
      name: "Paket UTBK",
      grade: "Alumni & Gap Year",
      price: "125.000",
      originalPrice: "150.000", 
      duration: "120 menit",
      popular: false,
      features: [
        "Guru ahli UTBK",
        "Drill soal UTBK terbaru", 
        "Strategi smart solving",
        "Try out UTBK berkala",
        "Analisis kemampuan",
        "Target PTN impian",
        "Garansi nilai"
      ]
    }
  ]

  return (
    <section id="layanan" className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Pilihan <span className="text-primary">Paket Belajar</span> Terbaik
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Harga terjangkau dengan kualitas pengajaran terbaik untuk semua jenjang pendidikan
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <Card 
              key={index}
              className={`relative hover:scale-105 transition-bounce shadow-lg hover:shadow-xl border-0 ${
                pkg.popular 
                  ? 'gradient-primary text-white ring-4 ring-primary/20' 
                  : 'gradient-card'
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Paling Populer
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <h3 className={`text-2xl font-bold ${pkg.popular ? 'text-white' : 'text-foreground'}`}>
                  {pkg.name}
                </h3>
                <p className={`text-sm ${pkg.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {pkg.grade}
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-3xl font-bold ${pkg.popular ? 'text-white' : 'text-primary'}`}>
                      Rp {pkg.price}
                    </span>
                    <span className={`text-lg line-through ${pkg.popular ? 'text-white/60' : 'text-muted-foreground'}`}>
                      {pkg.originalPrice}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${pkg.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                    per pertemuan ({pkg.duration})
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${pkg.popular ? 'text-white' : 'text-success'}`} />
                      <span className={`text-sm ${pkg.popular ? 'text-white/90' : 'text-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={pkg.popular ? "secondary" : "primary"} 
                  className="w-full"
                  size="lg"
                >
                  Pilih Paket Ini
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-16 p-8 gradient-card rounded-2xl shadow-md">
          <h3 className="text-2xl font-bold mb-4 text-foreground">
            Masih Bingung Memilih Paket?
          </h3>
          <p className="text-muted-foreground mb-6">
            Tim konsultan pendidikan kami siap membantu Anda memilih paket yang tepat sesuai kebutuhan belajar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg">
              Konsultasi Gratis
            </Button>
            <Button variant="outline" size="lg">
              Lihat Perbandingan Lengkap
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection