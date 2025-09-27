import { Button } from "@/components/ui/button"
import { Star, Users, BookOpen, Heart, Building, MessageCircle } from "lucide-react"
import heroImage from "@/assets/hero-education.jpg"

const HeroSection = () => {
  const stats = [
    { icon: Star, value: "4.9", label: "Rating Kepuasan Siswa", color: "text-yellow-500" },
    { icon: Users, value: "5,665", label: "Pengajar Berkualitas dan Profesional", color: "text-blue-500" },
    { icon: BookOpen, value: "27,583", label: "Siswa Fun Teacher Private", color: "text-primary" },
    { icon: MessageCircle, value: "1,140", label: "Testimoni Siswa", color: "text-green-500" },
    { icon: Heart, value: "240K", label: "Pengikut Sosial Media", color: "text-red-500" },
    { icon: Building, value: "2,372", label: "Jumlah Sekolah Tergabung", color: "text-purple-500" },
  ]

  return (
    <section id="beranda" className="min-h-screen flex items-center pt-16 bg-gradient-to-br from-background via-accent/20 to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-2">
              <p className="text-muted-foreground text-lg">Selamat Datang</p>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Di <span className="text-primary">FunTeacher</span> Private
              </h1>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-foreground">
                Sesuaikan <span className="text-primary">Kebutuhan Belajar</span> Bersama Kami
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Anda dapat memilih program dan mengatur jumlah pertemuan sesuai kebutuhan Putra-Putri Anda
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="animate-pulse-soft">
                Pesan Sekarang
              </Button>
              <Button variant="outline" size="xl">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-float">
            <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-20"></div>
            <img
              src={heroImage}
              alt="Students learning with FunTeacher Private"
              className="relative rounded-3xl shadow-hero w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="gradient-card rounded-2xl p-6 text-center hover:scale-105 transition-bounce shadow-md"
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection