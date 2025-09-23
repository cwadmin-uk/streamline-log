import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Bug, 
  TrendingUp, 
  Shield, 
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChangelogEntryProps {
  id: string;
  title: string;
  description: string;
  category: "feature" | "bugfix" | "improvement" | "security";
  createdAt: string;
  authorName?: string;
  isOwner: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const categoryConfig = {
  feature: {
    icon: Sparkles,
    label: "Feature",
    variant: "feature" as const,
  },
  bugfix: {
    icon: Bug,
    label: "Bug Fix",
    variant: "bugfix" as const,
  },
  improvement: {
    icon: TrendingUp,
    label: "Improvement",
    variant: "improvement" as const,
  },
  security: {
    icon: Shield,
    label: "Security",
    variant: "security" as const,
  },
};

const ChangelogEntry = ({
  id,
  title,
  description,
  category,
  createdAt,
  authorName,
  isOwner,
  onEdit,
  onDelete,
}: ChangelogEntryProps) => {
  const config = categoryConfig[category];
  const IconComponent = config.icon;

  return (
    <div className="group relative animate-slide-up">
      {/* Timeline connector */}
      <div className="absolute left-6 top-0 -bottom-6 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
      
      {/* Timeline dot */}
      <div className="absolute left-4 top-8 w-5 h-5 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center">
        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
      </div>
      
      <Card className="ml-16 border-0 shadow-card bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 hover:shadow-glow group-hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${category}/20 shadow-soft`}>
                <IconComponent className={`w-5 h-5 text-${category}`} />
              </div>
              <div>
                <Badge variant={config.variant} className="mb-2">
                  {config.label}
                </Badge>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              </div>
            </div>
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <p className="text-muted-foreground mb-4 leading-relaxed">
            {description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {format(new Date(createdAt), "MMM dd, yyyy 'at' HH:mm")}
            </span>
            {authorName && (
              <span>by {authorName}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangelogEntry;