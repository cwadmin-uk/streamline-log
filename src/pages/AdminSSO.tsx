import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Save } from "lucide-react";

const AdminSSO = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [azureEnabled, setAzureEnabled] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [githubEnabled, setGithubEnabled] = useState(false);

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

  const handleSave = () => {
    toast({
      title: "SSO Configuration Saved",
      description: "Your SSO settings have been updated successfully.",
    });
  };

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
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">SSO Configuration</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Microsoft Azure AD</CardTitle>
            <CardDescription>
              Configure Microsoft Azure Active Directory SSO
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="azure-enabled">Enable Azure AD SSO</Label>
              <Switch
                id="azure-enabled"
                checked={azureEnabled}
                onCheckedChange={setAzureEnabled}
              />
            </div>
            {azureEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="azure-client-id">Client ID</Label>
                  <Input
                    id="azure-client-id"
                    placeholder="Enter Azure AD Client ID"
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-tenant-id">Tenant ID</Label>
                  <Input
                    id="azure-tenant-id"
                    placeholder="Enter Azure AD Tenant ID"
                    className="bg-secondary/50"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Google OAuth</CardTitle>
            <CardDescription>
              Configure Google OAuth authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="google-enabled">Enable Google OAuth</Label>
              <Switch
                id="google-enabled"
                checked={googleEnabled}
                onCheckedChange={setGoogleEnabled}
              />
            </div>
            {googleEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="google-client-id">Client ID</Label>
                  <Input
                    id="google-client-id"
                    placeholder="Enter Google OAuth Client ID"
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-client-secret">Client Secret</Label>
                  <Input
                    id="google-client-secret"
                    type="password"
                    placeholder="Enter Google OAuth Client Secret"
                    className="bg-secondary/50"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>GitHub OAuth</CardTitle>
            <CardDescription>
              Configure GitHub OAuth authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="github-enabled">Enable GitHub OAuth</Label>
              <Switch
                id="github-enabled"
                checked={githubEnabled}
                onCheckedChange={setGithubEnabled}
              />
            </div>
            {githubEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="github-client-id">Client ID</Label>
                  <Input
                    id="github-client-id"
                    placeholder="Enter GitHub OAuth Client ID"
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github-client-secret">Client Secret</Label>
                  <Input
                    id="github-client-secret"
                    type="password"
                    placeholder="Enter GitHub OAuth Client Secret"
                    className="bg-secondary/50"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full bg-gradient-primary shadow-glow">
          <Save className="w-4 h-4 mr-2" />
          Save SSO Configuration
        </Button>
      </main>
    </div>
  );
};

export default AdminSSO;
