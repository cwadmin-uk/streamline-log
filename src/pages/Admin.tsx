import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Users, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AccountManagement from "@/components/admin/AccountManagement";
import SSOConfiguration from "@/components/admin/SSOConfiguration";
import SecuritySettings from "@/components/admin/SecuritySettings";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (!roles) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have admin privileges.",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error: any) {
      console.error("Error checking admin access:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify admin access.",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-secondary/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, security, and system configuration
            </p>
          </div>
        </div>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Account Management
            </TabsTrigger>
            <TabsTrigger value="sso" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              SSO Configuration
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <AccountManagement />
          </TabsContent>

          <TabsContent value="sso">
            <SSOConfiguration />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;