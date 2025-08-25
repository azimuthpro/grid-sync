import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  BarChart3, 
  MapPin, 
  Bot, 
  FileText, 
  Sun,
  Check,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">GridSync</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Zaloguj się
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Zarejestruj się
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sun className="h-4 w-4" />
              <span>Dla prosumentów energii słonecznej</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              GridSync
            </span>
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-muted-foreground">
            Zarządzanie Bilansem Energetycznym
            <br />
            <span className="text-foreground">dla Prosumentów</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Aplikacja desktopowa automatyzująca obliczenia bilansu energetycznego 
            z instalacji fotowoltaicznych i generująca raporty dla operatorów sieci.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-4 h-auto">
                Rozpocznij za darmo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
                Mam już konto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Wszystko czego potrzebujesz</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Kompletne narzędzie do zarządzania instalacjami fotowoltaicznymi i optymalizacji zużycia energii
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <MapPin className="h-12 w-12 text-primary mb-6" />
              <h4 className="text-xl font-semibold mb-4">Zarządzanie wieloma lokalizacjami</h4>
              <p className="text-muted-foreground">
                Zarządzaj wieloma instalacjami PV z różnymi konfiguracjami. 
                Każda lokalizacja z własnymi parametrami i profilem zużycia.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <BarChart3 className="h-12 w-12 text-primary mb-6" />
              <h4 className="text-xl font-semibold mb-4">Profile zużycia energii</h4>
              <p className="text-muted-foreground">
                Definiuj 168-punktowe tygodniowe wzorce zużycia (7 dni × 24 godziny). 
                Wizualny edytor siatki do łatwej konfiguracji.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <FileText className="h-12 w-12 text-primary mb-6" />
              <h4 className="text-xl font-semibold mb-4">Automatyczne raporty</h4>
              <p className="text-muted-foreground">
                Generuj raporty CSV z prognozami bilansu energetycznego. 
                Połącz szacunki produkcji PV z wzorcami zużycia.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <Bot className="h-12 w-12 text-primary mb-6" />
              <h4 className="text-xl font-semibold mb-4">Asystent AI</h4>
              <p className="text-muted-foreground">
                Otrzymuj spersonalizowane porady dotyczące optymalizacji energii. 
                Zadawaj pytania o wzorce użytkowania energii.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <BarChart3 className="h-12 w-12 text-primary mb-6" />
              <h4 className="text-xl font-semibold mb-4">Wizualizacja danych</h4>
              <p className="text-muted-foreground">
                Interaktywne wykresy pokazujące produkcję vs zużycie energii. 
                Analiza bilansu i trendy historyczne.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <Sun className="h-12 w-12 text-primary mb-6" />
              <h4 className="text-xl font-semibold mb-4">Prognozy nasłonecznienia</h4>
              <p className="text-muted-foreground">
                Automatyczne pobieranie danych o nasłonecznieniu. 
                Dokładne prognozy produkcji energii słonecznej.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Proste i przejrzyste ceny</h3>
            <p className="text-xl text-muted-foreground">
              Wybierz plan odpowiedni dla Twojej instalacji fotowoltaicznej
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Monthly Plan */}
            <div className="bg-card border border-border rounded-lg p-8 relative">
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold mb-2">Plan Miesięczny</h4>
                <div className="text-5xl font-bold text-primary mb-2">90 PLN</div>
                <div className="text-muted-foreground">netto/miesiąc</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Do ceny należy doliczyć 23% VAT
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Nieograniczone lokalizacje PV</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Profile zużycia energii</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Automatyczne raporty CSV</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Asystent AI</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Prognozy nasłonecznienia</span>
                </li>
              </ul>
              
              <Link href="/register" className="w-full block">
                <Button className="w-full" size="lg">
                  Wybierz plan miesięczny
                </Button>
              </Link>
            </div>
            
            {/* Annual Plan */}
            <div className="bg-card border-2 border-primary rounded-lg p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Najlepszy wybór
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold mb-2">Plan Roczny</h4>
                <div className="text-5xl font-bold text-primary mb-2">900 PLN</div>
                <div className="text-muted-foreground">netto/rok</div>
                <div className="text-sm text-primary font-medium mt-1">
                  Oszczędzasz 180 PLN (2 miesiące gratis!)
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Do ceny należy doliczyć 23% VAT
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Nieograniczone lokalizacje PV</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Profile zużycia energii</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Automatyczne raporty CSV</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Asystent AI</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span>Prognozy nasłonecznienia</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span className="font-medium">2 miesiące gratis!</span>
                </li>
              </ul>
              
              <Link href="/register" className="w-full block">
                <Button className="w-full" size="lg">
                  Wybierz plan roczny
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">GridSync</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Profesjonalne zarządzanie bilansem energetycznym dla prosumentów. 
                Automatyzacja obliczeń i generowanie raportów dla operatorów sieci.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Autor:</strong> Matt Sowa &lt;sowa@hush.ai&gt;
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Konto</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Zaloguj się
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                    Zarejestruj się
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Prawne</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Warunki użytkowania
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Polityka prywatności
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 GridSync. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
