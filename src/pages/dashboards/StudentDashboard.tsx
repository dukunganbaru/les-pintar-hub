import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, BookOpen, Star, Plus, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    upcomingLessons: 0,
    totalSpent: 0,
  });
  const [lessons, setLessons] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    teacher_id: '',
    subject: '',
    lesson_date: '',
    lesson_time: '',
    duration_hours: 1,
    notes: '',
  });

  const subjects = [
    { value: 'matematika', label: 'Matematika' },
    { value: 'fisika', label: 'Fisika' },
    { value: 'kimia', label: 'Kimia' },
    { value: 'biologi', label: 'Biologi' },
    { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
    { value: 'bahasa_indonesia', label: 'Bahasa Indonesia' },
  ];

  useEffect(() => {
    if (user) {
      fetchStudentData();
      fetchTeachers();
    }
  }, [user]);

  const fetchStudentData = async () => {
    if (!user) return;

    try {
      // Fetch student profile
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setStudentData(student);

      if (student) {
        // Fetch lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select(`
            *,
            teachers(
              profiles(full_name),
              hourly_rate
            )
          `)
          .eq('student_id', student.id)
          .order('lesson_date', { ascending: false });

        setLessons(lessonsData || []);

        // Calculate stats
        const totalLessons = lessonsData?.length || 0;
        const completedLessons = lessonsData?.filter(l => l.status === 'completed').length || 0;
        const upcomingLessons = lessonsData?.filter(l => 
          l.status === 'confirmed' && new Date(l.lesson_date) > new Date()
        ).length || 0;
        const totalSpent = lessonsData?.filter(l => l.status === 'completed')
          .reduce((sum, l) => sum + l.total_amount, 0) || 0;

        setStats({
          totalLessons,
          completedLessons,
          upcomingLessons,
          totalSpent,
        });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles(full_name)
        `)
        .eq('is_verified', true)
        .eq('is_available', true);

      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleBookLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentData) {
      toast({
        title: "Error",
        description: "Profil siswa tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedTeacher = teachers.find(t => t.id === bookingForm.teacher_id);
      if (!selectedTeacher) throw new Error('Guru tidak ditemukan');

      const lessonDateTime = new Date(`${bookingForm.lesson_date}T${bookingForm.lesson_time}`);
      const totalAmount = selectedTeacher.hourly_rate * bookingForm.duration_hours;

      const { error } = await supabase
        .from('lessons')
        .insert([{
          student_id: studentData.id,
          teacher_id: bookingForm.teacher_id,
          subject: bookingForm.subject as any,
          lesson_date: lessonDateTime.toISOString(),
          duration_hours: bookingForm.duration_hours,
          hourly_rate: selectedTeacher.hourly_rate,
          total_amount: totalAmount,
          notes: bookingForm.notes,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permintaan les berhasil dikirim!",
      });

      // Reset form
      setBookingForm({
        teacher_id: '',
        subject: '',
        lesson_date: '',
        lesson_time: '',
        duration_hours: 1,
        notes: '',
      });

      fetchStudentData();
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

  if (!studentData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profil Siswa Belum Lengkap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Anda belum memiliki profil siswa. Silakan lengkapi profil terlebih dahulu.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Lengkapi Profil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Siswa</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Pesan Les
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pesan Les Privat</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookLesson} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Pilih Guru</Label>
                <Select 
                  value={bookingForm.teacher_id} 
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, teacher_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih guru" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.profiles.full_name} - Rp {teacher.hourly_rate.toLocaleString()}/jam
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Mata Pelajaran</Label>
                <Select 
                  value={bookingForm.subject} 
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, subject: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingForm.lesson_date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, lesson_date: e.target.value }))}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Waktu</Label>
                <Input
                  id="time"
                  type="time"
                  value={bookingForm.lesson_time}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, lesson_time: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (jam)</Label>
                <Select 
                  value={bookingForm.duration_hours.toString()} 
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, duration_hours: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 jam</SelectItem>
                    <SelectItem value="2">2 jam</SelectItem>
                    <SelectItem value="3">3 jam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan khusus untuk guru..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Pesan Les
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Les</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Les Selesai</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Les Mendatang</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Biaya</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {stats.totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">Riwayat Les</TabsTrigger>
          <TabsTrigger value="teachers">Guru Favorit</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Les</CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada riwayat les
                </p>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {lesson.teachers.profiles.full_name}
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
                        <p className="font-medium">
                          Rp {lesson.total_amount.toLocaleString()}
                        </p>

                        {lesson.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <Star className="h-4 w-4 mr-1" />
                            Beri Rating
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

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Guru Favorit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">
                Fitur guru favorit akan segera hadir...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;