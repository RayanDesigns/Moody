"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, BarChart3, MessageCircle, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: BookOpen,
    title: "AI-Powered Journaling",
    description:
      "Write freely with guided prompts. Our AI analyzes your emotional patterns and provides personalized feedback.",
  },
  {
    icon: BarChart3,
    title: "Mood Tracking & Insights",
    description:
      "Visual mood trends, trigger identification, and a Year in Pixels overview of your emotional journey.",
  },
  {
    icon: MessageCircle,
    title: "Empathetic AI Companion",
    description:
      "A supportive AI that reflects your feelings, validates emotions, and suggests evidence-based coping strategies.",
  },
  {
    icon: Heart,
    title: "Wellness Toolkit",
    description:
      "Breathing exercises, CBT worksheets, and gratitude practices — all tailored to your current emotional state.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-6">🌿</div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Your mind deserves{" "}
              <span className="text-primary">a safe space</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Moody combines journaling, AI-powered emotional analysis, and
              evidence-based wellness tools to support your mental health journey —
              one entry at a time.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="text-base px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="rounded-lg bg-primary/10 p-2.5 w-fit mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Research shows digital journaling can reduce depression symptoms by up to 30%.
          </p>
        </div>
      </section>
    </div>
  );
}
