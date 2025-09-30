import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Key, Settings, ArrowLeft } from "lucide-react";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { isAdmin, loading: roleLoading } = useUserRole(session?.user?.id);

  useEffect(() => {
    if (!loading && !roleLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, roleLoading, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <header className="border-b border-secondary/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Portal</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/accounts">
            <Card className="h-full hover:shadow-glow transition-shadow cursor-pointer border-secondary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  View and manage user accounts, assign roles, and control access
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/sso">
            <Card className="h-full hover:shadow-glow transition-shadow cursor-pointer border-secondary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>SSO Configuration</CardTitle>
                <CardDescription>
                  Configure Single Sign-On providers and authentication settings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/security">
            <Card className="h-full hover:shadow-glow transition-shadow cursor-pointer border-secondary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage security permissions, policies, and access controls
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Admin;
