import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import logo from "@/assets/logo.png"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getDashboardRoute = () => {
    if (!profile) return '/auth'
    
    switch (profile.role) {
      case 'teacher':
        return '/dashboard/guru'
      case 'parent':
        return '/dashboard/orang-tua'
      case 'student':
        return '/dashboard/siswa'
      case 'admin':
        return '/dashboard/admin'
      default:
        return '/auth'
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="FunTeacher Private" className="h-10 w-10" />
            <span className="font-bold text-xl text-primary">FunTeacher Private</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-smooth font-medium">
              Beranda
            </Link>
            <Link to="/biaya-les" className="text-foreground hover:text-primary transition-smooth font-medium">
              Biaya Les
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-smooth font-medium">
              Blog
            </Link>
            <Link to="/referral" className="text-foreground hover:text-primary transition-smooth font-medium">
              Referral
            </Link>
            <Link to="/cari-pengajar" className="text-foreground hover:text-primary transition-smooth font-medium">
              Cari Pengajar
            </Link>
            <Link to="/jadi-pengajar" className="text-foreground hover:text-primary transition-smooth font-medium">
              Jadi Pengajar
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{profile?.full_name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/auth')}>Masuk</Button>
                <Button variant="default" onClick={() => navigate('/auth')}>Daftar</Button>
              </>
            )}
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
              <Link
                to="/"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Beranda
              </Link>
              <Link
                to="/biaya-les"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Biaya Les
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/referral"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Referral
              </Link>
              <Link
                to="/cari-pengajar"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Cari Pengajar
              </Link>
              <Link
                to="/jadi-pengajar"
                className="block px-3 py-2 text-foreground hover:text-primary transition-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Jadi Pengajar
              </Link>
              <div className="px-3 py-2 space-y-2">
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigate(getDashboardRoute())
                        setIsOpen(false)
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                    >
                      Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth')
                        setIsOpen(false)
                      }}
                    >
                      Masuk
                    </Button>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth')
                        setIsOpen(false)
                      }}
                    >
                      Daftar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar