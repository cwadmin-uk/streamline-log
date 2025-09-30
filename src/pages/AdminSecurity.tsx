import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Save, Lock } from "lucide-react";

const AdminSecurity = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  });
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelist, setIpWhitelist] = useState(false);

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
      title: "Security Settings Saved",
      description: "Your security configuration has been updated successfully.",
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
              <h1 className="text-2xl font-bold">Security Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Multi-Factor Authentication
            </CardTitle>
            <CardDescription>
              Require users to verify their identity with a second factor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="mfa-enabled">Enable MFA for all users</Label>
              <Switch
                id="mfa-enabled"
                checked={mfaEnabled}
                onCheckedChange={setMfaEnabled}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Password Policy</CardTitle>
            <CardDescription>
              Configure password requirements for user accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-length">Minimum Password Length</Label>
              <Input
                id="min-length"
                type="number"
                value={passwordPolicy.minLength}
                onChange={(e) => setPasswordPolicy({
                  ...passwordPolicy,
                  minLength: parseInt(e.target.value)
                })}
                className="bg-secondary/50"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
              <Switch
                id="require-uppercase"
                checked={passwordPolicy.requireUppercase}
                onCheckedChange={(checked) => setPasswordPolicy({
                  ...passwordPolicy,
                  requireUppercase: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-numbers">Require Numbers</Label>
              <Switch
                id="require-numbers"
                checked={passwordPolicy.requireNumbers}
                onCheckedChange={(checked) => setPasswordPolicy({
                  ...passwordPolicy,
                  requireNumbers: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-special">Require Special Characters</Label>
              <Switch
                id="require-special"
                checked={passwordPolicy.requireSpecialChars}
                onCheckedChange={(checked) => setPasswordPolicy({
                  ...passwordPolicy,
                  requireSpecialChars: checked
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>
              Configure session timeout and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                className="bg-secondary/50"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <Switch
                id="ip-whitelist"
                checked={ipWhitelist}
                onCheckedChange={setIpWhitelist}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full bg-gradient-primary shadow-glow">
          <Save className="w-4 h-4 mr-2" />
          Save Security Settings
        </Button>
      </main>
    </div>
  );
};

export default AdminSecurity;
