'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  Link as LinkIcon, 
  Brain, 
  FolderOpen, 
  Calendar, 
  TrendingUp,
  Star,
  Check,
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { FileOrganizationDemo, CollaborationDemo, ResourceRecommendationDemo } from '@/components/features/onboarding/BenefitsShowcaseAnimated';
import { UnifiedBackground, UnifiedCard } from '@/components/ui/unified-background';
import { EducationalPattern } from '@/components/ui/educational-pattern';
import { AcademicStars } from '@/components/ui/academic-stars';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FileText,
      title: "Smart File Organization",
      description: "AI automatically organizes your study materials by course",
      Demo: FileOrganizationDemo
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Collaborate with classmates in real-time",
      Demo: CollaborationDemo
    },
    {
      icon: LinkIcon,
      title: "Resource Recommendations",
      description: "Get personalized learning resources for your courses",
      Demo: ResourceRecommendationDemo
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content: "CourseFlow completely transformed how I organize my studies. My GPA went from 2.8 to 3.6!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Engineering Major",
      content: "The collaboration features are amazing. My study group uses it daily to share notes and prep for exams.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Pre-Med Student",
      content: "The AI assistant helps me understand complex topics quickly. It's like having a tutor available 24/7.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      features: ["5 courses", "Basic file organization", "1GB storage", "Community support"],
      highlighted: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      features: ["Unlimited courses", "AI-powered organization", "100GB storage", "Study groups", "Priority support", "Advanced analytics"],
      highlighted: true
    },
    {
      name: "Team",
      price: "$19.99",
      period: "/month",
      features: ["Everything in Pro", "Unlimited collaborators", "500GB storage", "Admin controls", "API access", "Custom integrations"],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-black relative">
      {/* Starry Academic Background for Hero Section */}
      <div className="absolute inset-0 h-[100vh]">
        <AcademicStars />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                CourseFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-white/70 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors">Pricing</a>
              <Button variant="outline" className="mr-2" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-black/90 border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <a href="#features" className="block text-white/70 hover:text-white">Features</a>
              <a href="#testimonials" className="block text-white/70 hover:text-white">Testimonials</a>
              <a href="#pricing" className="block text-white/70 hover:text-white">Pricing</a>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" className="block">Log In</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/register" className="block">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 min-h-screen flex items-center">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-white"
          >
            Your Academic Success
            <br />
            <span className="text-primary font-extrabold">
              Simplified
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 md:mb-8 max-w-3xl mx-auto px-4"
          >
            The all-in-one platform that organizes your courses, powers your study sessions, 
            and helps you achieve better grades with AI assistance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 justify-center mb-8"
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto" asChild>
              <Link href="/register">
                Start Free Trial
                <Sparkles className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Link>
            </Button>
            <Button size="lg" className="border-2 border-primary bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 hover:border-primary/80 transition-all px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto" onClick={() => {
              const element = document.getElementById('features');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}>
              See Features
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            No credit card required • 14-day free trial • Cancel anytime
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-12 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Features that Power Your
              <span className="text-primary font-extrabold"> Success</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground/90 max-w-3xl mx-auto px-4">
              See how CourseFlow transforms your academic journey with intelligent features
            </p>
          </div>

          <div className="space-y-12 md:space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 md:gap-12`}
              >
                <div className="flex-1 max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 sm:h-8 w-6 sm:w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-base sm:text-lg text-foreground/90 mb-4 sm:mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-foreground">Automatic organization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-foreground">Real-time collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-foreground">AI-powered insights</span>
                    </li>
                  </ul>
                </div>
                <div className="flex-1 max-w-2xl w-full">
                  <div className="bg-card rounded-xl shadow-xl p-4 sm:p-6 md:p-8 overflow-hidden border border-border">
                    <feature.Demo />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Students Love
              <span className="text-primary font-extrabold"> CourseFlow</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground/90">
              Join thousands of students achieving their academic goals
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-lg p-6 border border-border"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Simple, Transparent
              <span className="text-primary font-extrabold"> Pricing</span>
            </h2>
            <p className="text-lg sm:text-xl text-foreground/90">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-xl p-8 ${
                  plan.highlighted 
                    ? 'bg-primary text-primary-foreground shadow-2xl scale-105 border-2 border-primary' 
                    : 'bg-card shadow-lg border border-border'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>{plan.name}</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>{plan.price}</span>
                  {plan.period && <span className={`text-lg ${plan.highlighted ? 'text-white/80' : 'text-foreground/90'}`}>{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className={`h-5 w-5 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} />
                      <span className={plan.highlighted ? 'text-white' : 'text-foreground'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  asChild
                >
                  <Link href="/register">
                    Get Started
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 md:mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of students who are already achieving better grades with CourseFlow
          </p>
          <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg" asChild>
            <Link href="/register">
              Start Your Free Trial
              <Sparkles className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6" />
                <span className="text-xl font-bold">CourseFlow</span>
              </div>
              <p className="text-muted-foreground">
                Your academic success, simplified.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CourseFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}