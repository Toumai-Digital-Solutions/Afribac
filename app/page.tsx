import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Users, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Afribac
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plateforme éducative collaborative pour la préparation du baccalauréat africain
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                <GraduationCap className="h-5 w-5" />
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Pour les Étudiants</CardTitle>
              <CardDescription>
                Accédez aux cours et quiz adaptés à votre pays et série
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Cours par série (S1, S2, L1, L2, ES)</li>
                <li>✅ Quiz interactifs</li>
                <li>✅ Simulations d'examens</li>
                <li>✅ Suivi de progression</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Pour les Collaborateurs</CardTitle>
              <CardDescription>
                Créez et gérez les contenus de votre pays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Création collaborative de cours</li>
                <li>✅ Gestion des étudiants locaux</li>
                <li>✅ Upload de PDFs et vidéos</li>
                <li>✅ Analytics par pays</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Administration</CardTitle>
              <CardDescription>
                Supervision globale de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Gestion multi-pays</li>
                <li>✅ Attribution des rôles</li>
                <li>✅ Analytics globales</li>
                <li>✅ Modération de contenus</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Countries */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Pays supportés</h2>
          <div className="flex justify-center gap-8 text-4xl">
            <span title="Sénégal">🇸🇳</span>
            <span title="Côte d'Ivoire">🇨🇮</span>
            <span title="Mali">🇲🇱</span>
            <span title="Burkina Faso">🇧🇫</span>
            <span title="Niger">🇳🇪</span>
          </div>
          <p className="text-muted-foreground">
            Contenus adaptés aux programmes scolaires locaux
          </p>
        </div>
      </div>
    </div>
  );
}
