import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, DollarSign, Users, Star, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teacherData, setTeacherData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    pendingLessons: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    if (!user) return;

    try {
      // Fetch teacher profile
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setTeacherData(teacher);

      if (teacher) {
        // Fetch lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select(`
            *,
            students(
              profiles(full_name)
            )
          `)
          .eq('teacher_id', teacher.id)
          .order('lesson_date', { ascending: false });

        setLessons(lessonsData || []);

        // Calculate stats
        const totalLessons = lessonsData?.length || 0;
        const completedLessons = lessonsData?.filter(l => l.status === 'completed').length || 0;
        const pendingLessons = lessonsData?.filter(l => l.status === 'pending').length || 0;
        const totalEarnings = lessonsData?.filter(l => l.status === 'completed')
          .reduce((sum, l) => sum + l.total_amount, 0) || 0;

        setStats({
          totalLessons,
          completedLessons,
          pendingLessons,
          totalEarnings,
          averageRating: teacher.rating || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonAction = async (lessonId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: status as any })
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Les berhasil ${status === 'confirmed' ? 'dikonfirmasi' : status === 'cancelled' ? 'dibatalkan' : 'diselesaikan'}`,
      });

      fetchTeacherData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!teacherData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profil Guru Belum Lengkap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Anda belum memiliki profil guru. Silakan daftar sebagai guru terlebih dahulu.
            </p>
            <Button onClick={() => window.location.href = '/jadi-pengajar'}>
              Daftar Sebagai Guru
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Guru</h1>
        <Badge variant={teacherData.is_verified ? "default" : "secondary"}>
          {teacherData.is_verified ? "Terverifikasi" : "Menunggu Verifikasi"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Les</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Les Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penghasilan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rp {stats.totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">Jadwal Les</TabsTrigger>
          <TabsTrigger value="profile">Profil Saya</TabsTrigger>
          <TabsTrigger value="earnings">Penghasilan</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Les</CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada jadwal les
                </p>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {lesson.students.profiles.full_name}
                          </h3>
                          <p className="text-muted-foreground">
                            {lesson.subject} • {lesson.duration_hours} jam
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(lesson.lesson_date)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(lesson.status)}>
                          {lesson.status}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-green-600">
                            Rp {lesson.total_amount.toLocaleString()}
                          </p>
                        </div>

                        {lesson.status === 'pending' && (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleLessonAction(lesson.id, 'confirmed')}
                            >
                              Konfirmasi
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleLessonAction(lesson.id, 'cancelled')}
                            >
                              Batalkan
                            </Button>
                          </div>
                        )}

                        {lesson.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleLessonAction(lesson.id, 'completed')}
                          >
                            Selesai
                          </Button>
                        )}
                      </div>

                      {lesson.notes && (
                        <div className="mt-4 p-3 bg-muted rounded">
                          <p className="text-sm">
                            <strong>Catatan:</strong> {lesson.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Mata Pelajaran:</h4>
                  <div className="flex flex-wrap gap-2">
                    {teacherData.subjects.map((subject: string) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tingkat Pendidikan:</h4>
                  <div className="flex flex-wrap gap-2">
                    {teacherData.education_levels.map((level: string) => (
                      <Badge key={level} variant="outline">
                        {level.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Pengalaman:</h4>
                  <p className="text-muted-foreground">{teacherData.experience_years} tahun</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tarif per Jam:</h4>
                  <p className="text-muted-foreground">Rp {teacherData.hourly_rate.toLocaleString()}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Latar Belakang Pendidikan:</h4>
                  <p className="text-muted-foreground">{teacherData.education_background}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Deskripsi:</h4>
                  <p className="text-muted-foreground">{teacherData.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penghasilan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.filter(l => l.status === 'completed').map((lesson) => (
                  <div key={lesson.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{lesson.students.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(lesson.lesson_date)} • {lesson.subject}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      +Rp {lesson.total_amount.toLocaleString()}
                    </p>
                  </div>
                ))}

                {lessons.filter(l => l.status === 'completed').length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada penghasilan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;