import { Badge } from "@/components/ui/badge";
import type { ReviewIssue } from "@/types/domain";

interface IssueBadgesProps {
    issues: ReviewIssue[];
}

export function IssueBadges({ issues }: IssueBadgesProps) {
    if (issues.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1">
            {issues.map((issue) => (
                <Badge
                    key={issue.type}
                    variant="outline"
                    className="text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800"
                >
                    {issue.label}
                </Badge>
            ))}
        </div>
    );
}
