import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ApiKeys from "./pages/ApiKeys";
import Chat from "./pages/Chat";
import ChatSession from "./pages/ChatSession";
import Stories from "./pages/Stories";
import StoryEditor from "./pages/StoryEditor";
import Scenarios from "./pages/Scenarios";
import ScenarioEditor from "./pages/ScenarioEditor";
import ScenarioLibrary from "./pages/ScenarioLibrary";
import ImageGenerator from "./pages/ImageGenerator";
import Characters from "./pages/Characters";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/chat" component={Chat} />
      <Route path="/chat/:id" component={ChatSession} />
      <Route path="/stories" component={Stories} />
      <Route path="/stories/:id" component={StoryEditor} />
      <Route path="/scenarios" component={Scenarios} />
      <Route path="/scenarios/new" component={ScenarioEditor} />
      <Route path="/scenarios/:id" component={ScenarioEditor} />
      <Route path="/library" component={ScenarioLibrary} />
      <Route path="/images" component={ImageGenerator} />
      <Route path="/characters" component={Characters} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
