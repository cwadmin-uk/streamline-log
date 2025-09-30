import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SSOConfiguration = () => {
  const [azureEnabled, setAzureEnabled] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Settings Saved",
      description: "SSO configuration has been updated successfully.",
    });
    
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To configure SSO providers, access the backend dashboard where you can manage authentication settings.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Microsoft Azure AD</CardTitle>
          <CardDescription>
            Configure Microsoft Azure Active Directory authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="azure-enabled">Enable Azure SSO</Label>
            <Switch
              id="azure-enabled"
              checked={azureEnabled}
              onCheckedChange={setAzureEnabled}
            />
          </div>

          {azureEnabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="azure-tenant">Tenant ID</Label>
                <Input
                  id="azure-tenant"
                  placeholder="Enter Azure Tenant ID"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="azure-client">Client ID</Label>
                <Input
                  id="azure-client"
                  placeholder="Enter Azure Client ID"
                  disabled
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Configure these values in the backend authentication settings
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google OAuth</CardTitle>
          <CardDescription>
            Configure Google authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="google-enabled">Enable Google SSO</Label>
            <Switch
              id="google-enabled"
              checked={googleEnabled}
              onCheckedChange={setGoogleEnabled}
            />
          </div>

          {googleEnabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="google-client">Client ID</Label>
                <Input
                  id="google-client"
                  placeholder="Enter Google Client ID"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-secret">Client Secret</Label>
                <Input
                  id="google-secret"
                  type="password"
                  placeholder="Enter Google Client Secret"
                  disabled
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Configure these values in the backend authentication settings
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default SSOConfiguration;