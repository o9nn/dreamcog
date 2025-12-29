import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BookOpen, Image, Key, MessageSquare, Plus, Users, Wand2 } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: apiKeys } = trpc.apiKeys.list.useQuery();
  const { data: chatSessions } = trpc.chat.listSessions.useQuery();
  const { data: stories } = trpc.stories.list.useQuery();
  const { data: scenarios } = trpc.scenarios.list.useQuery();
  const { data: characters } = trpc.characters.list.useQuery();

  const hasApiKey = apiKeys && apiKeys.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ""}!</h1>
          <p className="text-muted-foreground mt-1">
            Create immersive stories and role-play scenarios with AI
          </p>
        </div>

        {!hasApiKey && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configure Your API Key
              </CardTitle>
              <CardDescription>
                To start generating content, you need to add your DreamGen API key.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/api-keys">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Role-Play Chat
              </CardTitle>
              <CardDescription>
                {chatSessions?.length || 0} active sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Story Generator
              </CardTitle>
              <CardDescription>
                {stories?.length || 0} stories created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stories">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Story
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wand2 className="h-5 w-5 text-primary" />
                Scenarios
              </CardTitle>
              <CardDescription>
                {scenarios?.length || 0} scenarios created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/scenarios">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Scenario
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-5 w-5 text-primary" />
                Image Generator
              </CardTitle>
              <CardDescription>
                Create images with Muse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/images">
                <Button variant="outline" className="w-full">
                  Generate Image
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Characters
              </CardTitle>
              <CardDescription>
                {characters?.length || 0} characters created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/characters">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Character
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-primary" />
                API Keys
              </CardTitle>
              <CardDescription>
                {apiKeys?.length || 0} keys configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/api-keys">
                <Button variant="outline" className="w-full">
                  Manage Keys
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {(chatSessions && chatSessions.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Chat Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chatSessions.slice(0, 5).map((session) => (
                  <Link key={session.id} href={`/chat/${session.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>{session.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
