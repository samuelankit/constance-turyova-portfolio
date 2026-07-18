import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/Home";
import AboutPage from "@/pages/About";
import BlogPage from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPost";
import ContactPage from "@/pages/Contact";
import AdminPage from "@/pages/Admin";
import PortfolioPage from "@/pages/Portfolio";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/updates" component={BlogPage} />
      <Route path="/updates/:id">{(params) => <BlogPostPage id={Number(params.id)} />}</Route>
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
