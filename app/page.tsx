"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Users, Globe, Sparkles, Trophy, Target, CheckCircle, ArrowRight, Play, Star, Quote } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { AnimatedText, FadeInText } from "@/components/ui/fade-in-text";
import { Meteors } from "@/components/ui/meteors";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { StatsCounter } from "@/components/ui/stats-counter";
import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FloatingParticles,
  GeometricShapes,
  MovingGradientBackground,
  FloatingIcons,
  WaveAnimation,
  GridPattern
} from "@/components/ui/animated-background";

interface Country {
  id: string;
  name: string;
  code: string;
  flag_url: string;
  is_supported: boolean;
  display_order: number;
}

const HeroSection = () => {
  const words = [
    { text: "Réussis" },
    { text: "ton" },
    { text: "bac", className: "text-blue-500 dark:text-blue-400" },
    { text: "avec" },
    { text: "mention", className: "text-purple-500 dark:text-purple-400" },
    { text: "cette", className: "text-orange-500 dark:text-orange-400" },
    { text: "année" },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Layers */}
      <MovingGradientBackground />
      <GridPattern />
      <FloatingParticles />
      <GeometricShapes />
      <FloatingIcons />
      <WaveAnimation />
      
      {/* Spotlight Effect */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      {/* Background Beams */}
      <BackgroundBeams className="absolute inset-0" />
      
      {/* Meteors */}
      <Meteors number={40} />

      {/* Hero Content */}
      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Animated Badge */}
        <div className="flex justify-center mb-6">
          <AnimatedGradientText>
            🏆 Plus de 2000 élèves ont déjà réussi leur bac avec nous
          </AnimatedGradientText>
        </div>

        {/* Logo with Animation */}
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-primary/10 rounded-2xl animate-float">
            <BookOpen className="h-20 w-20 text-primary animate-pulse-glow" />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
          Afribac
        </h1>

        {/* Animated Subtitle */}
        <div className="w-full max-w-4xl mx-auto px-4">
          <AnimatedText words={words} className="my-8" />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link href="/auth/signup">
            <Button size="lg" className="group gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <GraduationCap className="h-5 w-5" />
              Commencer gratuitement
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg" className="group border-2 hover:bg-primary/5 transform hover:scale-105 transition-all duration-300">
              <Play className="h-4 w-4 mr-2" />
              Regarder la démo
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-300 group">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-primary mb-2">
              <StatsCounter end={2000} suffix="+" />
            </div>
            <p className="text-sm text-muted-foreground">Élèves de Terminale</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-300 group">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-primary mb-2">
              <StatsCounter end={97} suffix="%" />
            </div>
            <p className="text-sm text-muted-foreground">Taux de réussite au Bac</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-300 group">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-3xl font-bold text-primary mb-2">
              <StatsCounter end={5000} suffix="+" />
            </div>
            <p className="text-sm text-muted-foreground">Exercices corrigés</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <GraduationCap className="h-10 w-10 text-blue-600" />,
      title: "Pour les Élèves de Terminale",
      description: "Tout ce dont tu as besoin pour réussir ton baccalauréat",
      features: [
        "📚 Cours complets par série (S, L, ES)",
        "✏️ 5000+ Exercices corrigés et expliqués",
        "📋 Sujets d'examens des 10 dernières années",
        "⏱️ Simulations d'épreuves en temps réel",
        "📅 Planning de révisions intelligent",
        "📈 Suivi détaillé de tes performances",
        "🎯 Conseils personnalisés selon tes lacunes",
        "💬 Aide communautaire entre élèves"
      ],
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/20 hover:border-blue-500/50"
    },
    {
      icon: <Users className="h-10 w-10 text-purple-600" />,
      title: "Enseignants & Collaborateurs",
      description: "Partagez votre expertise et aidez la prochaine génération",
      features: [
        "✍️ Créez des contenus de qualité",
        "🎓 Partagez vos méthodes pédagogiques",
        "🤝 Accompagnez les élèves de votre région",
        "👥 Collaborez avec d'autres enseignants",
        "📊 Analytics sur l'impact de vos cours",
        "💰 Rémunération pour vos contributions",
        "🏆 Reconnaissance de votre expertise",
        "🌍 Impact positif sur l'éducation africaine"
      ],
      gradient: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/20 hover:border-purple-500/50"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      {/* Background Animation */}
      <FloatingParticles />
      <WaveAnimation />
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="flex justify-center mb-6">
            <AnimatedGradientText>
              🎯 Conçu pour les élèves de Terminale
            </AnimatedGradientText>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Ta réussite, notre mission
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des milliers d&apos;élèves ont déjà transformé leurs résultats grâce à notre méthode. 
            Rejoins-les et décroche ton bac avec mention !
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className={`relative overflow-hidden group transform hover:scale-105 transition-all duration-500 ${feature.borderColor} hover:shadow-2xl border-2`}>
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Meteors for each card */}
              <Meteors number={3} />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-background/50 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <Sparkles className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <ul className="space-y-3">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Aminata Touré",
      location: "Dakar, Sénégal",
      series: "Série S",
      grade: "Mention Très Bien",
      content: "Grâce à Afribac, j'ai pu réviser efficacement et comprendre les concepts difficiles en maths et physique. Les exercices corrigés m'ont vraiment aidée !",
      avatar: "AT",
      rating: 5
    },
    {
      name: "Moussa Konaté",
      location: "Abidjan, Côte d'Ivoire",
      series: "Série L",
      grade: "Mention Bien",
      content: "Les cours de français et philosophie sur Afribac sont excellents. J'ai progressé de 8 points en moyenne grâce aux méthodes enseignées.",
      avatar: "MK",
      rating: 5
    },
    {
      name: "Fatoumata Diallo",
      location: "Bamako, Mali",
      series: "Série ES",
      grade: "Mention Assez Bien",
      content: "La plateforme est intuitive et les quiz m'ont permis de m'auto-évaluer. Je recommande vivement Afribac à tous les élèves de Terminale !",
      avatar: "FD",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 px-4 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
      {/* Background Enhancements */}
      <GeometricShapes />
      <FloatingIcons className="opacity-30" />
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <AnimatedGradientText>
            💬 Témoignages
          </AnimatedGradientText>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Ils ont réussi avec Afribac
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvre les histoires de réussite de nos élèves qui ont décroché leur baccalauréat
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden group hover:scale-105 transition-all duration-500 hover:shadow-xl border-2 hover:border-primary/50">
              <Meteors number={2} />
              
              <CardContent className="p-6 relative z-10">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    <p className="text-sm text-primary font-medium">{testimonial.series} • {testimonial.grade}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      title: "Inscription gratuite",
      description: "Crée ton compte en quelques secondes pour accéder à toutes les ressources.",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Choisis ta série",
      description: "Accède aux cours et exercices spécifiques à ta série (S, L, ES).",
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Pratique intensive",
      description: "Entraîne-toi avec des milliers d'exercices corrigés et des anciens sujets.",
      icon: <Target className="h-8 w-8 text-orange-500" />,
      color: "from-orange-500/20 to-red-500/20"
    },
    {
      title: "Réussis ton Bac",
      description: "Suis tes progrès et arrive serein le jour de l'examen.",
      icon: <Trophy className="h-8 w-8 text-green-500" />,
      color: "from-green-500/20 to-emerald-500/20"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <AnimatedGradientText>
            🚀 Comment ça marche ?
          </AnimatedGradientText>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Ta route vers le succès
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative p-8 rounded-2xl border border-border bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 h-full">
                <div className="mb-6 p-4 rounded-xl bg-background inline-block shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                <div className="absolute top-8 right-8 text-4xl font-black text-muted/10">
                  0{index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: "Est-ce que l'accès est gratuit ?",
      answer: "Oui, l'inscription et une grande partie des ressources de base sont gratuites. Nous proposons également des options premium pour un accompagnement plus personnalisé."
    },
    {
      question: "Quelles séries sont supportées ?",
      answer: "Afribac couvre actuellement les séries S (Scientifique), L (Littéraire) et ES (Économique et Sociale) pour le niveau Terminale."
    },
    {
      question: "Puis-je utiliser Afribac sur mon téléphone ?",
      answer: "Absolument ! La plateforme est entièrement 'responsive' et s'adapte parfaitement aux smartphones et tablettes pour te permettre de réviser partout."
    },
    {
      question: "Les exercices sont-ils vraiment corrigés ?",
      answer: "Oui, tous nos exercices et anciens sujets d'examen sont accompagnés de corrections détaillées et expliquées par des professeurs expérimentés."
    },
    {
      question: "Comment puis-je suivre ma progression ?",
      answer: "Ton tableau de bord personnel affiche tes statistiques par matière, tes scores aux quiz et tes points forts/faibles."
    }
  ];

  return (
    <section id="faq" className="py-24 px-4 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <AnimatedGradientText>
            ❓ Questions fréquentes
          </AnimatedGradientText>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            On répond à tes questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl bg-background px-6">
              <AccordionTrigger className="text-left font-semibold py-6 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <BackgroundBeams />
      <FloatingParticles />
      <GeometricShapes />
      <WaveAnimation />
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <AnimatedGradientText>
              🚀 Prêt à commencer ?
            </AnimatedGradientText>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
            Prêt à décrocher ton bac avec mention ?
          </h2>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Plus de 2000 élèves ont déjà transformé leurs résultats avec notre méthode éprouvée. 
            Rejoins-les et commence ta préparation intensive dès maintenant !
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="group gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 px-8 py-6 text-lg">
                <GraduationCap className="h-6 w-6" />
                Commencer ma préparation
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="group border-2 hover:bg-primary/5 transform hover:scale-105 transition-all duration-300 px-8 py-6 text-lg backdrop-blur-sm">
                J&apos;ai déjà un compte
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Inscription gratuite</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Aucune carte bancaire requise</span>
        </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Accès immédiat</span>
        </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative">
        {/* Global Background Animation */}
        <div className="fixed inset-0 pointer-events-none">
          <GridPattern className="opacity-20" />
        </div>
        
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
    </div>
      <Footer />
    </>
  );
}