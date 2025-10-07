import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: any;
  onSuccess: () => void;
}

export default function BookingDialog({ open, onOpenChange, teacher, onSuccess }: BookingDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    duration_hours: 1,
    notes: '',
    payment_method: 'transfer'
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

  const totalAmount = teacher?.hourly_rate * formData.duration_hours;

  const handleSubmit = async () => {
    if (!date || !timeSlot || !formData.subject || !user) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get student data
      const { data: studentData } = await supabase
        .from('students')
        .select('id, parent_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!studentData) {
        throw new Error("Profil siswa tidak ditemukan");
      }

      // Create booking datetime
      const [hours, minutes] = timeSlot.split(':');
      const bookingDate = new Date(date);
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          student_id: studentData.id,
          tutor_id: teacher.id,
          parent_id: studentData.parent_id,
          subject: formData.subject,
          booking_date: bookingDate.toISOString(),
          duration_hours: formData.duration_hours,
          hourly_rate: teacher.hourly_rate,
          total_amount: totalAmount,
          notes: formData.notes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          parent_id: studentData.parent_id,
          amount: totalAmount,
          payment_method: formData.payment_method,
          status: 'pending'
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Berhasil!",
        description: "Booking berhasil dibuat. Silakan lakukan pembayaran.",
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal membuat booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(undefined);
    setTimeSlot('');
    setFormData({
      subject: '',
      duration_hours: 1,
      notes: '',
      payment_method: 'transfer'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pesan Les dengan {teacher?.profiles?.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Teacher Info */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Tarif per jam</p>
            <p className="text-2xl font-bold text-primary">Rp {teacher?.hourly_rate?.toLocaleString()}</p>
          </div>

          {/* Subject Selection */}
          <div>
            <Label>Mata Pelajaran</Label>
            <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
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

          {/* Date Selection */}
          <div>
            <Label>Tanggal</Label>
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

          {/* Time Slot */}
          <div>
            <Label>Waktu</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
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

          {/* Duration */}
          <div>
            <Label>Durasi (jam)</Label>
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

          {/* Payment Method */}
          <div>
            <Label>Metode Pembayaran</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
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

          {/* Notes */}
          <div>
            <Label>Catatan (opsional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Tambahkan catatan untuk guru..."
              rows={3}
            />
          </div>

          {/* Total Amount */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                <p className="text-xs text-muted-foreground">
                  {formData.duration_hours} jam × Rp {teacher?.hourly_rate?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  Rp {totalAmount?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? 'Memproses...' : 'Konfirmasi Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
