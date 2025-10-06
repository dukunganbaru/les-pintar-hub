import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, BookOpen, Clock, Star } from "lucide-react";

export default function Progress() {
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalHours: 0,
    averageRating: 0,
  });
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

      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("student_id", studentData.id);

      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("student_id", studentData.id);

      const totalLessons = lessons?.length || 0;
      const completedLessons = lessons?.filter((l) => l.status === "completed").length || 0;
      const totalHours = lessons?.reduce((sum, l) => sum + l.duration_hours, 0) || 0;
      const averageRating =
        reviews?.reduce((sum, r) => sum + r.rating, 0) / (reviews?.length || 1) || 0;

      setStats({
        totalLessons,
        completedLessons,
        totalHours,
        averageRating,
      });
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
    ? (stats.completedLessons / stats.totalLessons) * 100
    : 0;

  return (
    <DashboardLayout title="Progress" subtitle="Track your learning progress">
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">My Progress</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLessons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedLessons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <ProgressBar value={completionRate} />
              <p className="text-sm text-muted-foreground">
                {completionRate.toFixed(1)}% of lessons completed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
