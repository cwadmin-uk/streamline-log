import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Sparkles, Bug, TrendingUp, Shield } from "lucide-react";

interface AddEntryFormProps {
  onEntryAdded: () => void;
  onCancel: () => void;
}

const categoryIcons = {
  feature: Sparkles,
  bugfix: Bug,
  improvement: TrendingUp,
  security: Shield,
};

const AddEntryForm = ({ onEntryAdded, onCancel }: AddEntryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("changelog_entries")
        .insert({
          title,
          description,
          category,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Entry added successfully!",
        description: "Your changelog entry has been published.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      
      onEntryAdded();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add entry",
        description: error.message,
      });
    }

    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-card bg-card/70 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add New Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Brief summary of the change"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-secondary/50 border-secondary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category *
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-secondary/50 border-secondary">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-feature" />
                    Feature
                  </div>
                </SelectItem>
                <SelectItem value="bugfix">
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-bugfix" />
                    Bug Fix
                  </div>
                </SelectItem>
                <SelectItem value="improvement">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-improvement" />
                    Improvement
                  </div>
                </SelectItem>
                <SelectItem value="security">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-security" />
                    Security
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <Textarea
              id="description"
              placeholder="Detailed description of the change and its impact"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="bg-secondary/50 border-secondary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Entry
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEntryForm;