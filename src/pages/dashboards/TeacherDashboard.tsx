import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, DollarSign, Users, Star, CheckCircle, XCircle, Plus, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teacherData, setTeacherData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
    availableBalance: 0,
    averageRating: 0,
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);

  const [newAvailability, setNewAvailability] = useState({
    day_of_week: 0,
    start_time: '',
    end_time: ''
  });

  const [withdrawRequest, setWithdrawRequest] = useState({
    amount: 0,
    bank_account: ''
  });

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
        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            students(
              profiles(full_name)
            ),
            parents(
              profiles(full_name)
            )
          `)
          .eq('tutor_id', teacher.id)
          .order('booking_date', { ascending: false });

        setBookings(bookingsData || []);

        // Fetch availability
        const { data: availabilityData } = await supabase
          .from('tutor_availability')
          .select('*')
          .eq('tutor_id', teacher.id)
          .order('day_of_week');

        setAvailability(availabilityData || []);

        // Fetch withdraw requests
        const { data: withdrawData } = await supabase
          .from('withdraw_requests')
          .select('*')
          .eq('tutor_id', teacher.id)
          .order('requested_at', { ascending: false });

        setWithdrawRequests(withdrawData || []);

        // Calculate stats
        const totalBookings = bookingsData?.length || 0;
        const completedBookings = bookingsData?.filter(b => b.status === 'completed').length || 0;
        const pendingBookings = bookingsData?.filter(b => b.status === 'pending').length || 0;
        const totalEarnings = bookingsData?.filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.total_amount, 0) || 0;

        setStats({
          totalBookings,
          completedBookings,
          pendingBookings,
          totalEarnings,
          availableBalance: teacher.available_balance || 0,
          averageRating: teacher.rating || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: status as any })
        .eq('id', bookingId);

      if (error) throw error;

      // If completed, update teacher earnings
      if (status === 'completed') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          await supabase
            .from('teachers')
            .update({ 
              available_balance: teacherData.available_balance + booking.total_amount,
              total_earnings: teacherData.total_earnings + booking.total_amount
            })
            .eq('id', teacherData.id);
        }
      }

      toast({
        title: "Success",
        description: `Booking berhasil ${status === 'confirmed' ? 'dikonfirmasi' : status === 'cancelled' ? 'dibatalkan' : status === 'rejected' ? 'ditolak' : 'diselesaikan'}`,
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

  const handleAddAvailability = async () => {
    try {
      const { error } = await supabase
        .from('tutor_availability')
        .insert({
          tutor_id: teacherData.id,
          ...newAvailability
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Jadwal ketersediaan berhasil ditambahkan",
      });

      setIsAddingAvailability(false);
      setNewAvailability({
        day_of_week: 0,
        start_time: '',
        end_time: ''
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

  const handleWithdrawRequest = async () => {
    try {
      if (withdrawRequest.amount > stats.availableBalance) {
        toast({
          title: "Error",
          description: "Jumlah penarikan melebihi saldo tersedia",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('withdraw_requests')
        .insert({
          tutor_id: teacherData.id,
          amount: withdrawRequest.amount,
          bank_account: withdrawRequest.bank_account
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permintaan penarikan berhasil dikirim",
      });

      setIsRequestingWithdraw(false);
      setWithdrawRequest({
        amount: 0,
        bank_account: ''
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
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayNumber];
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
      <div className="grid md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
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
            <CardTitle className="text-sm font-medium">Saldo Tersedia</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Rp {stats.availableBalance.toLocaleString()}</div>
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

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Booking</TabsTrigger>
          <TabsTrigger value="availability">Jadwal Tersedia</TabsTrigger>
          <TabsTrigger value="profile">Profil Saya</TabsTrigger>
          <TabsTrigger value="earnings">Penghasilan</TabsTrigger>
          <TabsTrigger value="withdraw">Penarikan</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking dari Orang Tua</CardTitle>
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
                            {booking.students.profiles.full_name}
                          </h3>
                          <p className="text-muted-foreground">
                            {booking.subject} • {booking.duration_hours} jam
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(booking.booking_date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Orang Tua: {booking.parents.profiles.full_name}
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

                        {booking.status === 'pending' && (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleBookingAction(booking.id, 'confirmed')}
                            >
                              Terima
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBookingAction(booking.id, 'rejected')}
                            >
                              Tolak
                            </Button>
                          </div>
                        )}

                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, 'completed')}
                          >
                            Selesai
                          </Button>
                        )}
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

        <TabsContent value="availability">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Jadwal Ketersediaan</CardTitle>
              <Dialog open={isAddingAvailability} onOpenChange={setIsAddingAvailability}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Jadwal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Jadwal Ketersediaan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="day_of_week">Hari</Label>
                      <Select value={newAvailability.day_of_week.toString()} onValueChange={(value) => setNewAvailability({...newAvailability, day_of_week: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Minggu</SelectItem>
                          <SelectItem value="1">Senin</SelectItem>
                          <SelectItem value="2">Selasa</SelectItem>
                          <SelectItem value="3">Rabu</SelectItem>
                          <SelectItem value="4">Kamis</SelectItem>
                          <SelectItem value="5">Jumat</SelectItem>
                          <SelectItem value="6">Sabtu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="start_time">Jam Mulai</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={newAvailability.start_time}
                        onChange={(e) => setNewAvailability({...newAvailability, start_time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">Jam Selesai</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={newAvailability.end_time}
                        onChange={(e) => setNewAvailability({...newAvailability, end_time: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleAddAvailability} className="w-full">
                      Tambah Jadwal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {availability.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada jadwal ketersediaan
                </p>
              ) : (
                <div className="space-y-4">
                  {availability.map((avail) => (
                    <div key={avail.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{getDayName(avail.day_of_week)}</h3>
                          <p className="text-muted-foreground">
                            {avail.start_time} - {avail.end_time}
                          </p>
                        </div>
                        <Badge variant={avail.is_available ? "default" : "secondary"}>
                          {avail.is_available ? "Tersedia" : "Tidak Tersedia"}
                        </Badge>
                      </div>
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
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Penghasilan</p>
                    <p className="text-2xl font-bold text-green-600">
                      Rp {stats.totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
                    <p className="text-2xl font-bold text-blue-600">
                      Rp {stats.availableBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'completed').map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{booking.students.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.booking_date)} • {booking.subject}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      +Rp {booking.total_amount.toLocaleString()}
                    </p>
                  </div>
                ))}

                {bookings.filter(b => b.status === 'completed').length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada penghasilan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Penarikan Saldo</CardTitle>
              <Dialog open={isRequestingWithdraw} onOpenChange={setIsRequestingWithdraw}>
                <DialogTrigger asChild>
                  <Button disabled={stats.availableBalance === 0}>
                    <Wallet className="h-4 w-4 mr-2" />
                    Tarik Saldo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Permintaan Penarikan Saldo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
                      <p className="text-2xl font-bold text-blue-600">
                        Rp {stats.availableBalance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="amount">Jumlah Penarikan</Label>
                      <Input
                        id="amount"
                        type="number"
                        max={stats.availableBalance}
                        value={withdrawRequest.amount}
                        onChange={(e) => setWithdrawRequest({...withdrawRequest, amount: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_account">Rekening Bank</Label>
                      <Input
                        id="bank_account"
                        placeholder="Nomor rekening dan nama bank"
                        value={withdrawRequest.bank_account}
                        onChange={(e) => setWithdrawRequest({...withdrawRequest, bank_account: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleWithdrawRequest} className="w-full">
                      Kirim Permintaan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          Rp {request.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.bank_account}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(request.requested_at)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                {withdrawRequests.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada permintaan penarikan
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