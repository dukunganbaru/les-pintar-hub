import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, BookOpen, Clock, Award, Star } from "lucide-react";

export default function StudentProgress() {
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalHours: 0,
    subjects: [] as any[]
  });
  const [lessons, setLessons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!studentData) throw new Error("Student profile not found");

      // Fetch all lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select(`
          *,
          teachers (
            profiles (full_name)
          )
        `)
        .eq("student_id", studentData.id)
        .order("lesson_date", { ascending: false });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Calculate stats
      const completed = lessonsData?.filter(l => l.status === 'completed').length || 0;
      const total = lessonsData?.length || 0;
      const hours = lessonsData?.reduce((sum, l) => sum + (l.duration_hours || 0), 0) || 0;

      // Group by subject
      const subjectMap = new Map();
      lessonsData?.forEach(lesson => {
        const subject = lesson.subject;
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, {
            name: subject,
            total: 0,
            completed: 0,
            hours: 0
          });
        }
        const subjectStats = subjectMap.get(subject);
        subjectStats.total++;
        subjectStats.hours += lesson.duration_hours || 0;
        if (lesson.status === 'completed') {
          subjectStats.completed++;
        }
      });

      setStats({
        totalLessons: total,
        completedLessons: completed,
        totalHours: hours,
        subjects: Array.from(subjectMap.values())
      });

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          *,
          teachers (
            profiles (full_name)
          )
        `)
        .eq("student_id", studentData.id)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

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

  const completionRate = stats.totalLessons > 0 
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100) 
    : 0;

  return (
    <DashboardLayout title="Progress Belajar" subtitle="Pantau perkembangan belajar Anda">
      <div className="container mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Les</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLessons}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedLessons} selesai
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jam</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours}</div>
              <p className="text-xs text-muted-foreground">jam belajar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tingkat Selesai</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mata Pelajaran</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subjects.length}</div>
              <p className="text-xs text-muted-foreground">mata pelajaran</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">Per Mata Pelajaran</TabsTrigger>
            <TabsTrigger value="lessons">Riwayat Les</TabsTrigger>
            <TabsTrigger value="reviews">Ulasan</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Progress per Mata Pelajaran</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.subjects.length > 0 ? (
                  <div className="space-y-6">
                    {stats.subjects.map((subject) => {
                      const rate = subject.total > 0 
                        ? Math.round((subject.completed / subject.total) * 100) 
                        : 0;
                      return (
                        <div key={subject.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold capitalize">{subject.name}</h3>
                            <Badge variant="secondary">
                              {subject.completed}/{subject.total} selesai
                            </Badge>
                          </div>
                          <Progress value={rate} />
                          <p className="text-sm text-muted-foreground">
                            Total {subject.hours} jam belajar • {rate}% selesai
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada data progress
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Les</CardTitle>
              </CardHeader>
              <CardContent>
                {lessons.length > 0 ? (
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold capitalize">{lesson.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              Guru: {lesson.teachers?.profiles?.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(lesson.lesson_date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} • {lesson.duration_hours} jam
                            </p>
                            {lesson.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Catatan: {lesson.notes}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              lesson.status === "completed"
                                ? "default"
                                : lesson.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {lesson.status === "completed" ? "Selesai" : 
                             lesson.status === "pending" ? "Menunggu" : lesson.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada riwayat les
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Ulasan Anda</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">
                              {review.teachers?.profiles?.full_name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {review.review_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada ulasan
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
