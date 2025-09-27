import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const Pricing = () => {
  const pricingData = [
    {
      subject: 'Matematika',
      levels: [
        { level: 'SD', price: 'Rp 50.000', duration: '1 jam' },
        { level: 'SMP', price: 'Rp 65.000', duration: '1 jam' },
        { level: 'SMA', price: 'Rp 80.000', duration: '1 jam' },
        { level: 'Kuliah', price: 'Rp 100.000', duration: '1 jam' },
      ]
    },
    {
      subject: 'Fisika',
      levels: [
        { level: 'SMP', price: 'Rp 70.000', duration: '1 jam' },
        { level: 'SMA', price: 'Rp 85.000', duration: '1 jam' },
        { level: 'Kuliah', price: 'Rp 110.000', duration: '1 jam' },
      ]
    },
    {
      subject: 'Kimia',
      levels: [
        { level: 'SMP', price: 'Rp 70.000', duration: '1 jam' },
        { level: 'SMA', price: 'Rp 85.000', duration: '1 jam' },
        { level: 'Kuliah', price: 'Rp 110.000', duration: '1 jam' },
      ]
    },
    {
      subject: 'Bahasa Inggris',
      levels: [
        { level: 'SD', price: 'Rp 55.000', duration: '1 jam' },
        { level: 'SMP', price: 'Rp 70.000', duration: '1 jam' },
        { level: 'SMA', price: 'Rp 85.000', duration: '1 jam' },
        { level: 'Kuliah', price: 'Rp 100.000', duration: '1 jam' },
      ]
    }
  ];

  const packages = [
    {
      name: 'Paket Trial',
      sessions: '1 Sesi',
      price: 'Sesuai tarif guru',
      features: [
        'Bisa refund jika tidak cocok',
        'Konsultasi gratis',
        'Fleksibilitas waktu'
      ]
    },
    {
      name: 'Paket Reguler',
      sessions: '4 Sesi',
      price: 'Diskon 5%',
      features: [
        'Jadwal tetap',
        'Progress report',
        'Konsultasi berkala',
        'Materi pembelajaran'
      ],
      popular: true
    },
    {
      name: 'Paket Intensif',
      sessions: '8 Sesi',
      price: 'Diskon 10%',
      features: [
        'Jadwal fleksibel',
        'Progress report detail',
        'Konsultasi intensif',
        'Materi & latihan soal',
        'Support via WhatsApp'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Biaya Les Privat
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tarif yang transparan dan terjangkau untuk semua mata pelajaran dan tingkat pendidikan
          </p>
        </div>
      </section>

      {/* Pricing by Subject */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Tarif per Mata Pelajaran</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {pricingData.map((subject) => (
              <Card key={subject.subject} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-center text-primary">
                    {subject.subject}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subject.levels.map((level) => (
                      <div key={level.level} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">{level.level}</span>
                        <div className="text-right">
                          <div className="font-bold text-primary">{level.price}</div>
                          <div className="text-sm text-muted-foreground">per {level.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Package Pricing */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Paket Pembelajaran</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.name} className={`relative hover:shadow-lg transition-all ${pkg.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Paling Populer
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{pkg.sessions}</div>
                  <div className="text-lg text-muted-foreground">{pkg.price}</div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    Pilih Paket
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Informasi Tambahan</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    Kebijakan Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Pembayaran dilakukan setelah les selesai</li>
                    <li>• Metode pembayaran: Transfer bank, E-wallet</li>
                    <li>• Biaya transportasi guru sudah termasuk</li>
                    <li>• Tidak ada biaya pendaftaran</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    Ketentuan Les
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Durasi minimal 1 jam per sesi</li>
                    <li>• Pembatalan maksimal H-2</li>
                    <li>• Reschedule gratis 1x per bulan</li>
                    <li>• Garansi penggantian guru jika tidak cocok</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;