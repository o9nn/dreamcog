import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BookOpen, Image, MessageSquare, Sparkles, Users, Wand2 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gradient-text">DreamGen</span>
          </div>
          <nav className="flex items-center gap-4">
            {loading ? null : isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/library">
                  <Button variant="ghost">Library</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">AI Role-Play</span> & Story Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create immersive AI game worlds, interact with AI characters, and generate stories of any genre. 
            You define the world, steer the plot, and our AI will bring your imagination to life.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  <Wand2 className="h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                </Button>
              </a>
            )}
            <Link href="/library">
              <Button size="lg" variant="outline">
                Browse Scenarios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Creative Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Role-Play</CardTitle>
                <CardDescription>
                  Engage in immersive conversations with AI characters. Create scenarios with multiple characters and rich lore.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Story Generation</CardTitle>
                <CardDescription>
                  Generate stories with detailed plot descriptions, character definitions, and customizable writing styles.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Image className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Image Generation</CardTitle>
                <CardDescription>
                  Create stunning images with the Muse model. Use natural or tag-based prompts with style controls.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Character Library</CardTitle>
                <CardDescription>
                  Build and manage your character collection. Define personalities, backstories, and visual appearances.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Wand2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Scenario Builder</CardTitle>
                <CardDescription>
                  Create complex scenarios with character interactions, sticky messages, and narrative instructions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Advanced Controls</CardTitle>
                <CardDescription>
                  Fine-tune generation with temperature, top-p, presence penalty, and other sampling parameters.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Unleash Your Imagination?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Connect your DreamGen API key and start creating immersive stories and characters today.
          </p>
          {isAuthenticated ? (
            <Link href="/api-keys">
              <Button size="lg">Configure API Key</Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg">Get Started</Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-muted-foreground">
          <p>Powered by DreamGen API • Built for creative writers and storytellers</p>
        </div>
      </footer>
    </div>
  );
}
