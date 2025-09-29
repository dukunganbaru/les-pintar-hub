import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  User, 
  Calendar, 
  BookOpen, 
  DollarSign, 
  Settings, 
  LogOut,
  Users,
  BarChart3,
  CheckCircle
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getNavItems = () => {
    const baseItems = [
      { href: '/', label: 'Beranda', icon: Home },
    ];

    switch (profile?.role) {
      case 'teacher':
        return [
          ...baseItems,
          { href: '/dashboard/guru', label: 'Dashboard', icon: BarChart3 },
          { href: '/dashboard/guru/jadwal', label: 'Jadwal', icon: Calendar },
          { href: '/dashboard/guru/booking', label: 'Booking', icon: BookOpen },
          { href: '/dashboard/guru/earnings', label: 'Pendapatan', icon: DollarSign },
          { href: '/dashboard/guru/profile', label: 'Profil', icon: User },
        ];
      case 'parent':
        return [
          ...baseItems,
          { href: '/dashboard/orang-tua', label: 'Dashboard', icon: BarChart3 },
          { href: '/dashboard/orang-tua/anak', label: 'Data Anak', icon: Users },
          { href: '/dashboard/orang-tua/booking', label: 'Booking', icon: BookOpen },
          { href: '/dashboard/orang-tua/payment', label: 'Pembayaran', icon: DollarSign },
          { href: '/dashboard/orang-tua/profile', label: 'Profil', icon: User },
        ];
      case 'student':
        return [
          ...baseItems,
          { href: '/dashboard/siswa', label: 'Dashboard', icon: BarChart3 },
          { href: '/dashboard/siswa/jadwal', label: 'Jadwal Les', icon: Calendar },
          { href: '/dashboard/siswa/progress', label: 'Progress', icon: CheckCircle },
          { href: '/dashboard/siswa/profile', label: 'Profil', icon: User },
        ];
      case 'admin':
        return [
          ...baseItems,
          { href: '/dashboard/admin', label: 'Dashboard', icon: BarChart3 },
          { href: '/dashboard/admin/users', label: 'Kelola User', icon: Users },
          { href: '/dashboard/admin/teachers', label: 'Verifikasi Guru', icon: CheckCircle },
          { href: '/dashboard/admin/payments', label: 'Pembayaran', icon: DollarSign },
          { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: Settings },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FT</span>
              </div>
              <span className="font-bold text-lg">FunTeacher</span>
            </Link>
          </div>

          <div className="p-4">
            <div className="mb-6">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{profile?.full_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {profile?.role || 'User'}
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Keluar
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;