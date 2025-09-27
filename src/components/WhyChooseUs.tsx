import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Sparkles, 
  Clock, 
  Shield, 
  Users, 
  Award, 
  Heart, 
  BookOpen, 
  Target 
} from "lucide-react"

const WhyChooseUs = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Fun",
      description: "Metode pembelajaran yang menyenangkan dan tidak membosankan untuk meningkatkan minat belajar siswa.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Clock,
      title: "Waktu Fleksibel",
      description: "Jadwal belajar yang dapat disesuaikan dengan aktivitas harian siswa dan keluarga.",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Shield,
      title: "Terpercaya",
      description: "Pengajar tersertifikasi dan berpengalaman dengan track record yang terbukti.",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Users,
      title: "Pengajar Berkualitas",
      description: "Tim pengajar profesional dari universitas terkemuka dengan metode pengajaran terbaik.",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Award,
      title: "Hasil Terjamin",
      description: "Program pembelajaran yang terbukti meningkatkan prestasi akademik siswa secara signifikan.",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      icon: Heart,
      title: "Pendekatan Personal",
      description: "Setiap siswa mendapat perhatian khusus sesuai dengan gaya belajar dan kebutuhan individu.",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: BookOpen,
      title: "Materi Lengkap",
      description: "Kurikulum komprehensif yang disesuaikan dengan standar pendidikan nasional.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Target,
      title: "Target Oriented",
      description: "Pembelajaran yang fokus pada pencapaian target nilai dan peningkatan kemampuan siswa.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Mengapa Perlu Belajar Bersama <span className="text-primary">Fun Teacher Private?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            8 Keunggulan FUN TEACHER dari Pusat Les Privat Lainnya
          </p>
          <Button variant="hero" size="xl">
            Pesan Sekarang
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:scale-105 transition-bounce shadow-md hover:shadow-lg border-0 gradient-card"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${feature.bgColor} flex items-center justify-center`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 p-6 gradient-primary rounded-2xl shadow-hero">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">Siap Memulai Perjalanan Belajar?</h3>
              <p className="text-white/90">Hubungi kami sekarang dan dapatkan konsultasi gratis!</p>
            </div>
            <Button variant="secondary" size="xl" className="shrink-0">
              Konsultasi Gratis
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs