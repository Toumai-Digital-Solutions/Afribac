"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, GraduationCap, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Accueil", id: "hero" },
    { name: "Fonctionnalités", id: "features" },
    { name: "Témoignages", id: "testimonials" },
    { name: "Pays", id: "countries" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors"
            >
              <BookOpen className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Afribac
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="hover:bg-primary/10">
                Connexion
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="  hover:opacity-90 transition-opacity">
                <GraduationCap className="h-4 w-4 mr-2" />
                S&apos;inscrire
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 py-4 border-t border-border"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-left text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    {link.name}
                  </button>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Link href="/auth/signin">
                    <Button variant="outline" className="w-full">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      S&apos;inscrire
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
