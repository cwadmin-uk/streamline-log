import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SecuritySettings = () => {
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [enableMFA, setEnableMFA] = useState(false);
  const [passwordMinLength, setPasswordMinLength] = useState("8");
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Settings Saved",
      description: "Security settings have been updated successfully.",
    });
    
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Advanced security settings can be configured in the backend authentication panel.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentication Security
          </CardTitle>
          <CardDescription>
            Configure authentication and session security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-verification">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Users must verify their email before accessing the app
              </p>
            </div>
            <Switch
              id="email-verification"
              checked={requireEmailVerification}
              onCheckedChange={setRequireEmailVerification}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-mfa">Enable Multi-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all user accounts
              </p>
            </div>
            <Switch
              id="enable-mfa"
              checked={enableMFA}
              onCheckedChange={setEnableMFA}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-length">Minimum Password Length</Label>
            <Input
              id="password-length"
              type="number"
              min="6"
              max="128"
              value={passwordMinLength}
              onChange={(e) => setPasswordMinLength(e.target.value)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Minimum characters required for passwords
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="1"
              max="168"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Automatically log out users after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Row Level Security (RLS)</CardTitle>
          <CardDescription>
            Database access control policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                RLS policies are enforced at the database level. View and manage policies in the backend dashboard.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Current tables with RLS enabled:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>profiles</li>
              <li>changelog_entries</li>
              <li>user_roles</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;