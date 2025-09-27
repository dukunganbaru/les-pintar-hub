import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Users, DollarSign, Clock, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BecomeTeacher = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjects: [] as string[],
    education_levels: [] as string[],
    experience_years: '',
    hourly_rate: '',
    description: '',
    education_background: '',
    certifications: '',
  });

  const subjects = [
    { value: 'matematika', label: 'Matematika' },
    { value: 'fisika', label: 'Fisika' },
    { value: 'kimia', label: 'Kimia' },
    { value: 'biologi', label: 'Biologi' },
    { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
    { value: 'bahasa_indonesia', label: 'Bahasa Indonesia' },
    { value: 'sejarah', label: 'Sejarah' },
    { value: 'geografi', label: 'Geografi' },
    { value: 'ekonomi', label: 'Ekonomi' },
    { value: 'akuntansi', label: 'Akuntansi' }
  ];

  const levels = [
    { value: 'sd', label: 'SD' },
    { value: 'smp', label: 'SMP' },
    { value: 'sma', label: 'SMA' },
    { value: 'kuliah', label: 'Kuliah' }
  ];

  const benefits = [
    {
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      title: "Penghasilan Menarik",
      description: "Dapatkan penghasilan hingga Rp 2-5 juta per bulan dengan jadwal fleksibel"
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      title: "Jadwal Fleksibel",
      description: "Atur jadwal mengajar sesuai dengan waktu luang Anda"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: "Platform Terpercaya",
      description: "Bergabung dengan platform les privat terpercaya dengan ribuan siswa"
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Dukungan Penuh",
      description: "Dapatkan dukungan marketing, pembayaran aman, dan customer service 24/7"
    }
  ];

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s !== subject)
      }));
    }
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        education_levels: [...prev.education_levels, level]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        education_levels: prev.education_levels.filter(l => l !== level)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (formData.subjects.length === 0) {
      toast({
        title: "Error",
        description: "Pilih minimal satu mata pelajaran",
        variant: "destructive",
      });
      return;
    }

    if (formData.education_levels.length === 0) {
      toast({
        title: "Error",
        description: "Pilih minimal satu tingkat pendidikan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Create teacher profile
      const { error } = await supabase
        .from('teachers')
        .insert([{
          user_id: user.id,
          profile_id: profileData.id,
          subjects: formData.subjects as any,
          education_levels: formData.education_levels as any,
          experience_years: parseInt(formData.experience_years),
          hourly_rate: parseInt(formData.hourly_rate.replace(/\D/g, '')),
          description: formData.description,
          education_background: formData.education_background,
          certifications: formData.certifications ? formData.certifications.split(',').map(cert => cert.trim()) : [],
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pendaftaran berhasil! Tim kami akan meninjau aplikasi Anda dalam 1-2 hari kerja.",
      });

      // Reset form
      setFormData({
        subjects: [],
        education_levels: [],
        experience_years: '',
        hourly_rate: '',
        description: '',
        education_background: '',
        certifications: '',
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Jadi Pengajar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bergabunglah dengan tim pengajar terbaik dan mulai mengajar dengan cara yang Anda sukai
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Mengapa Bergabung dengan Kami?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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

      {/* Registration Form */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Daftar Sebagai Pengajar</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Silakan login terlebih dahulu untuk mendaftar sebagai pengajar
                    </p>
                    <Button onClick={() => window.location.href = '/auth'}>
                      Login / Daftar
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subjects */}
                    <div className="space-y-3">
                      <Label>Mata Pelajaran yang Dikuasai *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {subjects.map((subject) => (
                          <div key={subject.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={subject.value}
                              checked={formData.subjects.includes(subject.value)}
                              onCheckedChange={(checked) => handleSubjectChange(subject.value, checked as boolean)}
                            />
                            <Label htmlFor={subject.value} className="text-sm font-normal">
                              {subject.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education Levels */}
                    <div className="space-y-3">
                      <Label>Tingkat Pendidikan yang Diajar *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {levels.map((level) => (
                          <div key={level.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={level.value}
                              checked={formData.education_levels.includes(level.value)}
                              onCheckedChange={(checked) => handleLevelChange(level.value, checked as boolean)}
                            />
                            <Label htmlFor={level.value} className="text-sm font-normal">
                              {level.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Experience Years */}
                    <div className="space-y-2">
                      <Label htmlFor="experience">Pengalaman Mengajar (tahun) *</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={formData.experience_years}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Hourly Rate */}
                    <div className="space-y-2">
                      <Label htmlFor="rate">Tarif per Jam (Rupiah) *</Label>
                      <Input
                        id="rate"
                        type="text"
                        placeholder="contoh: 100000"
                        value={formData.hourly_rate}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData(prev => ({ ...prev, hourly_rate: value ? parseInt(value).toLocaleString() : '' }));
                        }}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi Diri & Metode Mengajar *</Label>
                      <Textarea
                        id="description"
                        placeholder="Ceritakan tentang diri Anda, pengalaman, dan metode mengajar yang Anda gunakan..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        required
                        rows={4}
                      />
                    </div>

                    {/* Education Background */}
                    <div className="space-y-2">
                      <Label htmlFor="education">Latar Belakang Pendidikan *</Label>
                      <Input
                        id="education"
                        type="text"
                        placeholder="contoh: S1 Pendidikan Matematika Universitas Indonesia"
                        value={formData.education_background}
                        onChange={(e) => setFormData(prev => ({ ...prev, education_background: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                      <Label htmlFor="certifications">Sertifikat/Prestasi (opsional)</Label>
                      <Textarea
                        id="certifications"
                        placeholder="Pisahkan dengan koma, contoh: Sertifikat Guru Profesional, Juara 1 Olimpiade Matematika"
                        value={formData.certifications}
                        onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Mendaftar...' : 'Daftar Sebagai Pengajar'}
                    </Button>
                  </form>
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

export default BecomeTeacher;