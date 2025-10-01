import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, BookOpen, CreditCard, Plus, Star, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ParentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [parentData, setParentData] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isBookingTutor, setIsBookingTutor] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [filters, setFilters] = useState({
    subject: '',
    location: '',
    maxRate: '',
    minRating: ''
  });

  const [newChild, setNewChild] = useState({
    name: '',
    grade: '',
    education_level: 'sd',
    school_name: '',
    notes: ''
  });

  const [newBooking, setNewBooking] = useState({
    student_id: '',
    tutor_id: '',
    subject: '',
    booking_date: '',
    duration_hours: 1,
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchParentData();
    }
  }, [user]);

  const fetchParentData = async () => {
    if (!user) return;

    try {
      // Fetch parent profile
      const { data: parent } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setParentData(parent);

      if (parent) {
        // Fetch children
        const { data: childrenData } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', parent.id);

        setChildren(childrenData || []);

        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            teachers(
              profiles(full_name),
              subjects,
              hourly_rate,
              rating
            ),
            students(profiles(full_name))
          `)
          .eq('parent_id', parent.id)
          .order('booking_date', { ascending: false });

        setBookings(bookingsData || []);

        // Fetch payments
        const { data: paymentsData } = await supabase
          .from('payments')
          .select(`
            *,
            bookings(
              subject,
              booking_date,
              teachers(profiles(full_name))
            )
          `)
          .eq('parent_id', parent.id)
          .order('created_at', { ascending: false });

        setPayments(paymentsData || []);
      }

      // Fetch available tutors
      const { data: tutorsData } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles(full_name, phone)
        `)
        .eq('is_verified', true)
        .eq('is_available', true);

      setTutors(tutorsData || []);
    } catch (error) {
      console.error('Error fetching parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
    if (!parentData) return;

    try {
      const { error } = await supabase
        .from('students')
        .insert({
          user_id: user?.id,
          education_level: newChild.education_level as any,
          school_name: newChild.school_name,
          grade: newChild.grade,
          parent_id: parentData.id,
          profile_id: user?.id // assuming profile_id should be user_id
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data anak berhasil ditambahkan",
      });

      setIsAddingChild(false);
      setNewChild({
        name: '',
        grade: '',
        education_level: 'sd',
        school_name: '',
        notes: ''
      });
      fetchParentData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBookTutor = async () => {
    if (!selectedTutor || !newBooking.student_id) return;

    try {
      const totalAmount = selectedTutor.hourly_rate * newBooking.duration_hours;

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          ...newBooking,
          tutor_id: selectedTutor.id,
          parent_id: parentData.id,
          hourly_rate: selectedTutor.hourly_rate,
          total_amount: totalAmount
        })
        .select()
        .single();

      if (error) throw error;

      // Create payment record
      await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          parent_id: parentData.id,
          amount: totalAmount,
          status: 'pending'
        });

      toast({
        title: "Berhasil",
        description: "Booking berhasil dibuat",
      });

      setIsBookingTutor(false);
      setSelectedTutor(null);
      setNewBooking({
        student_id: '',
        tutor_id: '',
        subject: '',
        booking_date: '',
        duration_hours: 1,
        notes: ''
      });
      fetchParentData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    if (filters.subject && !tutor.subjects.includes(filters.subject)) return false;
    if (filters.location && !tutor.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.maxRate && tutor.hourly_rate > parseInt(filters.maxRate)) return false;
    if (filters.minRating && tutor.rating < parseFloat(filters.minRating)) return false;
    return true;
  });

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
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!parentData) {
    return (
      <DashboardLayout title="Dashboard Orang Tua">
        <Card>
          <CardHeader>
            <CardTitle>Profil Orang Tua Belum Lengkap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Anda belum memiliki profil orang tua. Silakan lengkapi profil terlebih dahulu.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Lengkapi Profil
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard Orang Tua" subtitle="Kelola data anak dan booking les">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anak</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bayar</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="children" className="space-y-4">
        <TabsList>
          <TabsTrigger value="children">Data Anak</TabsTrigger>
          <TabsTrigger value="tutors">Cari Tutor</TabsTrigger>
          <TabsTrigger value="bookings">Booking</TabsTrigger>
          <TabsTrigger value="payments">Pembayaran</TabsTrigger>
        </TabsList>

        <TabsContent value="children">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Data Anak</CardTitle>
              <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Anak
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Data Anak</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nama Anak</Label>
                      <Input
                        id="name"
                        value={newChild.name}
                        onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Kelas</Label>
                      <Input
                        id="grade"
                        value={newChild.grade}
                        onChange={(e) => setNewChild({...newChild, grade: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="education_level">Tingkat Pendidikan</Label>
                      <Select value={newChild.education_level} onValueChange={(value) => setNewChild({...newChild, education_level: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sd">SD</SelectItem>
                          <SelectItem value="smp">SMP</SelectItem>
                          <SelectItem value="sma">SMA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="school_name">Nama Sekolah</Label>
                      <Input
                        id="school_name"
                        value={newChild.school_name}
                        onChange={(e) => setNewChild({...newChild, school_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Catatan</Label>
                      <Textarea
                        id="notes"
                        value={newChild.notes}
                        onChange={(e) => setNewChild({...newChild, notes: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleAddChild} className="w-full">
                      Tambah Anak
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada data anak
                </p>
              ) : (
                <div className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{child.profiles?.full_name || child.name}</h3>
                      <p className="text-muted-foreground">
                        {child.education_level?.toUpperCase()} • Kelas {child.grade}
                      </p>
                      <p className="text-sm text-muted-foreground">{child.school_name}</p>
                      {child.notes && (
                        <p className="text-sm mt-2">{child.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Cari Tutor
                <Dialog open={isBookingTutor} onOpenChange={setIsBookingTutor}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Booking Tutor</DialogTitle>
                    </DialogHeader>
                    {selectedTutor && (
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold">{selectedTutor.profiles.full_name}</h3>
                          <p className="text-muted-foreground">Rp {selectedTutor.hourly_rate.toLocaleString()}/jam</p>
                        </div>
                        <div>
                          <Label htmlFor="student_select">Pilih Anak</Label>
                          <Select value={newBooking.student_id} onValueChange={(value) => setNewBooking({...newBooking, student_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih anak" />
                            </SelectTrigger>
                            <SelectContent>
                              {children.map((child) => (
                                <SelectItem key={child.id} value={child.id}>
                                  {child.profiles?.full_name || child.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="subject_select">Mata Pelajaran</Label>
                          <Select value={newBooking.subject} onValueChange={(value) => setNewBooking({...newBooking, subject: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih mata pelajaran" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedTutor.subjects.map((subject: string) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="booking_date">Tanggal & Waktu</Label>
                          <Input
                            id="booking_date"
                            type="datetime-local"
                            value={newBooking.booking_date}
                            onChange={(e) => setNewBooking({...newBooking, booking_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Durasi (jam)</Label>
                          <Input
                            id="duration"
                            type="number"
                            min="1"
                            value={newBooking.duration_hours}
                            onChange={(e) => setNewBooking({...newBooking, duration_hours: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="booking_notes">Catatan</Label>
                          <Textarea
                            id="booking_notes"
                            value={newBooking.notes}
                            onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                          />
                        </div>
                        <div className="p-3 bg-muted rounded">
                          <p className="font-medium">
                            Total: Rp {(selectedTutor.hourly_rate * newBooking.duration_hours).toLocaleString()}
                          </p>
                        </div>
                        <Button onClick={handleBookTutor} className="w-full">
                          Booking Sekarang
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filter */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Input
                  placeholder="Mata pelajaran"
                  value={filters.subject}
                  onChange={(e) => setFilters({...filters, subject: e.target.value})}
                />
                <Input
                  placeholder="Lokasi"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
                <Input
                  placeholder="Max harga/jam"
                  type="number"
                  value={filters.maxRate}
                  onChange={(e) => setFilters({...filters, maxRate: e.target.value})}
                />
                <Input
                  placeholder="Min rating"
                  type="number"
                  step="0.1"
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                {filteredTutors.map((tutor) => (
                  <div key={tutor.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{tutor.profiles.full_name}</h3>
                        <p className="text-muted-foreground">{tutor.location}</p>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{tutor.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground ml-2">
                            ({tutor.total_reviews} ulasan)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          Rp {tutor.hourly_rate.toLocaleString()}/jam
                        </p>
                        <Button
                          onClick={() => {
                            setSelectedTutor(tutor);
                            setIsBookingTutor(true);
                          }}
                          className="mt-2"
                        >
                          Book Tutor
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Mata Pelajaran:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects.map((subject: string) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Metode:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teaching_method.map((method: string) => (
                          <Badge key={method} variant="outline">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {tutor.bio && (
                      <div>
                        <h4 className="font-medium mb-2">Bio:</h4>
                        <p className="text-sm text-muted-foreground">{tutor.bio}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Booking</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada booking
                </p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.teachers.profiles.full_name}
                          </h3>
                          <p className="text-muted-foreground">
                            {booking.subject} • {booking.duration_hours} jam
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(booking.booking_date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Siswa: {booking.students.profiles.full_name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-green-600">
                            Rp {booking.total_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-4 p-3 bg-muted rounded">
                          <p className="text-sm">
                            <strong>Catatan:</strong> {booking.notes}
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

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada pembayaran
                </p>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">
                            {payment.bookings.teachers.profiles.full_name}
                          </h3>
                          <p className="text-muted-foreground">
                            {payment.bookings.subject}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payment.bookings.booking_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            Rp {payment.amount.toLocaleString()}
                          </p>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ParentDashboard;