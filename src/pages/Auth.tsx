import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessageType("error");
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          // Check if it's a rate limit error
          if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
            setMessageType("error");
            setMessage("Rate limit exceeded. Please wait a few minutes before trying again, or disable email confirmation in your Supabase dashboard for development.");
          } else {
            setMessageType("error");
            setMessage(error.message ?? "Unable to log you in.");
          }
        } else {
          setMessageType("success");
          setMessage("Logged in successfully.");
          // Navigation will happen via useEffect when user state updates
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          // Check if it's a rate limit error
          if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
            setMessageType("error");
            setMessage("Rate limit exceeded. Please wait a few minutes before trying again, or disable email confirmation in your Supabase dashboard for development.");
          } else {
            setMessageType("error");
            setMessage(error.message ?? "Unable to create your account.");
          }
        } else {
          setMessageType("success");
          setMessage("Account created successfully. Please check your email to verify your account, or disable email confirmation in your Supabase dashboard for development.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background theme-transition flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md mt-10">
          <Card className="border border-border/60 bg-card">
            <CardHeader className="space-y-2 text-center pt-6">
              <CardTitle className="text-2xl md:text-3xl font-display text-primary">
                Welcome to Scrape Master
              </CardTitle>
              <CardDescription>
                Log in or create an account to start scraping in seconds.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as "login" | "signup")}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 gap-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-login">Password</Label>
                      <Input
                        id="password-login"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full name (optional)</Label>
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="Alex Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {message && (
                <div
                  className={`mt-4 rounded-md border px-3 py-2 text-sm ${
                    messageType === "success"
                      ? "border-emerald-400/60 bg-emerald-500/5 text-emerald-500"
                      : "border-red-400/60 bg-red-500/5 text-red-500"
                  }`}
                >
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
