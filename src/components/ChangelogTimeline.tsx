import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ChangelogEntry from "./ChangelogEntry";
import { Loader2 } from "lucide-react";

interface ChangelogTimelineProps {
  refreshTrigger: number;
  categoryFilter?: string;
  searchQuery?: string;
}

interface Entry {
  id: string;
  title: string;
  description: string;
  category: "feature" | "bugfix" | "improvement" | "security";
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

const ChangelogTimeline = ({ refreshTrigger, categoryFilter, searchQuery }: ChangelogTimelineProps) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    fetchEntries();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("changelog_entries")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "changelog_entries",
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [refreshTrigger, categoryFilter, searchQuery]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchEntries = async () => {
    try {
      let query = supabase
        .from("changelog_entries")
        .select(`
          id,
          title,
          description,
          category,
          created_at,
          user_id
        `)
        .order("created_at", { ascending: false });

      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data: entriesData, error: entriesError } = await query;

      if (entriesError) throw entriesError;

      if (!entriesData) {
        setEntries([]);
        return;
      }

      // Fetch profiles for all unique user IDs
      const uniqueUserIds = [...new Set(entriesData.map(entry => entry.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", uniqueUserIds);

      // Merge entries with profile data
      let entriesWithProfiles: Entry[] = entriesData.map(entry => ({
        ...entry,
        category: entry.category as "feature" | "bugfix" | "improvement" | "security",
        profiles: profilesData?.find(profile => profile.user_id === entry.user_id) || null
      }));

      // Apply search filter on client side for better UX
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        entriesWithProfiles = entriesWithProfiles.filter(entry =>
          entry.title.toLowerCase().includes(searchTerm) ||
          entry.description.toLowerCase().includes(searchTerm)
        );
      }

      setEntries(entriesWithProfiles);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load entries",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    // For now, just show a toast - in a real app you'd open an edit form
    toast({
      title: "Edit functionality",
      description: "Edit functionality would be implemented here.",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("changelog_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "The changelog entry has been removed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete entry",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary/20 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-primary/30 rounded-full" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No entries yet
        </h3>
        <p className="text-sm text-muted-foreground">
          {categoryFilter && categoryFilter !== "all" 
            ? `No ${categoryFilter} entries found${searchQuery ? ` matching "${searchQuery}"` : ''}. Try adjusting your filters.`
            : searchQuery 
              ? `No entries found matching "${searchQuery}". Try a different search term.`
              : "Be the first to add a changelog entry!"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {entries.map((entry) => (
        <ChangelogEntry
          key={entry.id}
          id={entry.id}
          title={entry.title}
          description={entry.description}
          category={entry.category}
          createdAt={entry.created_at}
          authorName={entry.profiles?.display_name || undefined}
          isOwner={entry.user_id === currentUserId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
      
      <div className="mt-12 pt-8 border-t border-secondary/50">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-full">
            <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              {entries.length === 1 ? '1 total change' : `${entries.length} total changes`}
              {searchQuery && ` matching "${searchQuery}"`}
              {categoryFilter && categoryFilter !== "all" && ` in ${categoryFilter}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogTimeline;