"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
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

/* ─── Cycling text phrases for hero ─── */
const CYCLING_PHRASES = [
  "Feeling anxious?",
  "Overwhelmed?",
  "Lost?",
  "Burned out?",
  "Disconnected?",
  "Carrying too much?",
];

/* ─── Testimonials ─── */
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

/* ─── Fade-in wrapper ─── */
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

/* ─── Interactive Demo Widget ─── */
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
      <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 md:p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-3 rounded-full bg-red-500/60" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <div className="h-3 w-3 rounded-full bg-green-500/60" />
          <span className="ml-2 text-xs text-[#64748B]">moody journal</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type how you're feeling... e.g. &quot;I'm exhausted and can't focus on anything&quot;"
          rows={3}
          className="w-full resize-none rounded-xl bg-[#1A2436] border border-[#1E293B] px-4 py-3 text-sm text-[#E2E8F0] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#7C9A8E]/50"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-[#475569]">
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
              <div className="rounded-xl bg-[#7C9A8E]/10 border border-[#7C9A8E]/20 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{result.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[#E2E8F0]">
                      Detected:{" "}
                      <span className="text-[#7C9A8E]">
                        {result.emotions.join(" + ")}
                      </span>
                    </p>
                    <p className="text-sm text-[#94A3B8] mt-1">
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

/* ─── Cycling Text Component ─── */
function CyclingText() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % CYCLING_PHRASES.length),
      2500
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-7 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="block text-base text-[#94A3B8]"
        >
          {CYCLING_PHRASES[index]} —{" "}
          <span className="text-[#7C9A8E]">You&apos;re in the right place.</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  return (
    <div className="landing-dark min-h-screen overflow-hidden">
      {/* ━━━ Section 1: Hero ━━━ */}
      <section className="aurora-bg relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0B1120_70%)]" />
        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 md:pt-40 md:pb-28 text-center">
          <FadeIn>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-[#E2E8F0] mb-6">
              Your mind deserves
              <br />
              <span className="shimmer-text">a place to breathe.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto max-w-xl text-lg md:text-xl text-[#94A3B8] mb-6">
              Write freely. Understand yourself. Feel better — with AI that
              actually listens.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <CyclingText />
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#7C9A8E] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7C9A8E]/20 transition-all hover:bg-[#6B8A7D] hover:shadow-xl hover:shadow-[#7C9A8E]/30 cursor-pointer">
                  Start Writing — It&apos;s Free
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/login">
                <button className="inline-flex items-center gap-2 rounded-full border border-[#1E293B] px-8 py-3.5 text-base font-medium text-[#94A3B8] transition-all hover:border-[#334155] hover:text-[#E2E8F0] cursor-pointer">
                  Sign In
                </button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.6}>
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[#64748B]">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#E8B86D] text-[#E8B86D]"
                  />
                ))}
              </div>
              <span className="ml-1">Trusted by 10,000+ users</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Section 2: The Problem ━━━ */}
      <section className="py-20 md:py-28 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#E2E8F0] mb-12">
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
                  className={`${card.float} rounded-2xl border border-[#1E293B] bg-[#141C2E] p-6 md:p-8`}
                >
                  <span className="text-4xl block mb-4">{card.emoji}</span>
                  <p className="text-[#CBD5E1] leading-relaxed">{card.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <p className="mt-12 text-lg text-[#94A3B8] italic max-w-lg mx-auto">
              That&apos;s not weakness. That&apos;s what happens when you carry too much
              alone.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Section 3: The Solution ━━━ */}
      <section className="py-20 md:py-28 px-6 bg-[#080E1A]">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#E2E8F0] mb-3">
                Three steps to feeling lighter
              </h2>
              <p className="text-[#94A3B8]">
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
                gradient: "from-[#7C9A8E]/20 to-transparent",
              },
              {
                icon: BrainCircuit,
                title: "Understand",
                desc: "NLP analysis detects your emotional patterns, stress triggers, and recurring themes you can't see yourself.",
                gradient: "from-[#8AAEC4]/20 to-transparent",
              },
              {
                icon: Sprout,
                title: "Heal",
                desc: "Personalized breathing exercises, CBT tools, and mood uplift suggestions — tailored to today's mood.",
                gradient: "from-[#E8B86D]/20 to-transparent",
              },
            ].map((pillar, i) => (
              <FadeIn key={pillar.title} delay={i * 0.15}>
                <div className="group relative rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 md:p-8 transition-all duration-300 hover:border-[#334155] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7C9A8E]/5">
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-[#1A2436] p-3">
                      <pillar.icon className="h-6 w-6 text-[#7C9A8E]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#E2E8F0] mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Section 4: Live Demo ━━━ */}
      <section className="py-20 md:py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center mb-10">
              <span className="inline-block rounded-full bg-[#7C9A8E]/10 border border-[#7C9A8E]/20 px-4 py-1.5 text-xs font-medium text-[#7C9A8E] mb-4">
                TRY IT RIGHT NOW
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#E2E8F0] mb-3">
                See how it feels
              </h2>
              <p className="text-[#94A3B8] max-w-md mx-auto">
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
      <section className="py-20 md:py-28 px-6 bg-[#080E1A]">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#E2E8F0] mb-4">
                  Watch your patterns unfold
                </h2>
                <p className="text-[#94A3B8] mb-8 leading-relaxed">
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
                      className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4"
                    >
                      <p className="text-2xl font-bold text-[#E8B86D]">
                        {item.stat}
                      </p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#E2E8F0]">
                    Mood Trend — Last 7 Days
                  </span>
                  <span className="text-xs text-[#7C9A8E]">↑ Improving</span>
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
      <section className="py-20 md:py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#E2E8F0]">
                Real people. Real relief.
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.15}>
                <div className="rounded-2xl border border-[#1E293B] bg-[#141C2E] p-6 md:p-8 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="h-4 w-4 fill-[#E8B86D] text-[#E8B86D]"
                      />
                    ))}
                  </div>
                  <p className="font-serif text-lg italic text-[#CBD5E1] leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#1E293B]">
                    <div className="h-9 w-9 rounded-full bg-[#7C9A8E]/20 flex items-center justify-center text-sm font-semibold text-[#7C9A8E]">
                      {t.avatar}
                    </div>
                    <span className="text-sm text-[#94A3B8]">
                      {t.name}, {t.age}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 rounded-full bg-[#141C2E] border border-[#1E293B] px-6 py-2.5">
                <span className="text-sm text-[#94A3B8]">App Store 4.9 ★</span>
                <span className="h-4 w-px bg-[#1E293B]" />
                <span className="text-sm text-[#94A3B8]">
                  Play Store 4.8 ★
                </span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Section 7: How It Works ━━━ */}
      <section className="py-20 md:py-28 px-6 bg-[#080E1A]">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#E2E8F0]">
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
                  <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C9A8E]/10 border border-[#7C9A8E]/20">
                    <span className="text-xl font-bold text-[#7C9A8E]">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#E2E8F0] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[#94A3B8] leading-relaxed">
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
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7C9A8E10_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#E2E8F0] mb-4 leading-tight">
              Your healing doesn&apos;t need
              <br />a waiting room.
            </h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="text-lg text-[#94A3B8] mb-8">
              Start today. Your first week is completely free.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#7C9A8E] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7C9A8E]/20 transition-all hover:bg-[#6B8A7D] hover:shadow-xl cursor-pointer">
                  Start Your First Entry — Free
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.45}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Private & Encrypted
              </span>
              <span className="h-3 w-px bg-[#1E293B]" />
              <span className="inline-flex items-center gap-1.5">
                <Ban className="h-3.5 w-3.5" /> No Ads
              </span>
              <span className="h-3 w-px bg-[#1E293B]" />
              <span className="inline-flex items-center gap-1.5">
                <X className="h-3.5 w-3.5" /> Cancel Anytime
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-8 px-6">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[#64748B]">
            &copy; {new Date().getFullYear()} Moody. Your mind matters.
          </span>
          <div className="flex gap-6 text-sm text-[#64748B]">
            <Link href="/login" className="hover:text-[#94A3B8] transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-[#94A3B8] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Static mood chart visualization for the showcase ─── */
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
          <stop offset="0%" stopColor="#7C9A8E" stopOpacity="0.3" />
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
          fill="#0F172A"
          stroke="#7C9A8E"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
