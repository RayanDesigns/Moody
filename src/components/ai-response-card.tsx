"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AIResponseCardProps {
  response: string;
  isLoading?: boolean;
}

export function AIResponseCard({ response, isLoading }: AIResponseCardProps) {
  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-primary/10" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-primary/10" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm leading-relaxed text-foreground">{response}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
