import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface Lesson {
  id: string;
  subject: string;
  lesson_date: string;
  duration_hours: number;
  status: string;
  teacher_id: string;
  teachers: {
    profiles: {
      full_name: string;
    };
  };
}

export default function LessonSchedule() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
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

      const { data, error } = await supabase
        .from("lessons")
        .select(`
          *,
          teachers (
            profiles (full_name)
          )
        `)
        .eq("student_id", studentData.id)
        .order("lesson_date", { ascending: true });

      if (error) throw error;
      setLessons(data || []);
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

  return (
    <DashboardLayout title="Lesson Schedule" subtitle="View your upcoming lessons">
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Lesson Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{lesson.subject}</h3>
                        <p className="text-muted-foreground">
                          Teacher: {lesson.teachers?.profiles?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lesson.lesson_date).toLocaleString()} • {lesson.duration_hours}h
                        </p>
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
                        {lesson.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {lessons.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No lessons scheduled yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
