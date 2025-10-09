import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Lesson {
  id: string;
  subject: string;
  lesson_date: string;
  duration_hours: number;
  status: string;
  teacher_id: string;
  total_amount?: number;
  notes?: string;
  teachers: {
    profiles: {
      full_name: string;
    };
  };
}

export default function LessonSchedule() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!studentData) throw new Error("Student profile not found");

      // Fetch confirmed lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select(`
          *,
          teachers (
            profiles (full_name)
          )
        `)
        .eq("student_id", studentData.id)
        .order("lesson_date", { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch bookings (pending/confirmed)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          teachers (
            profiles (full_name)
          )
        `)
        .eq("student_id", studentData.id)
        .order("booking_date", { ascending: true });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { variant: "secondary", label: "Menunggu" },
      confirmed: { variant: "default", label: "Terkonfirmasi" },
      completed: { variant: "default", label: "Selesai" },
      cancelled: { variant: "destructive", label: "Dibatalkan" }
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Jadwal Les" subtitle="Kelola jadwal les Anda">
      <div className="container mx-auto p-6 space-y-6">
        {/* Bookings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              Booking Menunggu Konfirmasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length > 0 ? (
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{booking.subject}</h3>
                            {booking.is_manual_booking && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Manual
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            Guru: {booking.teachers?.profiles?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.booking_date).toLocaleString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} • {booking.duration_hours} jam
                          </p>
                          <p className="font-semibold text-primary">
                            Rp {booking.total_amount?.toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      {booking.notes && (
                        <Alert className="mt-4">
                          <AlertDescription>{booking.notes}</AlertDescription>
                        </Alert>
                      )}
                      {booking.admin_notes && (
                        <Alert className="mt-2 bg-blue-50 border-blue-200">
                          <AlertDescription>
                            <strong className="text-blue-700">Catatan Admin:</strong> {booking.admin_notes}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Tidak ada booking yang menunggu konfirmasi
              </p>
            )}
          </CardContent>
        </Card>

        {/* Confirmed Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Jadwal Les Terkonfirmasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lessons.length > 0 ? (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <Card key={lesson.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{lesson.subject}</h3>
                          <p className="text-muted-foreground">
                            Guru: {lesson.teachers?.profiles?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(lesson.lesson_date).toLocaleString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} • {lesson.duration_hours} jam
                          </p>
                          <p className="font-semibold text-primary">
                            Rp {lesson.total_amount?.toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(lesson.status)}
                      </div>
                      {lesson.notes && (
                        <Alert className="mt-4">
                          <AlertDescription>{lesson.notes}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Belum ada jadwal les terkonfirmasi
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
