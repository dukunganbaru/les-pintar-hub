import React, { useState, useEffect } from 'react';
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
    totalLessons: 0,
    pendingTeachers: 0,
  });
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [usersResult, teachersResult, studentsResult, lessonsResult, pendingResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('lessons').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }).eq('is_verified', false),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalTeachers: teachersResult.count || 0,
        totalStudents: studentsResult.count || 0,
        totalLessons: lessonsResult.count || 0,
        pendingTeachers: pendingResult.count || 0,
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Admin</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Les</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending-teachers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending-teachers">
            Persetujuan Guru ({stats.pendingTeachers})
          </TabsTrigger>
          <TabsTrigger value="all-teachers">Semua Guru</TabsTrigger>
          <TabsTrigger value="lessons">Manajemen Les</TabsTrigger>
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

        <TabsContent value="all-teachers">
          <Card>
            <CardHeader>
              <CardTitle>Semua Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Fitur manajemen guru akan segera hadir...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Les</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Fitur manajemen les akan segera hadir...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;