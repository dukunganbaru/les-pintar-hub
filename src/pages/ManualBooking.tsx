import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, Send, User, BookOpen, Clock, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ManualBooking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState('');
  
  const [formData, setFormData] = useState({
    teacher_id: '',
    subject: '',
    duration_hours: 1,
    learning_package: 'single',
    payment_method: 'transfer',
    notes: '',
    student_name: '',
    student_phone: '',
    student_email: '',
    parent_name: '',
    parent_phone: ''
  });

  const subjects = [
    { value: 'matematika', label: 'Matematika' },
    { value: 'fisika', label: 'Fisika' },
    { value: 'kimia', label: 'Kimia' },
    { value: 'biologi', label: 'Biologi' },
    { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
    { value: 'bahasa_indonesia', label: 'Bahasa Indonesia' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const learningPackages = [
    { value: 'single', label: 'Sesi Tunggal', sessions: 1, discount: 0 },
    { value: 'weekly', label: 'Paket Mingguan (4 sesi)', sessions: 4, discount: 5 },
    { value: 'monthly', label: 'Paket Bulanan (12 sesi)', sessions: 12, discount: 10 },
    { value: 'semester', label: 'Paket Semester (24 sesi)', sessions: 24, discount: 15 }
  ];

  useEffect(() => {
    fetchTeachers();
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          student_name: profile.full_name || '',
          student_phone: profile.phone || '',
          student_email: user.email || ''
        }));
      }

      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setStudentData(student);

      if (student) {
        setFormData(prev => ({
          ...prev,
          parent_name: student.parent_name || '',
          parent_phone: student.parent_phone || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
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

  const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
  const selectedPackage = learningPackages.find(p => p.value === formData.learning_package);
  
  const calculateTotal = () => {
    if (!selectedTeacher || !selectedPackage) return 0;
    
    const basePrice = selectedTeacher.hourly_rate * formData.duration_hours * selectedPackage.sessions;
    const discount = basePrice * (selectedPackage.discount / 100);
    return basePrice - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !formData.teacher_id || !formData.subject) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create booking datetime
      const [hours, minutes] = timeSlot.split(':');
      const bookingDate = new Date(date);
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const totalAmount = calculateTotal();

      // Create manual booking - will be reviewed by admin
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          student_id: studentData?.id || null,
          tutor_id: formData.teacher_id,
          parent_id: studentData?.parent_id || null,
          subject: formData.subject,
          booking_date: bookingDate.toISOString(),
          duration_hours: formData.duration_hours,
          hourly_rate: selectedTeacher!.hourly_rate,
          total_amount: totalAmount,
          notes: `${formData.notes}\n\nPaket: ${selectedPackage!.label}\nNama Siswa: ${formData.student_name}\nTelepon Siswa: ${formData.student_phone}\nEmail Siswa: ${formData.student_email}\nNama Orang Tua: ${formData.parent_name}\nTelepon Orang Tua: ${formData.parent_phone}`,
          status: 'pending',
          is_manual_booking: true
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          parent_id: studentData?.parent_id || null,
          amount: totalAmount,
          payment_method: formData.payment_method,
          status: 'pending'
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Berhasil!",
        description: "Permintaan pemesanan manual berhasil dikirim ke admin. Anda akan dihubungi segera.",
      });

      // Redirect based on user
      if (user) {
        navigate('/dashboard/siswa');
      } else {
        // Reset form for non-logged in users
        setFormData({
          teacher_id: '',
          subject: '',
          duration_hours: 1,
          learning_package: 'single',
          payment_method: 'transfer',
          notes: '',
          student_name: '',
          student_phone: '',
          student_email: '',
          parent_name: '',
          parent_phone: ''
        });
        setDate(undefined);
        setTimeSlot('');
      }
    } catch (error: any) {
      console.error('Manual booking error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal membuat pemesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Pemesanan Manual
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Isi formulir di bawah ini untuk pemesanan guru les. Tim kami akan menghubungi Anda segera.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Formulir Pemesanan Les Privat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Student Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Data Siswa
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="student_name">Nama Siswa *</Label>
                        <Input
                          id="student_name"
                          value={formData.student_name}
                          onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                          required
                          placeholder="Masukkan nama siswa"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student_phone">Telepon Siswa *</Label>
                        <Input
                          id="student_phone"
                          type="tel"
                          value={formData.student_phone}
                          onChange={(e) => setFormData({...formData, student_phone: e.target.value})}
                          required
                          placeholder="+62812345678"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student_email">Email Siswa</Label>
                      <Input
                        id="student_email"
                        type="email"
                        value={formData.student_email}
                        onChange={(e) => setFormData({...formData, student_email: e.target.value})}
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parent_name">Nama Orang Tua</Label>
                        <Input
                          id="parent_name"
                          value={formData.parent_name}
                          onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
                          placeholder="Masukkan nama orang tua"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent_phone">Telepon Orang Tua</Label>
                        <Input
                          id="parent_phone"
                          type="tel"
                          value={formData.parent_phone}
                          onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                          placeholder="+62812345678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lesson Details */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Detail Les
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="teacher">Pilih Guru *</Label>
                      <Select 
                        value={formData.teacher_id} 
                        onValueChange={(value) => setFormData({...formData, teacher_id: value})}
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

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Mata Pelajaran *</Label>
                        <Select 
                          value={formData.subject} 
                          onValueChange={(value) => setFormData({...formData, subject: value})}
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
                        <Label htmlFor="duration">Durasi per Sesi *</Label>
                        <Select 
                          value={formData.duration_hours.toString()} 
                          onValueChange={(value) => setFormData({...formData, duration_hours: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 jam</SelectItem>
                            <SelectItem value="2">2 jam</SelectItem>
                            <SelectItem value="3">3 jam</SelectItem>
                            <SelectItem value="4">4 jam</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Jadwal
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tanggal *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, 'PPP', { locale: id }) : 'Pilih tanggal'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Waktu *</Label>
                        <Select value={timeSlot} onValueChange={setTimeSlot} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih waktu" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Learning Package */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold">Paket Belajar</h3>

                    <div className="space-y-2">
                      <Label htmlFor="package">Pilih Paket *</Label>
                      <Select 
                        value={formData.learning_package} 
                        onValueChange={(value) => setFormData({...formData, learning_package: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {learningPackages.map((pkg) => (
                            <SelectItem key={pkg.value} value={pkg.value}>
                              {pkg.label} {pkg.discount > 0 && `(Hemat ${pkg.discount}%)`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pembayaran
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="payment">Metode Pembayaran *</Label>
                      <Select 
                        value={formData.payment_method} 
                        onValueChange={(value) => setFormData({...formData, payment_method: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transfer">Transfer Bank</SelectItem>
                          <SelectItem value="e-wallet">E-Wallet</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTeacher && selectedPackage && (
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tarif per jam:</span>
                            <span>Rp {selectedTeacher.hourly_rate.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Durasi per sesi:</span>
                            <span>{formData.duration_hours} jam</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Jumlah sesi:</span>
                            <span>{selectedPackage.sessions} sesi</span>
                          </div>
                          {selectedPackage.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Diskon {selectedPackage.discount}%:</span>
                              <span>- Rp {((selectedTeacher.hourly_rate * formData.duration_hours * selectedPackage.sessions * selectedPackage.discount) / 100).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-primary/20">
                            <span className="font-bold">Total Pembayaran:</span>
                            <span className="text-2xl font-bold text-primary">
                              Rp {calculateTotal().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Tambahkan catatan khusus (topik yang ingin dipelajari, kebutuhan khusus, dll)"
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button type="submit" disabled={loading} className="w-full" size="lg">
                      <Send className="h-5 w-5 mr-2" />
                      {loading ? 'Mengirim...' : 'Kirim Permintaan Pemesanan'}
                    </Button>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Tim kami akan menghubungi Anda dalam 1x24 jam untuk konfirmasi
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ManualBooking;
