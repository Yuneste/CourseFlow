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
import { 
  FileOrganizationDemo, 
  CollaborationDemo, 
  ResourceRecommendationDemo,
  AIAssistantDemo,
  CloudStorageDemo,
  DeadlineTrackerDemo,
  ProgressTrackerDemo 
} from '@/components/features/onboarding/BenefitsShowcaseAnimated';
import { UnifiedBackground, UnifiedCard } from '@/components/ui/unified-background';
import { EducationalPattern } from '@/components/ui/educational-pattern';
import { AcademicStars } from '@/components/ui/academic-stars';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(true);

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
    },
    {
      icon: Brain,
      title: "AI-Powered Assistant",
      description: "Get instant answers and personalized study support 24/7",
      Demo: AIAssistantDemo
    },
    {
      icon: FolderOpen,
      title: "Access Anywhere",
      description: "Your files sync across all devices - laptop, phone, or tablet",
      Demo: CloudStorageDemo
    },
    {
      icon: Calendar,
      title: "Never Miss Deadlines",
      description: "Track assignments and get smart reminders before due dates",
      Demo: DeadlineTrackerDemo
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Visualize your academic performance and study patterns",
      Demo: ProgressTrackerDemo
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
      name: "Explorer",
      price: "€0",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ["3 courses", "Basic file organization", "500MB storage", "10 AI summaries/month", "Join 1 study group"],
      highlighted: false,
      paymentLink: null
    },
    {
      name: "Scholar",
      price: isYearly ? "€8" : "€10",
      monthlyPrice: 10,
      yearlyPrice: 96,
      period: "/month",
      features: ["Unlimited courses", "AI-powered organization", "5GB storage", "100 AI summaries/month", "Join 5 study groups", "Document annotation", "Progress tracking"],
      highlighted: true,
      paymentLink: isYearly 
        ? "https://buy.stripe.com/test_28E6oH3wYfrecgl9HP9sk01"
        : "https://buy.stripe.com/test_dRmeVdc3ucf2cgl2fn9sk00"
    },
    {
      name: "Master",
      price: isYearly ? "€20" : "€25",
      monthlyPrice: 25,
      yearlyPrice: 240,
      period: "/month",
      features: ["Everything in Scholar", "50GB storage", "500 AI summaries/month", "Unlimited study groups", "Priority AI processing", "Advanced analytics", "Priority support"],
      paymentLink: isYearly 
        ? "https://buy.stripe.com/test_8x23cv9Vmdj6eot1bj9sk03"
        : "https://buy.stripe.com/test_aFa4gzgjK0wk6W16vD9sk02",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-black relative">
      {/* Starry Academic Background for Hero Section */}
      <div className="absolute inset-0 h-[100vh]">
        <AcademicStars />
        {/* Gradient fade overlay at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-black" />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">
                CourseFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-white/70 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors">Pricing</a>
              <Link href="/login">
                <Button variant="outline" className="mr-2">Log In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
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
        <motion.div
          initial={false}
          animate={mobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          className="md:hidden bg-black/90 border-t border-white/10"
          style={{ display: mobileMenuOpen ? 'block' : 'none' }}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a href="#features" className="block text-white/70 hover:text-white">Features</a>
            <a href="#testimonials" className="block text-white/70 hover:text-white">Testimonials</a>
            <a href="#pricing" className="block text-white/70 hover:text-white">Pricing</a>
            <Link href="/login" className="block w-full">
              <Button variant="outline" className="w-full">Log In</Button>
            </Link>
            <Link href="/register" className="block w-full">
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        </motion.div>
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
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
                Start Free Trial
                <Sparkles className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
            </Link>
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
      <section id="features" className="relative py-12 md:py-20 px-4 bg-black">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              Features that Power Your
              <span className="text-primary font-extrabold"> Success</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto px-4">
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
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-base sm:text-lg text-white/90 mb-4 sm:mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-white">Automatic organization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-white">Real-time collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-white">AI-powered insights</span>
                    </li>
                  </ul>
                </div>
                <div className="flex-1 max-w-2xl w-full">
                  <div className="bg-card rounded-xl shadow-[0_0_50px_rgba(140,194,190,0.8)] hover:shadow-[0_0_60px_rgba(140,194,190,1)] transition-shadow duration-300 p-4 sm:p-6 md:p-8 overflow-hidden border border-border">
                    <feature.Demo />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              Students Love
              <span className="text-primary font-extrabold"> CourseFlow</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/90">
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
      <section id="pricing" className="py-12 md:py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              Simple, Transparent
              <span className="text-primary font-extrabold"> Pricing</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-6">
              Choose the plan that fits your needs
            </p>
            
            {/* Monthly/Yearly Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-lg ${!isYearly ? 'text-white font-semibold' : 'text-white/60'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-16 h-8 bg-white/20 rounded-full transition-colors hover:bg-white/30"
              >
                <motion.div
                  className="absolute top-1 left-1 w-6 h-6 bg-primary rounded-full"
                  animate={{ x: isYearly ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-lg ${isYearly ? 'text-white font-semibold' : 'text-white/60'}`}>
                Yearly
              </span>
              <motion.span
                initial={false}
                animate={isYearly ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-semibold"
                style={{ display: isYearly ? 'inline-block' : 'none' }}
              >
                Save 20%
              </motion.span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-xl p-8 flex flex-col ${
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
                  <div 
                    className={`text-sm mt-2 ${plan.highlighted ? 'text-white/60' : 'text-muted-foreground'}`}
                    style={{ display: isYearly && plan.monthlyPrice > 0 ? 'block' : 'none' }}
                  >
                    €{plan.yearlyPrice} billed annually
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className={`h-5 w-5 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} />
                      <span className={plan.highlighted ? 'text-white' : 'text-foreground'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.paymentLink ? (
                  <a href={plan.paymentLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button 
                      className={`w-full ${
                        plan.highlighted 
                          ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      Get Started
                    </Button>
                  </a>
                ) : (
                  <Link href="/register" className="block">
                    <Button 
                      className={`w-full ${
                        plan.highlighted 
                          ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      Start Free
                    </Button>
                  </Link>
                )}
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
          <Link href="/register">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
              Start Your Free Trial
              <Sparkles className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 bg-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-white" />
                <span className="text-xl font-bold text-white">CourseFlow</span>
              </div>
              <p className="text-gray-400">
                Your academic success, simplified.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CourseFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}