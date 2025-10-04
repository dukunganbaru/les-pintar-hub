import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Phone, 
  Mail, 
  MapPin,
  Clock
} from "lucide-react"
import logo from "@/assets/logo.png"

const Footer = () => {
  const quickLinks = [
    "Tentang Kami",
    "Cara Kerja", 
    "Syarat & Ketentuan",
    "Kebijakan Privasi",
    "FAQ",
    "Blog"
  ]

  const services = [
    "Les Privat SD",
    "Les Privat SMP", 
    "Les Privat SMA",
    "Persiapan UTBK",
    "Bimbel Online",
    "Kursus Bahasa"
  ]

  const areas = [
    "Jakarta",
    "Bogor",
    "Depok", 
    "Tangerang",
    "Bekasi",
    "Bandung"
  ]

  return (
    <footer className="bg-foreground text-white">
      {/* Newsletter Section */}
      <div className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              Dapatkan Tips Belajar & Promo Terbaru
            </h3>
            <p className="text-white/90 mb-6">
              Berlangganan newsletter kami untuk mendapatkan informasi terkini seputar pendidikan
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <Input 
                placeholder="Masukkan email Anda"
                className="bg-white text-foreground border-white"
              />
              <Button variant="secondary">
                Berlangganan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <img src={logo} alt="Gurupeia.id" className="h-10 w-10" />
                <span className="font-bold text-xl">Gurupeia.id</span>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                Platform les privat terpercaya dengan pengajar berkualitas untuk semua jenjang pendidikan. 
                Kami berkomitmen memberikan pendidikan terbaik dengan metode pembelajaran yang menyenangkan.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-white/90">+62 857-1514-0182</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-white/90">info@funteacherprivate.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-white/90">Jakarta, Indonesia</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-white/90">Senin - Minggu: 08:00 - 21:00</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Tautan Cepat</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-white/80 hover:text-primary transition-smooth"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Layanan Kami</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-white/80 hover:text-primary transition-smooth"
                    >
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coverage Areas */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Area Layanan</h4>
              <ul className="space-y-3">
                {areas.map((area, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-white/80 hover:text-primary transition-smooth"
                    >
                      {area}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media & Bottom */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-white/80">Ikuti Kami:</span>
                <div className="flex gap-3">
                  <Button size="icon" variant="ghost" className="text-white hover:text-primary hover:bg-white/10">
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:text-primary hover:bg-white/10">
                    <Instagram className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:text-primary hover:bg-white/10">
                    <Twitter className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:text-primary hover:bg-white/10">
                    <Youtube className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-white/60 text-center md:text-right">
                <p>&copy; 2024 Gurupeia.id. Hak Cipta Dilindungi.</p>
                <p className="text-sm mt-1">Dibuat dengan ❤️ untuk pendidikan Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer