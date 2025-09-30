import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCog, Trash2 } from "lucide-react";

type UserWithRole = {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  roles: string[];
};

const AccountManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, created_at");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Group roles by user_id
      const rolesByUser = roles?.reduce((acc, { user_id, role }) => {
        if (!acc[user_id]) acc[user_id] = [];
        acc[user_id].push(role);
        return acc;
      }, {} as Record<string, string[]>) || {};

      const usersData: UserWithRole[] = profiles?.map(profile => ({
        id: profile.user_id,
        email: "", // Email not accessible from profiles
        display_name: profile.display_name || "Unknown User",
        created_at: profile.created_at,
        roles: rolesByUser[profile.user_id] || [],
      })) || [];

      setUsers(usersData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "moderator" | "user") => {
    try {
      // Remove all existing roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Add new role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role.",
      });
    }
  };

  const handleDeleteRole = async (userId: string, role: "admin" | "moderator" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove role.",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Account Management</CardTitle>
        <CardDescription>
          View and manage user accounts and role assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.display_name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge key={role} variant="secondary" className="gap-1">
                            {role}
                            <button
                              onClick={() => handleDeleteRole(user.id, role as "admin" | "moderator" | "user")}
                              className="ml-1 hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No roles</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(value) => handleRoleChange(user.id, value as "admin" | "moderator" | "user")}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Add role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountManagement;