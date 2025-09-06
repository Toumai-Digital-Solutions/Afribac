"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const quickLinks = [
    { name: "Accueil", action: () => scrollToSection("hero") },
    { name: "Fonctionnalités", action: () => scrollToSection("features") },
    { name: "Témoignages", action: () => scrollToSection("testimonials") },
    { name: "Pays supportés", action: () => scrollToSection("countries") },
  ];

  const supportLinks = [
    { name: "Centre d'aide", href: "/help" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Guide de démarrage", href: "/guide" },
  ];

  const legalLinks = [
    { name: "Politique de confidentialité", href: "/privacy" },
    { name: "Conditions d'utilisation", href: "/terms" },
    { name: "Mentions légales", href: "/legal" },
    { name: "Cookies", href: "/cookies" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/afribac" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/afribac" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/afribac" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/afribac" },
  ];

  const countries = [
    { name: "Sénégal", flag: "🇸🇳" },
    { name: "Côte d'Ivoire", flag: "🇨🇮" },
    { name: "Mali", flag: "🇲🇱" },
    { name: "Burkina Faso", flag: "🇧🇫" },
    { name: "Niger", flag: "🇳🇪" },
    { name: "Tchad", flag: "🇹🇩" },
  ];

  return (
    <footer className="bg-gradient-to-br from-background to-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Link href="/" className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-3 bg-primary/10 rounded-xl"
                >
                  <BookOpen className="h-8 w-8 text-primary" />
                </motion.div>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Afribac
                </span>
              </Link>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                La plateforme de référence pour réussir ton baccalauréat en Afrique. 
                Rejoins plus de 2000 élèves qui ont déjà transformé leurs résultats.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Présent dans 6 pays d&apos;Afrique de l&apos;Ouest</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>contact@afribac.com</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+212 70 048 0681</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors group"
                  >
                    <social.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-foreground">Navigation</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={link.action}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-foreground">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200 block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-foreground">Nos pays</h3>
            <ul className="space-y-3">
              {countries.map((country) => (
                <li key={country.name} className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-muted-foreground">{country.name}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Reste informé de nos nouveautés</h3>
            <p className="text-muted-foreground mb-6">
              Inscris-toi à notre newsletter pour recevoir nos conseils de révision et les dernières actualités d&apos;Afribac
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto ">
              <input
                type="email"
                placeholder="Ton adresse email"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className=" hover:opacity-90">
                S&apos;abonner
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-muted-foreground text-center md:text-left">
              © 2024 Afribac. Tous droits réservés. Fait avec ❤️ pour l&apos;éducation africaine.
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
