import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Auth from "@/components/Auth";
import Header from "@/components/Header";
import ChangelogTimeline from "@/components/ChangelogTimeline";
import AddEntryForm from "@/components/AddEntryForm";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleEntryAdded = () => {
    setShowAddForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <Header
        onAddEntry={() => setShowAddForm(true)}
        onFilterChange={setCategoryFilter}
        currentFilter={categoryFilter}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {showAddForm && (
          <div className="mb-8">
            <AddEntryForm
              onEntryAdded={handleEntryAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}
        
        <ChangelogTimeline
          refreshTrigger={refreshTrigger}
          categoryFilter={categoryFilter}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
};

export default Index;
