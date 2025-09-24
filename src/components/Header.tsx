import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  LogOut, 
  Filter,
  Sparkles, 
  Bug, 
  TrendingUp, 
  Shield,
  History,
  Search,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onAddEntry: () => void;
  onFilterChange: (category: string) => void;
  currentFilter: string;
  onSearchChange: (search: string) => void;
  searchQuery: string;
}

const categoryFilters = [
  { value: "all", label: "All Updates", icon: History },
  { value: "feature", label: "Features", icon: Sparkles },
  { value: "bugfix", label: "Bug Fixes", icon: Bug },
  { value: "improvement", label: "Improvements", icon: TrendingUp },
  { value: "security", label: "Security", icon: Shield },
];

const Header = ({ onAddEntry, onFilterChange, currentFilter, onSearchChange, searchQuery }: HeaderProps) => {
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().slice(0, 100); // Limit to 100 chars for security
    onSearchChange(value);
  };

  const clearSearch = () => {
    onSearchChange("");
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const currentFilterConfig = categoryFilters.find(f => f.value === currentFilter);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-secondary/50">
      <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl shadow-glow flex items-center justify-center">
                <History className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Changelog
                </h1>
                <p className="text-sm text-muted-foreground">
                  Share your updates with the world
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentFilterConfig?.label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {currentFilter === "all" ? "All" : currentFilter}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {categoryFilters.map((filter) => {
                  const IconComponent = filter.icon;
                  return (
                    <DropdownMenuItem
                      key={filter.value}
                      onClick={() => onFilterChange(filter.value)}
                      className={currentFilter === filter.value ? "bg-accent" : ""}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {filter.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={onAddEntry}
              className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Entry</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by title, description, or author..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10 bg-secondary/50 border-secondary"
            maxLength={100}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-secondary"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;