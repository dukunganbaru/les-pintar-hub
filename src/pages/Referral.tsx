import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Gift, Users, Coins, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Referral = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile) {
      generateReferralCode();
      fetchReferrals();
    }
  }, [user, profile]);

  const generateReferralCode = () => {
    if (profile) {
      const code = `${profile.full_name.replace(/\s+/g, '').toUpperCase().slice(0, 3)}${user?.id.slice(-6).toUpperCase()}`;
      setReferralCode(code);
    }
  };

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          profiles!referrals_referred_id_fkey(full_name)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setReferrals(data || []);
      
      // Calculate total rewards
      const total = (data || []).reduce((sum, ref) => sum + (ref.reward_amount || 0), 0);
      setTotalRewards(total);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Success",
      description: "Kode referral berhasil disalin!",
    });
  };

  const shareReferral = () => {
    const shareUrl = `${window.location.origin}/auth?ref=${referralCode}`;
    const shareText = `Bergabunglah dengan Gurupeia.id menggunakan kode referral saya: ${referralCode}. Dapatkan diskon untuk les privat terbaik! ${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Gurupeia.id - Referral",
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Success",
        description: "Link referral berhasil disalin!",
      });
    }
  };

  const benefits = [
    {
      icon: <Gift className="h-8 w-8 text-yellow-500" />,
      title: "Bonus Rp 50.000",
      description: "Untuk setiap teman yang mendaftar"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Teman Dapat Diskon",
      description: "Teman mendapat diskon 20% untuk les pertama"
    },
    {
      icon: <Coins className="h-8 w-8 text-green-500" />,
      title: "Tanpa Batas",
      description: "Ajak sebanyak-banyaknya teman"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        
        <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Program Referral
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Ajak teman bergabung dan dapatkan bonus menarik!
            </p>
            <Button size="lg" onClick={() => window.location.href = '/auth'}>
              Masuk untuk Mulai Referral
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Keuntungan Program Referral</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto mb-4">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Program Referral
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ajak teman bergabung dan dapatkan bonus menarik!
          </p>
        </div>
      </section>

      {/* Referral Dashboard */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Referral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{referrals.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Reward</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">Rp {totalRewards.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Kode Referral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{referralCode}</div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Actions */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-6 w-6 mr-2" />
                  Bagikan Kode Referral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input 
                      value={referralCode} 
                      readOnly 
                      className="text-lg font-mono"
                    />
                  </div>
                  <Button onClick={copyReferralCode} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Salin
                  </Button>
                  <Button onClick={shareReferral}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  Bagikan kode referral Anda kepada teman dan keluarga. Mereka akan mendapat diskon 20% 
                  untuk les pertama, dan Anda mendapat bonus Rp 50.000 setelah mereka menyelesaikan les pertama.
                </p>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto mb-4">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Referral History */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Referral</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada referral. Mulai ajak teman bergabung sekarang!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <h4 className="font-medium">{referral.profiles?.full_name || 'User'}</h4>
                          <p className="text-sm text-muted-foreground">
                            Bergabung pada {new Date(referral.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            +Rp {referral.reward_amount.toLocaleString()}
                          </div>
                          <Badge variant={referral.is_claimed ? "default" : "secondary"}>
                            {referral.is_claimed ? "Diklaim" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Referral;