import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          bookings (
            subject,
            booking_date,
            is_manual_booking,
            admin_notes,
            status,
            teachers (
              profiles (full_name)
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPayments(data || []);

      // Calculate stats
      const totalAmount = data?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const pendingAmount = data?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;
      const paidAmount = data?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        totalAmount,
        pendingAmount,
        paidAmount,
        totalPayments: data?.length || 0
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

  const handleUpdateStatus = async (paymentId: string, status: 'paid' | 'pending' | 'failed' | 'refunded') => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Status pembayaran berhasil diupdate",
      });

      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === "all") return true;
    return payment.status === filter;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout title="Kelola Pembayaran" subtitle="Pantau dan kelola semua transaksi pembayaran">
      <div className="container mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">transaksi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">total transaksi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lunas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {stats.paidAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">terbayar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                Rp {stats.pendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">menunggu</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Pembayaran</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pembayaran</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Guru</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.id.substring(0, 8)}...
                      {payment.bookings?.is_manual_booking && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          Manual
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.bookings?.subject || "-"}
                    </TableCell>
                    <TableCell>
                      {payment.bookings?.teachers?.profiles?.full_name || "-"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      Rp {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.payment_method || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "paid"
                            ? "default"
                            : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {payment.status === "paid" ? "Lunas" :
                         payment.status === "pending" ? "Pending" : "Gagal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      {payment.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(payment.id, "paid")}
                          >
                            Konfirmasi
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUpdateStatus(payment.id, "failed")}
                          >
                            Tolak
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredPayments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada data pembayaran
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
