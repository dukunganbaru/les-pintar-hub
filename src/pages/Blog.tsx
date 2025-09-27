import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample blog posts for demo
  const samplePosts = [
    {
      id: '1',
      title: 'Tips Belajar Matematika yang Efektif untuk Anak SD',
      slug: 'tips-belajar-matematika-sd',
      excerpt: 'Matematika sering dianggap pelajaran yang sulit. Berikut tips praktis untuk membantu anak SD belajar matematika dengan menyenangkan.',
      content: '',
      featured_image_url: '/placeholder.svg',
      author_name: 'Admin',
      created_at: new Date().toISOString(),
      tags: ['matematika', 'sd', 'tips']
    },
    {
      id: '2',
      title: 'Persiapan UN SMA: Strategi Belajar yang Terbukti Efektif',
      slug: 'persiapan-un-sma',
      excerpt: 'Ujian Nasional SMA membutuhkan persiapan yang matang. Pelajari strategi belajar yang telah terbukti meningkatkan nilai siswa.',
      content: '',
      featured_image_url: '/placeholder.svg',
      author_name: 'Dr. Sari Wijaya',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      tags: ['ujian', 'sma', 'strategi']
    },
    {
      id: '3',
      title: 'Mengapa Les Privat Lebih Efektif dari Bimbel Reguler?',
      slug: 'les-privat-vs-bimbel',
      excerpt: 'Perbandingan antara les privat dan bimbingan belajar reguler. Simak keunggulan dan kelemahan masing-masing metode pembelajaran.',
      content: '',
      featured_image_url: '/placeholder.svg',
      author_name: 'Prof. Ahmad Rahman',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      tags: ['les privat', 'bimbel', 'perbandingan']
    },
    {
      id: '4',
      title: 'Cara Memilih Guru Les Privat yang Tepat untuk Anak',
      slug: 'memilih-guru-les-privat',
      excerpt: 'Memilih guru les privat yang tepat sangat penting untuk kesuksesan belajar anak. Berikut panduan lengkap untuk orang tua.',
      content: '',
      featured_image_url: '/placeholder.svg',
      author_name: 'Ibu Rina Sari',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      tags: ['guru', 'orang tua', 'tips']
    }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!blog_posts_author_id_fkey(full_name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Use sample posts if no data from database
      setPosts(data && data.length > 0 ? data : samplePosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Blog Edukasi
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Artikel, tips, dan panduan terlengkap seputar pendidikan dan belajar
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Cari artikel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={post.featured_image_url || '/placeholder.svg'} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.created_at)}
                      <User className="h-4 w-4 ml-4 mr-1" />
                      {post.profiles?.full_name || post.author_name || 'Admin'}
                    </div>
                    
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    
                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Button variant="outline" className="w-full">
                      Baca Selengkapnya
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada artikel yang ditemukan.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Kategori Artikel</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Tips Belajar', count: 12, color: 'bg-blue-500' },
              { name: 'Persiapan Ujian', count: 8, color: 'bg-green-500' },
              { name: 'Metode Pembelajaran', count: 6, color: 'bg-purple-500' },
              { name: 'Panduan Orang Tua', count: 10, color: 'bg-orange-500' }
            ].map((category) => (
              <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg`}>
                    {category.count}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-muted-foreground text-sm">{category.count} artikel</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;