import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, GraduationCap, Clock, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const FindTeacher = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

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

  // Sample teachers data for demo
  const sampleTeachers = [
    {
      id: '1',
      user_id: '1',
      profiles: {
        full_name: 'Dr. Sarah Wijaya',
        avatar_url: '/placeholder.svg'
      },
      subjects: ['matematika', 'fisika'],
      education_levels: ['smp', 'sma', 'kuliah'],
      experience_years: 8,
      hourly_rate: 150000,
      description: 'Guru berpengalaman dengan spesialisasi matematika dan fisika. Lulusan S2 Pendidikan Matematika ITB.',
      education_background: 'S2 Pendidikan Matematika ITB',
      rating: 4.9,
      total_reviews: 47,
      is_verified: true,
      is_available: true
    },
    {
      id: '2',
      user_id: '2',
      profiles: {
        full_name: 'Prof. Ahmad Rahman',
        avatar_url: '/placeholder.svg'
      },
      subjects: ['kimia', 'biologi'],
      education_levels: ['sma', 'kuliah'],
      experience_years: 12,
      hourly_rate: 200000,
      description: 'Profesor kimia dengan pengalaman mengajar di universitas ternama. Spesialis persiapan SBMPTN.',
      education_background: 'S3 Kimia UI',
      rating: 4.8,
      total_reviews: 63,
      is_verified: true,
      is_available: true
    },
    {
      id: '3',
      user_id: '3',
      profiles: {
        full_name: 'Ibu Rina Sari',
        avatar_url: '/placeholder.svg'
      },
      subjects: ['bahasa_inggris', 'bahasa_indonesia'],
      education_levels: ['sd', 'smp', 'sma'],
      experience_years: 6,
      hourly_rate: 120000,
      description: 'Guru bahasa berpengalaman dengan metode pembelajaran interaktif dan menyenangkan.',
      education_background: 'S1 Pendidikan Bahasa Inggris UNJ',
      rating: 4.7,
      total_reviews: 32,
      is_verified: true,
      is_available: true
    }
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('is_verified', true)
        .eq('is_available', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      
      // Use sample data if no data from database
      setTeachers(data && data.length > 0 ? data : sampleTeachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers(sampleTeachers);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === '' || teacher.subjects.includes(selectedSubject);
    const matchesLevel = selectedLevel === '' || teacher.education_levels.includes(selectedLevel);
    
    return matchesSearch && matchesSubject && matchesLevel;
  });

  const formatSubjects = (teacherSubjects: string[]) => {
    return teacherSubjects.map(subject => {
      const subjectObj = subjects.find(s => s.value === subject);
      return subjectObj ? subjectObj.label : subject;
    }).join(', ');
  };

  const formatLevels = (levels: string[]) => {
    return levels.map(level => level.toUpperCase()).join(', ');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Cari Pengajar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Temukan guru les privat terbaik sesuai kebutuhan belajar Anda
          </p>
        </div>
      </section>

      {/* Search Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Cari nama guru..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua mata pelajaran</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua tingkat</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                  setSelectedLevel('');
                }}
                variant="outline"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers List */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Ditemukan {filteredTeachers.length} guru yang sesuai
            </p>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={teacher.profiles.avatar_url || '/placeholder.svg'} 
                          alt={teacher.profiles.full_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{teacher.profiles.full_name}</CardTitle>
                          {teacher.is_verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Terverifikasi
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-2 space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{teacher.rating}</span>
                            <span className="ml-1">({teacher.total_reviews} ulasan)</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{teacher.experience_years} tahun</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground line-clamp-2">
                        {teacher.description}
                      </p>
                      
                      <div>
                        <p className="font-medium text-sm text-muted-foreground mb-2">Mata Pelajaran:</p>
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects.map((subject: string) => (
                            <Badge key={subject} variant="outline">
                              {subjects.find(s => s.value === subject)?.label || subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm text-muted-foreground mb-2">Tingkat:</p>
                        <div className="flex flex-wrap gap-2">
                          {teacher.education_levels.map((level: string) => (
                            <Badge key={level} variant="secondary">
                              {level.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            Rp {teacher.hourly_rate.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">per jam</p>
                        </div>
                        
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            Lihat Profil
                          </Button>
                          <Button size="sm">
                            Pesan Les
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredTeachers.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada guru yang ditemukan sesuai kriteria pencarian.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FindTeacher;