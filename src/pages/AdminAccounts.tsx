import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, UserPlus } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminAccounts = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

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

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
      fetchUserRoles();
    }
  }, [isAdmin]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching profiles",
        description: error.message,
      });
    } else {
      setProfiles(data || []);
    }
  };

  const fetchUserRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching roles",
        description: error.message,
      });
    } else {
      const rolesMap: Record<string, string[]> = {};
      (data || []).forEach((ur: UserRole) => {
        if (!rolesMap[ur.user_id]) {
          rolesMap[ur.user_id] = [];
        }
        rolesMap[ur.user_id].push(ur.role);
      });
      setUserRoles(rolesMap);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Remove existing roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Add new role
      if (newRole !== "none") {
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: newRole as "admin" | "moderator" | "user" }]);

        if (error) throw error;
      }

      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      });

      fetchUserRoles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: error.message,
      });
    }
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
              <h1 className="text-2xl font-bold">Account Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              Manage user accounts and assign roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => {
                  const currentRole = userRoles[profile.user_id]?.[0] || "none";
                  return (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.display_name}</TableCell>
                      <TableCell className="font-mono text-xs">{profile.user_id.slice(0, 8)}...</TableCell>
                      <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {currentRole !== "none" ? (
                          <Badge variant="secondary">{currentRole}</Badge>
                        ) : (
                          <span className="text-muted-foreground">No role</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentRole}
                          onValueChange={(value) => handleRoleChange(profile.user_id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Role</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAccounts;
