import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { subDays, format } from "date-fns";

let adminApp: admin.app.App | null = null;

function getAdminApp(): admin.app.App {
  if (adminApp) return adminApp;
  const existing = admin.apps.find((a) => a?.name === "seed-app");
  if (existing) { adminApp = existing; return adminApp; }
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON not set");
  const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
  adminApp = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }, "seed-app");
  return adminApp;
}

const MOOD_OPTIONS = [
  { score: 1, emoji: "😢" },
  { score: 2, emoji: "😟" },
  { score: 3, emoji: "😐" },
  { score: 4, emoji: "😊" },
  { score: 5, emoji: "😄" },
] as const;

// 30-day mood pattern: index 0 = today, index 29 = 30 days ago
const MOOD_SCORES = [4,5,4,5,4, 3,2,3,4,3, 2,1,2,3,2, 3,4,3,4,3, 2,3,4,5,4, 3,4,3,4,4];

const ENTRIES: Array<{
  daysAgo: number;
  content: string;
  moodScore: number;
  moodEmoji: string;
  sentiment: {
    score: number;
    primaryEmotion: string;
    emotions: string[];
    triggers: string[];
    summary: string;
  };
  aiResponse: string;
  promptUsed: string | null;
}> = [
  {
    daysAgo: 1,
    moodScore: 5,
    moodEmoji: "😄",
    content: "<p>Had an incredible day today. Met up with old friends for dinner and we stayed out way later than planned, just talking and laughing. It reminded me why those connections matter so much. I forget sometimes how much I need that kind of unstructured time with people I trust.</p><p>Also finished the project I'd been dreading and it actually went really well. Funny how the things we avoid the most end up being fine.</p>",
    sentiment: { score: 5, primaryEmotion: "Joy", emotions: ["Joy", "Gratitude", "Relief"], triggers: ["social connection", "achievement"], summary: "A genuinely fulfilling day combining social connection and professional accomplishment." },
    aiResponse: "What a wonderful day! The combination of meaningful connection and finishing something you'd been avoiding is so powerful. That feeling of relief mixed with joy is worth savoring. What was it about that project that made it feel so daunting beforehand?",
    promptUsed: null,
  },
  {
    daysAgo: 2,
    moodScore: 4,
    moodEmoji: "😊",
    content: "<p>Quiet but good day. I made myself do a morning walk before opening my laptop and it genuinely changed the whole tone of the day. I keep forgetting that this works every single time, yet I still resist it on most mornings.</p><p>Work was steady — nothing exciting but nothing terrible either. Had a good conversation with my manager about the direction of the next quarter. Felt heard, which is rare.</p>",
    sentiment: { score: 4, primaryEmotion: "Contentment", emotions: ["Contentment", "Gratitude", "Calm"], triggers: ["exercise", "work validation"], summary: "A calm, grounded day with small wins that added up." },
    aiResponse: "There's something so simple and so powerful about the morning walk ritual. You already know it works — maybe the real question is what's underneath the resistance? And feeling heard by your manager is huge. That kind of psychological safety is worth noting.",
    promptUsed: null,
  },
  {
    daysAgo: 4,
    moodScore: 4,
    moodEmoji: "😊",
    content: "<p>I've been thinking a lot about what I actually want out of the next year. Not in a stressed way — more like genuinely curious. There's this pull toward doing something more creative but I keep rationalizing it away.</p><p>Read for two hours today. That's the most I've done in months and it felt indulgent in the best way.</p>",
    sentiment: { score: 4, primaryEmotion: "Curiosity", emotions: ["Curiosity", "Contemplation", "Contentment"], triggers: ["self-reflection", "creativity"], summary: "A reflective day full of gentle curiosity about the future." },
    aiResponse: "That distinction between anxious future-thinking and curious future-thinking is so meaningful. What's the creative pull you keep rationalizing away? Sometimes naming it out loud is the first step to understanding what you really want.",
    promptUsed: "What do you want your life to look like in one year?",
  },
  {
    daysAgo: 6,
    moodScore: 3,
    moodEmoji: "😐",
    content: "<p>Weird day. Not bad, not good. Just gray. I kept starting things and not finishing them — emails, tasks, even a conversation I texted halfway through and then let drop.</p><p>I think I'm just tired from the week. The kind of tired that sleep doesn't fully fix.</p>",
    sentiment: { score: 3, primaryEmotion: "Fatigue", emotions: ["Fatigue", "Distraction", "Apathy"], triggers: ["exhaustion", "work overload"], summary: "Low-energy day marked by difficulty concentrating and a general sense of flatness." },
    aiResponse: "That 'gray tired' feeling is so real — and you're right that it's different from regular tiredness. It often signals that something deeper needs attention. What do you think is draining you most right now, beneath the surface level busy-ness?",
    promptUsed: null,
  },
  {
    daysAgo: 8,
    moodScore: 2,
    moodEmoji: "😟",
    content: "<p>Rough day. The team review did not go the way I expected and I left feeling embarrassed and kind of defeated. I keep replaying the moment when I stumbled over my answer and everyone just moved on. Maybe no one noticed. Maybe they all noticed.</p><p>I know I'm being hard on myself but knowing that doesn't make it easier.</p>",
    sentiment: { score: 2, primaryEmotion: "Shame", emotions: ["Shame", "Anxiety", "Self-Criticism"], triggers: ["work performance", "public speaking", "comparison"], summary: "Difficult day following a challenging presentation; strong inner critic was activated." },
    aiResponse: "That replay loop after a vulnerable moment is exhausting. But notice: you said 'stumbled over my answer' — you still gave an answer. You stayed present. That self-awareness you have about being hard on yourself? That's actually a sign of real emotional intelligence. What would you say to a friend who told you this story?",
    promptUsed: null,
  },
  {
    daysAgo: 9,
    moodScore: 1,
    moodEmoji: "😢",
    content: "<p>I don't really know how to start this. I've been feeling really low and I'm not entirely sure why. Nothing catastrophic happened. I just feel like I'm going through the motions of my life without really being in it.</p><p>I called my mom and couldn't really tell her what was wrong because I don't know what's wrong. That made me feel more alone.</p>",
    sentiment: { score: 1, primaryEmotion: "Sadness", emotions: ["Sadness", "Loneliness", "Disconnection"], triggers: ["isolation", "lack of meaning"], summary: "A heavy, low day with a pervasive sense of emptiness and disconnection from daily life." },
    aiResponse: "Thank you for writing this even when words felt hard to find. That feeling of being present but not really there — going through the motions — can be one of the harder ones to name. You don't need to know exactly what's wrong to be allowed to feel this way. The fact that you reached out, even to your mom, even without the words, shows you're still reaching. That matters.",
    promptUsed: null,
  },
  {
    daysAgo: 11,
    moodScore: 2,
    moodEmoji: "😟",
    content: "<p>Didn't sleep well again. I've been waking up around 3am with my mind already racing about the week ahead. By the time morning comes I feel like I've already lived an entire stressful day.</p><p>The deadline for the proposal is Thursday and I genuinely don't know if I'll have it ready. I keep telling myself I work better under pressure but I'm not sure that's true anymore.</p>",
    sentiment: { score: 2, primaryEmotion: "Anxiety", emotions: ["Anxiety", "Overwhelm", "Fatigue"], triggers: ["deadline", "sleep deprivation", "work pressure"], summary: "Anxiety-driven sleeplessness is compounding daytime stress around an upcoming deadline." },
    aiResponse: "That 3am brain is brutal — it hijacks your rest before the day even starts. 'I work better under pressure' is such a common story we tell ourselves, but often it's really 'I only allow myself to work when forced.' The pressure isn't helping you — it's just finally overriding the avoidance. What's one tiny piece of the proposal you could do in the next 30 minutes?",
    promptUsed: "What's weighing on your mind right now?",
  },
  {
    daysAgo: 13,
    moodScore: 3,
    moodEmoji: "😐",
    content: "<p>Mediocre day but I'll take it after the last few. Made it to the gym which felt impossible but wasn't. Ate a real meal instead of just snacking. Small wins.</p><p>I'm starting to notice that when I feel bad I also stop doing the things that help me feel better. And then I feel worse. And then the things feel even harder. It's such an obvious cycle but it's still hard to break.</p>",
    sentiment: { score: 3, primaryEmotion: "Awareness", emotions: ["Awareness", "Mild Satisfaction", "Determination"], triggers: ["exercise", "self-care"], summary: "A recovery day marked by healthy habits and growing self-awareness about depressive cycles." },
    aiResponse: "You just articulated something that therapists spend years trying to help people see: the withdrawal loop. And you noticed it yourself — from the inside, in real time. That's hard to do. The gym and the real meal aren't small wins. They're the exact interventions that break the cycle. What helped you get there today when it felt impossible?",
    promptUsed: null,
  },
  {
    daysAgo: 15,
    moodScore: 2,
    moodEmoji: "😟",
    content: "<p>Comparison hangover from scrolling last night. I know I shouldn't do it but sometimes I do anyway and then I spend the next day quietly calculating how far behind I am from some imaginary version of my life.</p><p>Tried to do some creative work and it all felt fake and pointless. The inner critic was loud today.</p>",
    sentiment: { score: 2, primaryEmotion: "Inadequacy", emotions: ["Inadequacy", "Comparison", "Self-Criticism"], triggers: ["social media", "comparison", "creative block"], summary: "Social media comparison spiral led to diminished creative confidence and self-worth." },
    aiResponse: "'Comparison hangover' — that's a perfect way to name it. The imaginary version of your life that everyone else seems to be living. Here's a question worth sitting with: whose life are you actually measuring against? A composite of many people's highlight reels? If you put down the measuring stick completely for just one day, what would you actually want to work on?",
    promptUsed: null,
  },
  {
    daysAgo: 17,
    moodScore: 3,
    moodEmoji: "😐",
    content: "<p>I had a long conversation with a friend who's been going through something hard and it shifted my perspective. Not in a 'my problems are smaller' way — more like, connection is the thing. That's really it. When I feel connected I can handle almost anything.</p>",
    sentiment: { score: 3, primaryEmotion: "Empathy", emotions: ["Empathy", "Connectedness", "Perspective"], triggers: ["social connection", "helping others"], summary: "A meaningful conversation offered perspective and reinforced the value of human connection." },
    aiResponse: "That insight — 'connection is the thing' — is worth writing somewhere you'll see it. Not as a reminder but as a compass. When you're struggling, what would it look like to reach toward connection instead of away from it?",
    promptUsed: null,
  },
  {
    daysAgo: 19,
    moodScore: 4,
    moodEmoji: "😊",
    content: "<p>Took a proper day off today. No work, no emails, just wandered around and did things I've been meaning to do for months. Got a coffee from the place I always walk past but never go into. Browsed a bookstore for an hour. Sat in a park.</p><p>I feel like a person again.</p>",
    sentiment: { score: 4, primaryEmotion: "Restoration", emotions: ["Restoration", "Contentment", "Freedom"], triggers: ["rest", "leisure", "nature"], summary: "A intentional day of rest restored a sense of self and simple pleasure." },
    aiResponse: "'I feel like a person again.' — hold onto that. What does it say about how you'd been feeling before? And what's the smallest version of today you could build into a regular week, even just one element?",
    promptUsed: "Describe a moment today when you felt like yourself.",
  },
  {
    daysAgo: 21,
    moodScore: 2,
    moodEmoji: "😟",
    content: "<p>Conflict with a colleague that I've been avoiding came to the surface today. It wasn't dramatic but it was uncomfortable. I said my piece and so did they. I don't know if it helped or made things worse yet.</p><p>I hate conflict. I always feel like I've done something wrong just by being in one, even when I know logically I haven't.</p>",
    sentiment: { score: 2, primaryEmotion: "Anxiety", emotions: ["Anxiety", "Discomfort", "Guilt"], triggers: ["conflict", "workplace stress", "confrontation"], summary: "A necessary but uncomfortable workplace conflict surfaced guilt and conflict-aversion." },
    aiResponse: "Saying your piece even when you hate conflict — that took something. That feeling of having 'done something wrong just by being in a conflict'? That's worth exploring. It's very common in people who grew up equating harmony with safety. But conflict handled with honesty is often how relationships actually deepen. How do you think you'll feel about today in a week?",
    promptUsed: null,
  },
  {
    daysAgo: 23,
    moodScore: 4,
    moodEmoji: "😊",
    content: "<p>Good productive day. Got into a real flow state in the morning, the kind where you look up and three hours have passed. I need more of that.</p><p>Been thinking about what actually creates those conditions for me: no notifications, something slightly hard but not impossible, coffee before but not during, music without lyrics. I should be more intentional about manufacturing that environment.</p>",
    sentiment: { score: 4, primaryEmotion: "Engagement", emotions: ["Engagement", "Satisfaction", "Clarity"], triggers: ["deep work", "flow state", "productivity"], summary: "A deep work session produced flow and sparked useful reflection on optimal work conditions." },
    aiResponse: "You just did something most people never do: reverse-engineered your own flow state. That's genuinely useful data. The fact that you can articulate those four conditions means you could actually design for them tomorrow instead of hoping they happen. What would it take to protect that first block of your morning more consistently?",
    promptUsed: null,
  },
  {
    daysAgo: 25,
    moodScore: 5,
    moodEmoji: "😄",
    content: "<p>Something clicked today. Can't fully explain it. I woke up and just felt clear — like the static that's been in my head for weeks finally went quiet. I got so much done, not because I was forcing it but because I actually wanted to.</p><p>I went for a run at sunset and felt genuinely happy. Not the performance of happy, just actually happy.</p>",
    sentiment: { score: 5, primaryEmotion: "Joy", emotions: ["Joy", "Clarity", "Vitality"], triggers: ["exercise", "mental clarity", "nature"], summary: "A spontaneous high day marked by genuine clarity and joy — a meaningful contrast to recent struggles." },
    aiResponse: "Those days when the static clears — they're worth documenting closely because they're teaching you something. 'Not the performance of happy, just actually happy.' That distinction is profound. What was different about how you woke up? What had changed in the day or two before?",
    promptUsed: null,
  },
  {
    daysAgo: 27,
    moodScore: 3,
    moodEmoji: "😐",
    content: "<p>First entry in this journal. I downloaded this app because I've been told writing helps but I've never been consistent with it. Feels a bit strange to write to no one.</p><p>Today was fine. Work was normal. I cooked dinner, watched something, went to bed. Nothing to report, which maybe is the point — to write even when there's nothing to report.</p>",
    sentiment: { score: 3, primaryEmotion: "Neutrality", emotions: ["Calm", "Uncertainty", "Openness"], triggers: ["new habit", "routine"], summary: "First journal entry — tentative but open, marking the start of a new reflective practice." },
    aiResponse: "Welcome. 'Writing to no one' is actually one of the most honest forms of writing there is. And you're right — writing when there's nothing to report is exactly the practice. The nothing-days are often where the most interesting patterns live, once you start collecting them. What made you decide to start today specifically?",
    promptUsed: "What does a typical day feel like for you right now?",
  },
  {
    daysAgo: 29,
    moodScore: 4,
    moodEmoji: "😊",
    content: "<p>Started journaling again after years away from it. I used to do it as a teenager and then somewhere along the way it felt self-indulgent. Looking back that's such a strange thing to have decided — that paying attention to your own inner life is somehow excessive.</p><p>Anyway, here I am. Feeling decent today. Cautiously optimistic about some things.</p>",
    sentiment: { score: 4, primaryEmotion: "Hope", emotions: ["Hope", "Nostalgia", "Self-Compassion"], triggers: ["new beginnings", "self-reflection"], summary: "A hopeful return to journaling, paired with gentle self-compassion for time away from the practice." },
    aiResponse: "'Self-indulgent' — that's such a telling word to have applied to your own inner life. Where do you think that judgment came from? And what shifted that made it feel okay to come back to this? Cautiously optimistic about what?",
    promptUsed: null,
  },
];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const firestore = getAdminApp().firestore();
    const now = new Date();
    const batch = firestore.batch();

    // Seed mood records for 30 days
    for (let i = 0; i < 30; i++) {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const moodOption = MOOD_OPTIONS[MOOD_SCORES[i] - 1];

      const moodRef = firestore.doc(`users/${userId}/moods/${dateStr}`);
      batch.set(moodRef, {
        score: moodOption.score,
        emoji: moodOption.emoji,
        createdAt: admin.firestore.Timestamp.fromDate(date),
      });
    }

    await batch.commit();

    // Seed journal entries (sequentially to avoid batch size limits)
    for (const entry of ENTRIES) {
      const entryDate = subDays(now, entry.daysAgo);
      entryDate.setHours(20, 0, 0, 0); // Evening entries

      await firestore.collection(`users/${userId}/entries`).add({
        content: entry.content,
        moodScore: entry.moodScore,
        moodEmoji: entry.moodEmoji,
        createdAt: admin.firestore.Timestamp.fromDate(entryDate),
        sentiment: entry.sentiment,
        aiResponse: entry.aiResponse,
        promptUsed: entry.promptUsed,
      });
    }

    return NextResponse.json({ success: true, moods: 30, entries: ENTRIES.length });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
