import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WithdrawRequest {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string;
}

export default function Earnings() {
  const [earnings, setEarnings] = useState({
    total: 0,
    available: 0,
  });
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: teacherData } = await supabase
        .from("teachers")
        .select("total_earnings, available_balance")
        .eq("user_id", user.id)
        .single();

      if (teacherData) {
        setEarnings({
          total: teacherData.total_earnings || 0,
          available: teacherData.available_balance || 0,
        });
      }

      const { data: teacherId } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { data: withdrawData } = await supabase
        .from("withdraw_requests")
        .select("*")
        .eq("tutor_id", teacherId?.id)
        .order("requested_at", { ascending: false });

      setWithdrawals(withdrawData || []);
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

  const handleWithdraw = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: teacherData } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!teacherData) throw new Error("Teacher profile not found");

      const { error } = await supabase.from("withdraw_requests").insert({
        tutor_id: teacherData.id,
        amount: earnings.available,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Withdrawal request submitted",
      });
      fetchEarnings();
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
    <DashboardLayout title="Earnings" subtitle="Track your earnings and withdrawals">
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {earnings.total.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {earnings.available.toLocaleString()}</div>
              <Button
                className="mt-4 w-full"
                onClick={handleWithdraw}
                disabled={earnings.available <= 0}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      Rp {withdrawal.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          withdrawal.status === "approved"
                            ? "default"
                            : withdrawal.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(withdrawal.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {withdrawal.processed_at
                        ? new Date(withdrawal.processed_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {withdrawals.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No withdrawals yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
