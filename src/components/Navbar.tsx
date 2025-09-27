import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import logo from "@/assets/logo.png"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={logo} alt="FunTeacher Private" className="h-10 w-10" />
            <span className="font-bold text-xl text-primary">FunTeacher Private</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#beranda" className="text-foreground hover:text-primary transition-smooth font-medium">
              Beranda
            </a>
            <a href="#layanan" className="text-foreground hover:text-primary transition-smooth font-medium">
              Biaya Les
            </a>
            <a href="#blog" className="text-foreground hover:text-primary transition-smooth font-medium">
              Blog
            </a>
            <a href="#referral" className="text-foreground hover:text-primary transition-smooth font-medium">
              Referral
            </a>
            <a href="#cari-pengajar" className="text-foreground hover:text-primary transition-smooth font-medium">
              Cari Pengajar
            </a>
            <a href="#jadi-pengajar" className="text-foreground hover:text-primary transition-smooth font-medium">
              Jadi Pengajar
            </a>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline">Masuk</Button>
            <Button variant="primary">Daftar</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-border animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#beranda"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Beranda
              </a>
              <a
                href="#layanan"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Biaya Les
              </a>
              <a
                href="#blog"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </a>
              <a
                href="#referral"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Referral
              </a>
              <a
                href="#cari-pengajar"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Cari Pengajar
              </a>
              <a
                href="#jadi-pengajar"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Jadi Pengajar
              </a>
              <div className="px-3 py-2 space-y-2">
                <Button variant="outline" className="w-full">Masuk</Button>
                <Button variant="primary" className="w-full">Daftar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar