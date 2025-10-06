import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, UserCheck } from "lucide-react";

interface Teacher {
  id: string;
  user_id: string;
  is_verified: boolean;
  subjects: string[];
  education_levels: string[];
  hourly_rate: number;
  experience_years: number;
  profiles: {
    full_name: string;
    phone: string;
  };
}

export default function TeacherVerification() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select(`
          *,
          profiles (full_name, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
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

  const handleVerification = async (teacherId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from("teachers")
        .update({ is_verified: verified })
        .eq("id", teacherId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Teacher ${verified ? "verified" : "rejected"} successfully`,
      });
      fetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout title="Teacher Verification" subtitle="Verify and manage teachers">
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6" />
              Teacher Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.profiles?.full_name}</TableCell>
                    <TableCell>{teacher.profiles?.phone || "-"}</TableCell>
                    <TableCell>{teacher.subjects?.join(", ")}</TableCell>
                    <TableCell>{teacher.experience_years} years</TableCell>
                    <TableCell>Rp {teacher.hourly_rate?.toLocaleString()}/hr</TableCell>
                    <TableCell>
                      <Badge variant={teacher.is_verified ? "default" : "secondary"}>
                        {teacher.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!teacher.is_verified && (
                          <Button
                            size="sm"
                            onClick={() => handleVerification(teacher.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {teacher.is_verified && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleVerification(teacher.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
