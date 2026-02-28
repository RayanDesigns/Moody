"use client";

import { useState } from "react";
import { BreathingExercise } from "@/components/breathing-exercise";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wind, Brain, Heart, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

const CBT_EXERCISES = [
  {
    title: "Thought Record",
    description: "Challenge negative thinking patterns",
    steps: [
      "Identify the situation that triggered a strong emotion",
      "What automatic thought came to mind?",
      "What emotion did you feel? Rate its intensity (0-100%)",
      "What evidence supports this thought?",
      "What evidence goes against this thought?",
      "What's a more balanced way to think about this?",
      "Re-rate your emotion intensity now (0-100%)",
    ],
  },
  {
    title: "Cognitive Distortion Check",
    description: "Identify thinking traps in your current thoughts",
    steps: [
      "Write down the thought that's bothering you",
      "Check: Am I catastrophizing (expecting the worst)?",
      "Check: Am I mind-reading (assuming what others think)?",
      "Check: Am I using all-or-nothing thinking?",
      "Check: Am I personalizing (blaming myself for everything)?",
      "Check: Am I filtering (focusing only on negatives)?",
      "Rewrite the thought without the distortion",
    ],
  },
  {
    title: "Behavioral Activation",
    description: "Break the cycle of low mood with small actions",
    steps: [
      "List 3 activities that usually bring you joy or satisfaction",
      "Pick the smallest, easiest one to do right now",
      "Do the activity for at least 5 minutes",
      "Notice how your mood changes (even slightly)",
      "Record what you did and how it made you feel",
    ],
  },
];

const GRATITUDE_PROMPTS = [
  "Name three things you can see right now that you appreciate.",
  "Think of someone who made your day better recently. What did they do?",
  "What's a small comfort you're grateful for today?",
  "What's something about your body that you're thankful for?",
  "What's a lesson from a difficult experience that you value now?",
  "What technology or modern convenience are you grateful for?",
  "Who's someone in your life you sometimes take for granted?",
  "What's something in nature that brought you peace recently?",
];

export default function ToolkitPage() {
  const [gratitudePrompt, setGratitudePrompt] = useState(
    GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]
  );
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  function shuffleGratitude() {
    const filtered = GRATITUDE_PROMPTS.filter((p) => p !== gratitudePrompt);
    setGratitudePrompt(
      filtered[Math.floor(Math.random() * filtered.length)]
    );
  }

  return (
    <div className="space-y-6 pt-8 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold">Wellness Toolkit</h1>
        <p className="text-muted-foreground">
          Evidence-based exercises for your mental wellbeing
        </p>
      </div>

      <Tabs defaultValue="breathing">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="breathing" className="flex items-center gap-1.5">
            <Wind className="h-4 w-4" /> Breathing
          </TabsTrigger>
          <TabsTrigger value="cbt" className="flex items-center gap-1.5">
            <Brain className="h-4 w-4" /> CBT
          </TabsTrigger>
          <TabsTrigger value="gratitude" className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" /> Gratitude
          </TabsTrigger>
        </TabsList>

        {/* Breathing Tab */}
        <TabsContent value="breathing">
          <Card>
            <CardHeader>
              <CardTitle>Box Breathing Exercise</CardTitle>
              <CardDescription>
                A proven technique used by Navy SEALs to calm the nervous system.
                Follow the circle and breathe along with the rhythm.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <BreathingExercise />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CBT Tab */}
        <TabsContent value="cbt">
          <div className="space-y-4">
            {CBT_EXERCISES.map((exercise, i) => (
              <Card key={i}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedExercise(expandedExercise === i ? null : i)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {exercise.title}
                      </CardTitle>
                      <CardDescription>{exercise.description}</CardDescription>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedExercise === i ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </CardHeader>
                {expandedExercise === i && (
                  <CardContent>
                    <ol className="space-y-3">
                      {exercise.steps.map((step, si) => (
                        <li key={si} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {si + 1}
                          </span>
                          <span className="text-sm leading-relaxed pt-0.5">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4">
                      <Link href="/journal/new">
                        <Button variant="outline" size="sm">
                          Write about this in your journal
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Gratitude Tab */}
        <TabsContent value="gratitude">
          <Card>
            <CardHeader>
              <CardTitle>Gratitude Practice</CardTitle>
              <CardDescription>
                Research shows that regular gratitude practice can increase
                happiness by 25% and improve sleep quality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-accent/10 p-6 text-center">
                <p className="text-lg font-medium italic text-foreground mb-4">
                  &ldquo;{gratitudePrompt}&rdquo;
                </p>
                <Button variant="outline" size="sm" onClick={shuffleGratitude}>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  New Prompt
                </Button>
              </div>
              <div className="text-center">
                <Link
                  href={`/journal/new?prompt=${encodeURIComponent(gratitudePrompt)}`}
                >
                  <Button>
                    Write About This
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
