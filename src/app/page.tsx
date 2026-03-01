"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  PenLine,
  BrainCircuit,
  Sprout,
  Lock,
  Ban,
  X,
  Star,
  Send,
} from "lucide-react";

const MARQUEE_FEATURES = [
  "AI Journaling",
  "Mood Tracking",
  "CBT Exercises",
  "Breathing Tools",
  "Weekly Insights",
  "Private & Encrypted",
  "AI Companion",
];

const TESTIMONIALS = [
  {
    quote:
      "I didn't expect an app to make me cry — in the best way. It said exactly what I needed to hear.",
    name: "Sara",
    age: 24,
    avatar: "S",
  },
  {
    quote:
      "I've tried journaling apps before, but this one actually understands me. The AI insights are scary accurate.",
    name: "Marcus",
    age: 31,
    avatar: "M",
  },
  {
    quote:
      "My therapist recommended journaling. This made it easy and honestly fun. The breathing exercises are everything.",
    name: "Priya",
    age: 27,
    avatar: "P",
  },
];

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DemoWidget() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    emoji: string;
    emotions: string[];
    suggestion: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true);
    setHasSubmitted(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) setResult(await res.json());
    } catch {
      setResult({
        emoji: "🤔",
        emotions: ["Processing"],
        suggestion: "Try telling me more about how you feel.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      analyze();
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-[#E2E0DC] bg-white p-6 md:p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-3 rounded-full bg-[#E57373]/50" />
          <div className="h-3 w-3 rounded-full bg-[#E8B86D]/50" />
          <div className="h-3 w-3 rounded-full bg-[#7C9A8E]/50" />
          <span className="ml-2 text-xs text-[#94A3B8]">moody journal</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type how you're feeling... e.g. &quot;I'm exhausted and can't focus on anything&quot;"
          rows={3}
          className="w-full resize-none rounded-xl bg-[#F5F4F0] border border-[#E2E0DC] px-4 py-3 text-sm text-[#2D3436] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C9A8E]/40"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-[#94A3B8]">
            {text.length > 0
              ? `${text.split(/\s+/).filter(Boolean).length} words`
              : "No sign up needed"}
          </span>
          <button
            onClick={analyze}
            disabled={!text.trim() || loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#7C9A8E] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#6B8A7D] disabled:opacity-40 cursor-pointer"
          >
            {loading ? (
              "Analyzing..."
            ) : (
              <>
                <Send className="h-3.5 w-3.5" /> Analyze
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {hasSubmitted && result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-4 overflow-hidden"
            >
              <div className="rounded-xl bg-[#7C9A8E]/8 border border-[#7C9A8E]/20 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{result.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[#2D3436]">
                      Detected:{" "}
                      <span className="text-[#7C9A8E]">
                        {result.emotions.join(" + ")}
                      </span>
                    </p>
                    <p className="text-sm text-[#636E72] mt-1">
                      {result.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#FAFAF8] text-[#2D3436]">
      {/* ━━━ Navbar ━━━ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#FAFAF8]/80 border-b border-[#E2E0DC]/40">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Moody" width={28} height={28} className="rounded-full" />
            <span className="font-serif font-bold text-lg text-[#2D3436]">Moody</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#636E72]">
            <a href="#features" className="hover:text-[#2D3436] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#2D3436] transition-colors">How it Works</a>
            <a href="#demo" className="hover:text-[#2D3436] transition-colors">Try it</a>
          </div>
          <Link href="/login">
            <button className="rounded-full bg-[#2D3436] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#3D4D4F] cursor-pointer">
              Log in
            </button>
          </Link>
        </div>
      </nav>

      {/* ━━━ Section 1: Hero ━━━ */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-28 overflow-hidden">
        {/* Glowy mesh gradient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-glow-1 absolute -top-[20%] -left-[15%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full" style={{ background: "radial-gradient(circle, rgba(124,154,142,0.45) 0%, rgba(124,154,142,0.15) 35%, transparent 65%)", filter: "blur(60px)" }} />
          <div className="hero-glow-2 absolute -top-[10%] -right-[12%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full" style={{ background: "radial-gradient(circle, rgba(138,174,196,0.40) 0%, rgba(138,174,196,0.12) 35%, transparent 65%)", filter: "blur(60px)" }} />
          <div className="hero-glow-3 absolute -bottom-[15%] left-[20%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,184,109,0.35) 0%, rgba(232,184,109,0.10) 35%, transparent 65%)", filter: "blur(60px)" }} />
          <div className="hero-glow-2 absolute top-[30%] right-[25%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(180,140,200,0.25) 0%, rgba(180,140,200,0.06) 40%, transparent 65%)", filter: "blur(70px)" }} />
          <div className="hero-glow-1 absolute bottom-[10%] -right-[10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full" style={{ background: "radial-gradient(circle, rgba(124,154,142,0.30) 0%, rgba(124,154,142,0.08) 35%, transparent 65%)", filter: "blur(50px)" }} />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7C9A8E]/[0.08] border border-[#7C9A8E]/[0.15] px-4 py-1.5 text-xs font-medium text-[#7C9A8E] mb-8">
              Your mental wellness companion
            </span>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.08] text-[#2D3436] mb-6">
              Find <span className="text-[#7C9A8E]">Peace</span>
              <br />
              Through Writing
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto max-w-lg text-base md:text-lg text-[#636E72] mb-10 leading-relaxed">
              Automatically understand your emotions and track your mental
              wellness, helping build habits that boost resilience.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="rounded-full bg-[#7C9A8E] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7C9A8E]/25 transition-all hover:bg-[#6B8A7D] hover:shadow-xl hover:shadow-[#7C9A8E]/30 cursor-pointer">
                  Get Started
                </button>
              </Link>
              <a href="#features">
                <button className="inline-flex items-center gap-2 rounded-full border border-[#E2E0DC] px-8 py-3.5 text-base font-medium text-[#636E72] transition-all hover:border-[#7C9A8E] hover:text-[#2D3436] cursor-pointer">
                  Learn more <ArrowRight className="h-4 w-4" />
                </button>
              </a>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.5}>
          <div className="mt-24 border-t border-[#E2E0DC]/40 pt-8 text-center">
            <p className="text-sm text-[#94A3B8] mb-6">Redefining how people approach mental wellness</p>
            <div className="marquee-container relative overflow-hidden mx-auto max-w-3xl">
              <div className="marquee-track flex gap-10 whitespace-nowrap">
                {[...MARQUEE_FEATURES, ...MARQUEE_FEATURES].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-2.5 text-sm font-medium text-[#94A3B8]/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7C9A8E]/50 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ━━━ Section 2: The Problem ━━━ */}
      <section className="py-20 md:py-28 px-6 bg-[#FAFAF8]">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436] mb-12">
              Sound familiar?
            </h2>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                emoji: "😮‍💨",
                text: "You bottle everything up because no one would understand",
                delay: 0,
                float: "float-animation",
              },
              {
                emoji: "🌀",
                text: "Stress builds until it just explodes out of nowhere",
                delay: 0.15,
                float: "float-animation-delayed",
              },
              {
                emoji: "🌫️",
                text: "You don't even know what you're feeling anymore",
                delay: 0.3,
                float: "float-animation-delayed-2",
              },
            ].map((card) => (
              <FadeIn key={card.emoji} delay={card.delay}>
                <div
                  className={`${card.float} rounded-2xl border border-[#E2E0DC] bg-white p-6 md:p-8 shadow-sm`}
                >
                  <span className="text-4xl block mb-4">{card.emoji}</span>
                  <p className="text-[#4A5568] leading-relaxed">{card.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <p className="mt-12 text-lg text-[#636E72] italic max-w-lg mx-auto">
              That&apos;s not weakness. That&apos;s what happens when you carry too much
              alone.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Section 3: The Solution ━━━ */}
      <section id="features" className="py-20 md:py-28 px-6 bg-[#F5F4F0] scroll-mt-20">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436] mb-3">
                Three steps to feeling lighter
              </h2>
              <p className="text-[#636E72]">
                Designed with psychologists. Powered by AI.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: PenLine,
                title: "Write",
                desc: "Free-form journaling with AI-guided prompts designed by psychologists. No rules, no judgment.",
                color: "#7C9A8E",
              },
              {
                icon: BrainCircuit,
                title: "Understand",
                desc: "NLP analysis detects your emotional patterns, stress triggers, and recurring themes you can't see yourself.",
                color: "#8AAEC4",
              },
              {
                icon: Sprout,
                title: "Heal",
                desc: "Personalized breathing exercises, CBT tools, and mood uplift suggestions — tailored to today's mood.",
                color: "#E8B86D",
              },
            ].map((pillar, i) => (
              <FadeIn key={pillar.title} delay={i * 0.15}>
                <div className="group rounded-2xl border border-[#E2E0DC] bg-white p-6 md:p-8 transition-all duration-300 hover:border-[#7C9A8E]/40 hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className="mb-4 inline-flex rounded-xl p-3"
                    style={{ backgroundColor: `${pillar.color}15` }}
                  >
                    <pillar.icon
                      className="h-6 w-6"
                      style={{ color: pillar.color }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2D3436] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#636E72] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Section 4: Live Demo ━━━ */}
      <section id="demo" className="py-20 md:py-28 px-6 bg-[#FAFAF8] scroll-mt-20">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center mb-10">
              <span className="inline-block rounded-full bg-[#7C9A8E]/10 border border-[#7C9A8E]/20 px-4 py-1.5 text-xs font-medium text-[#7C9A8E] mb-4">
                TRY IT RIGHT NOW
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436] mb-3">
                See how it feels
              </h2>
              <p className="text-[#636E72] max-w-md mx-auto">
                Type what&apos;s on your mind. No sign up needed — just a taste of
                what Moody can do.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <DemoWidget />
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Section 5: Mood Insights Showcase ━━━ */}
      <section className="py-20 md:py-28 px-6 bg-[#F5F4F0]">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436] mb-4">
                  Watch your patterns unfold
                </h2>
                <p className="text-[#636E72] mb-8 leading-relaxed">
                  See your emotional trends over days, weeks, and months. Moody
                  turns your scattered feelings into clear, actionable insights.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { stat: "73%", label: "report lower stress after 2 weeks" },
                    { stat: "4.8★", label: "average mood improvement score" },
                    { stat: "12min", label: "average daily journaling time" },
                    { stat: "89%", label: "continue after the first week" },
                  ].map((item) => (
                    <div
                      key={item.stat}
                      className="rounded-xl bg-white border border-[#E2E0DC] p-4"
                    >
                      <p className="text-2xl font-bold text-[#E8B86D]">
                        {item.stat}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-2xl border border-[#E2E0DC] bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#2D3436]">
                    Mood Trend — Last 7 Days
                  </span>
                  <span className="text-xs text-[#7C9A8E] font-medium">↑ Improving</span>
                </div>
                <MoodChartDemo />
                <div className="mt-4 flex gap-2">
                  {["😢", "😟", "😐", "😐", "😊", "😊", "😄"].map(
                    (emoji, i) => (
                      <div
                        key={i}
                        className="flex-1 text-center text-lg"
                        title={`Day ${i + 1}`}
                      >
                        {emoji}
                      </div>
                    )
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ━━━ Section 6: Testimonials ━━━ */}
      <section className="py-20 md:py-28 px-6 bg-[#FAFAF8]">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436]">
                Real people. Real relief.
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.15}>
                <div className="rounded-2xl border border-[#E2E0DC] bg-white p-6 md:p-8 h-full flex flex-col shadow-sm">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="h-4 w-4 fill-[#E8B86D] text-[#E8B86D]"
                      />
                    ))}
                  </div>
                  <p className="font-serif text-lg italic text-[#4A5568] leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#F0EFEB]">
                    <div className="h-9 w-9 rounded-full bg-[#7C9A8E]/15 flex items-center justify-center text-sm font-semibold text-[#7C9A8E]">
                      {t.avatar}
                    </div>
                    <span className="text-sm text-[#636E72]">
                      {t.name}, {t.age}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 rounded-full bg-white border border-[#E2E0DC] px-6 py-2.5 shadow-sm">
                <span className="text-sm text-[#636E72]">App Store 4.9 ★</span>
                <span className="h-4 w-px bg-[#E2E0DC]" />
                <span className="text-sm text-[#636E72]">
                  Play Store 4.8 ★
                </span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Section 7: How It Works ━━━ */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 bg-[#F5F4F0] scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436]">
                Simple as 1-2-3
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Write",
                desc: "Open the app, write whatever's on your mind. No rules. No word count. No judgment.",
              },
              {
                step: "02",
                title: "Analyze",
                desc: "Your AI companion reads between the lines — finding patterns, triggers, and emotional shifts you can't see yourself.",
              },
              {
                step: "03",
                title: "Improve",
                desc: "Get personalized exercises, weekly insight reports, and a mood that actually shifts over time.",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.15}>
                <div className="flex gap-6 items-start">
                  <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C9A8E]/10 border border-[#7C9A8E]/15">
                    <span className="text-xl font-bold text-[#7C9A8E]">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2D3436] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[#636E72] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Section 8: Final CTA ━━━ */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden bg-[#FAFAF8]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7C9A8E08_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#2D3436] mb-4 leading-tight">
              Your healing doesn&apos;t need
              <br />a waiting room.
            </h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="text-lg text-[#636E72] mb-8">
              Start today. Your first week is completely free.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#7C9A8E] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7C9A8E]/25 transition-all hover:bg-[#6B8A7D] hover:shadow-xl cursor-pointer">
                  Start Your First Entry — Free
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.45}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Private & Encrypted
              </span>
              <span className="h-3 w-px bg-[#E2E0DC]" />
              <span className="inline-flex items-center gap-1.5">
                <Ban className="h-3.5 w-3.5" /> No Ads
              </span>
              <span className="h-3 w-px bg-[#E2E0DC]" />
              <span className="inline-flex items-center gap-1.5">
                <X className="h-3.5 w-3.5" /> Cancel Anytime
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E0DC] py-8 px-6 bg-[#F5F4F0]">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Moody" width={24} height={24} className="rounded-full" />
            <span className="text-sm text-[#94A3B8]">
              &copy; {new Date().getFullYear()} Moody. Your mind matters.
            </span>
          </div>
          <div className="flex gap-6 text-sm text-[#94A3B8]">
            <Link href="/login" className="hover:text-[#7C9A8E] transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-[#7C9A8E] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MoodChartDemo() {
  const points = [2, 2.5, 3, 3, 3.8, 4, 4.5];
  const svgW = 400;
  const svgH = 120;
  const padX = 10;
  const padY = 10;
  const stepX = (svgW - padX * 2) / (points.length - 1);
  const scaleY = (v: number) =>
    padY + ((5 - v) / 4) * (svgH - padY * 2);

  const pathD = points
    .map((p, i) => {
      const x = padX + i * stepX;
      const y = scaleY(p);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaD = `${pathD} L ${padX + (points.length - 1) * stepX} ${svgH - padY} L ${padX} ${svgH - padY} Z`;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C9A8E" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7C9A8E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="#7C9A8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={padX + i * stepX}
          cy={scaleY(p)}
          r="4"
          fill="white"
          stroke="#7C9A8E"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
