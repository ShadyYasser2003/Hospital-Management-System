import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import departmentService from '@/services/departmentService';
import {
  Building2,
  Stethoscope,
  Calendar,
  Users,
  Shield,
  Clock,
  HeartPulse,
  Activity,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import heroImg from '@/assets/hero-hospital.jpg';
import doctorPatientImg from '@/assets/doctor-patient.jpg';
import medicalTeamImg from '@/assets/medical-team.jpg';

const services = [
  {
    icon: Stethoscope,
    title: 'Expert Medical Care',
    description: 'Access to highly qualified specialists across 20+ departments for comprehensive diagnosis and treatment.',
  },
  {
    icon: Calendar,
    title: 'Easy Appointments',
    description: 'Book, reschedule and manage appointments online — anytime, from any device.',
  },
  {
    icon: HeartPulse,
    title: 'Patient Records',
    description: 'Secure, centralised electronic health records accessible to authorised staff instantly.',
  },
  {
    icon: Shield,
    title: 'Insurance Support',
    description: 'Seamless insurance claim processing and coverage verification for all major providers.',
  },
  {
    icon: Activity,
    title: 'Lab & Diagnostics',
    description: 'State-of-the-art testing facilities with fast, accurate digital reports.',
  },
  {
    icon: Clock,
    title: '24/7 Emergency',
    description: 'Round-the-clock emergency services staffed by experienced trauma care teams.',
  },
];

const whyUs = [
  'Board-certified specialists across all major disciplines',
  'Advanced diagnostic & imaging technology',
  'Integrated electronic health records',
  'Patient-first, compassionate care philosophy',
  'ISO-accredited facilities and processes',
];

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();

  // Real department names from public API (no auth required)
  const { data: depts = [] } = useQuery({
    queryKey: ['departments-public'],
    queryFn: departmentService.getAll,
    retry: false,
  });

  const stats = [
    { value: '200+', label: 'Healthcare Staff' },
    { value: '10K+', label: 'Patients Served'  },
    { value: depts.length > 0 ? `${depts.length}+` : '20+', label: 'Departments' },
    { value: '24/7', label: 'Emergency Care'   },
  ];

  const departmentNames = depts.length > 0
    ? depts.map(d => d.name)
    : ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
       'Emergency', 'Radiology', 'Oncology', 'Dermatology',
       'Pediatrics', 'Gynecology'];
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-base font-bold leading-none">MediCore</p>
              <p className="text-xs text-muted-foreground mt-0.5">Hospital Management System</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#departments" className="hover:text-foreground transition-colors">Departments</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Link to="/login">
              <Button className="gap-2">
                Login <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src={heroImg}
          alt="Hospital corridor"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--sidebar-background)/0.92)] via-[hsl(var(--sidebar-background)/0.75)] to-[hsl(var(--sidebar-background)/0.2)]" />

        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <HeartPulse className="h-3.5 w-3.5" />
              Modern Healthcare Management
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white mb-6">
              Transforming <br />
              <span className="text-primary">Healthcare</span> Delivery
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              A fully integrated hospital management solution — from patient registration
              and appointments to billing, pharmacy, and analytics — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-7 py-6">
                  <Users className="h-5 w-5" /> Staff Portal
                </Button>
              </Link>
              <Link to="/login?type=patient">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base px-7 py-6 border-white/40 text-white hover:bg-white/10 bg-white/5">
                  Patient Login <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-extrabold text-primary">{s.value}</p>
                <p className="text-muted-foreground mt-1 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Comprehensive Healthcare Services</h2>
            <p className="text-muted-foreground mt-4">
              Powered by our advanced HMS, every service is designed to put patients first.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{svc.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{svc.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About / Why Us ── */}
      <section id="about" className="py-24 px-4 bg-muted/40">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Image stack */}
            <div className="relative">
              <img
                src={doctorPatientImg}
                alt="Doctor with patient"
                className="rounded-2xl w-full object-cover shadow-xl max-h-[440px]"
              />
              <div className="absolute -bottom-6 -right-4 lg:-right-8 w-52 h-44 rounded-2xl overflow-hidden border-4 border-background shadow-xl hidden sm:block">
                <img
                  src={medicalTeamImg}
                  alt="Medical team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:pl-4">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Why Choose Us</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Patient-Centred Care <br /> Backed by Technology
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Our hospital management system unifies clinical workflows, administrative tasks, 
                and financial operations so your team can focus on what matters most — delivering 
                outstanding patient outcomes.
              </p>
              <ul className="space-y-3 mb-10">
                {whyUs.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Departments ── */}
      <section id="departments" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Our Departments</p>
            <h2 className="text-3xl md:text-4xl font-bold">Specialised Medical Departments</h2>
            <p className="text-muted-foreground mt-4">
              Covering a wide range of medical specialities with expert teams in each.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {departmentNames.map((dept) => (
              <div
                key={dept}
                className="bg-card border border-border rounded-full px-6 py-2.5 text-sm font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-default"
              >
                {dept}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Streamline Your Hospital Operations?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-10">
            Join thousands of healthcare professionals using MediCore to deliver better care, faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" variant="secondary" className="gap-2 px-8 text-base">
                <Users className="h-5 w-5" /> Staff Login
              </Button>
            </Link>
            <Link to="/login?type=patient">
              <Button size="lg" variant="outline" className="gap-2 px-8 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                Patient Portal <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] pt-16 pb-8 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">MediCore</span>
              </div>
              <p className="text-sm text-[hsl(var(--sidebar-foreground)/0.6)] leading-relaxed">
                A modern, integrated hospital management system designed to improve efficiency and patient care.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p className="font-semibold mb-4 text-sm uppercase tracking-widest text-[hsl(var(--sidebar-primary))]">Quick Links</p>
              <ul className="space-y-2 text-sm text-[hsl(var(--sidebar-foreground)/0.7)]">
                {['Services', 'About', 'Departments', 'Contact'].map(l => (
                  <li key={l}>
                    <a href={`#${l.toLowerCase()}`} className="hover:text-[hsl(var(--sidebar-primary))] transition-colors flex items-center gap-1">
                      <ChevronRight className="h-3.5 w-3.5" /> {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="font-semibold mb-4 text-sm uppercase tracking-widest text-[hsl(var(--sidebar-primary))]">Contact</p>
              <ul className="space-y-3 text-sm text-[hsl(var(--sidebar-foreground)/0.7)]">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary shrink-0" /> +1 (800) 123-4567</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary shrink-0" /> info@medicore.com</li>
                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 123 Medical Centre Drive, Health City, HC 00100</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[hsl(var(--sidebar-border))] pt-6 text-center text-xs text-[hsl(var(--sidebar-foreground)/0.4)]">
            © {new Date().getFullYear()} MediCore Hospital Management System. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
