import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap, BookOpen, TrendingUp, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalParents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingTeachers: 0,
    pendingWithdraws: 0,
  });
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [pendingWithdraws, setPendingWithdraws] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [usersResult, teachersResult, studentsResult, parentsResult, bookingsResult, pendingTeachersResult, pendingWithdrawsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('parents').select('id', { count: 'exact' }),
        supabase.from('bookings').select('total_amount'),
        supabase.from('teachers').select('id', { count: 'exact' }).eq('is_verified', false),
        supabase.from('withdraw_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalTeachers: teachersResult.count || 0,
        totalStudents: studentsResult.count || 0,
        totalParents: parentsResult.count || 0,
        totalBookings: bookingsResult.data?.length || 0,
        totalRevenue,
        pendingTeachers: pendingTeachersResult.count || 0,
        pendingWithdraws: pendingWithdrawsResult.count || 0,
      });

      // Fetch pending teachers
      const { data: pendingData } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles(full_name, phone)
        `)
        .eq('is_verified', false)
        .order('created_at', { ascending: false });

      setPendingTeachers(pendingData || []);

      // Fetch pending withdraws
      const { data: withdrawData } = await supabase
        .from('withdraw_requests')
        .select(`
          *,
          teachers(
            profiles(full_name)
          )
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      setPendingWithdraws(withdrawData || []);

      // Fetch all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setAllUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherVerification = async (teacherId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_verified: isApproved })
        .eq('id', teacherId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Guru ${isApproved ? 'disetujui' : 'ditolak'} berhasil`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleWithdrawApproval = async (withdrawId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('withdraw_requests')
        .update({ 
          status: isApproved ? 'approved' : 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Penarikan ${isApproved ? 'disetujui' : 'ditolak'} berhasil`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard Admin">
        <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard Admin" subtitle="Kelola pengguna, verifikasi, dan statistik platform">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTeachers} Guru • {stats.totalParents} Orang Tua • {stats.totalStudents} Siswa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTeachers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingWithdraws} Penarikan Pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending-teachers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending-teachers">
            Verifikasi Guru ({stats.pendingTeachers})
          </TabsTrigger>
          <TabsTrigger value="withdraw-requests">
            Penarikan Saldo ({stats.pendingWithdraws})
          </TabsTrigger>
          <TabsTrigger value="users">Manajemen User</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
        </TabsList>

        <TabsContent value="pending-teachers">
          <Card>
            <CardHeader>
              <CardTitle>Guru Menunggu Persetujuan</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTeachers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Tidak ada guru yang menunggu persetujuan
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingTeachers.map((teacher) => (
                    <div key={teacher.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{teacher.profiles.full_name}</h3>
                          <p className="text-muted-foreground">{teacher.profiles.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleTeacherVerification(teacher.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleTeacherVerification(teacher.id, false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Mata Pelajaran:</h4>
                          <div className="flex flex-wrap gap-2">
                            {teacher.subjects.map((subject: string) => (
                              <Badge key={subject} variant="secondary">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Tingkat:</h4>
                          <div className="flex flex-wrap gap-2">
                            {teacher.education_levels.map((level: string) => (
                              <Badge key={level} variant="outline">
                                {level.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Pengalaman & Tarif:</h4>
                        <p className="text-sm text-muted-foreground">
                          {teacher.experience_years} tahun pengalaman • Rp {teacher.hourly_rate.toLocaleString()} per jam
                        </p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Latar Belakang Pendidikan:</h4>
                        <p className="text-sm text-muted-foreground">{teacher.education_background}</p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Deskripsi:</h4>
                        <p className="text-sm text-muted-foreground">{teacher.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw-requests">
          <Card>
            <CardHeader>
              <CardTitle>Permintaan Penarikan Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingWithdraws.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Tidak ada permintaan penarikan pending
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingWithdraws.map((withdraw) => (
                    <div key={withdraw.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{withdraw.teachers.profiles.full_name}</h3>
                          <p className="text-muted-foreground">
                            Jumlah: Rp {withdraw.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Bank: {withdraw.bank_account}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tanggal: {new Date(withdraw.requested_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleWithdrawApproval(withdraw.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleWithdrawApproval(withdraw.id, false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <p className="text-muted-foreground">{user.role}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Ringkasan Pengguna</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Guru:</span>
                      <span className="font-medium">{stats.totalTeachers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Orang Tua:</span>
                      <span className="font-medium">{stats.totalParents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Siswa:</span>
                      <span className="font-medium">{stats.totalStudents}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Aktivitas Platform</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Booking:</span>
                      <span className="font-medium">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-medium text-green-600">
                        Rp {stats.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guru Pending:</span>
                      <span className="font-medium text-yellow-600">{stats.pendingTeachers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminDashboard;