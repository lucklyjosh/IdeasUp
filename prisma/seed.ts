import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env.local") })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create dummy users
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      id: "seed-alice",
      username: "alice_builds",
      email: "alice@example.com",
      avatarUrl: null,
      bio: "Full-stack dev, AI enthusiast",
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      id: "seed-bob",
      username: "bob_ships",
      email: "bob@example.com",
      avatarUrl: null,
      bio: "Product manager turned builder",
    },
  })

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      id: "seed-carol",
      username: "carol_codes",
      email: "carol@example.com",
      avatarUrl: null,
      bio: "Healthcare tech, open source lover",
    },
  })

  const dave = await prisma.user.upsert({
    where: { email: "dave@example.com" },
    update: {},
    create: {
      id: "seed-dave",
      username: "dave_designs",
      email: "dave@example.com",
      avatarUrl: null,
      bio: "Designer who codes",
    },
  })

  const users = [alice, bob, carol, dave]

  // Ideas
  const ideas = [
    {
      type: "IDEA" as const,
      title: "AI-powered code review bot that learns your team's style",
      description: "A GitHub bot that goes beyond linting — it learns from your merged PRs what your team considers good code, then gives contextual suggestions on new PRs. Think of it like having a senior dev review every PR, but it never sleeps.",
      stage: "PROTOTYPE" as const,
      techStack: ["TypeScript", "OpenAI", "GitHub API", "Postgres"],
      categories: ["AI / ML", "Open source"],
      score: 47,
      authorId: alice.id,
    },
    {
      type: "IDEA" as const,
      title: "Vibe coding music app — AI DJ that matches your flow state",
      description: "An app that detects your coding rhythm (keystrokes, git activity) and dynamically generates lo-fi / ambient music that adapts to your focus level. Speed up? The beat picks up. Take a break? It mellows out.",
      stage: "IDEA" as const,
      techStack: ["React Native", "TensorFlow", "Spotify API"],
      categories: ["Vibe coding", "AI / ML"],
      score: 38,
      authorId: bob.id,
    },
    {
      type: "IDEA" as const,
      title: "Open source Vercel alternative for self-hosters",
      description: "A self-hosted deployment platform with git push deploys, preview URLs, and automatic SSL. Like Vercel but you own the infra. Built for people who want the DX without the vendor lock-in.",
      stage: "PROTOTYPE" as const,
      techStack: ["Go", "Docker", "Traefik", "SQLite"],
      categories: ["Open source", "Startup"],
      score: 62,
      authorId: dave.id,
    },
    {
      type: "IDEA" as const,
      title: "Tiny CRM for freelancers — no bloat, just clients and invoices",
      description: "Every CRM is built for sales teams of 50. I want one for solo devs and designers: track clients, send invoices, log conversations. One page, keyboard-first, loads in 200ms.",
      stage: "IDEA" as const,
      techStack: ["Next.js", "Tailwind", "Supabase"],
      categories: ["Side project", "Startup"],
      score: 29,
      authorId: alice.id,
    },
    {
      type: "IDEA" as const,
      title: "Browser extension that explains any API docs with examples",
      description: "Highlight any function in docs (MDN, Stripe, AWS) and get a popup with real-world usage examples pulled from open source repos. No more guessing what the params actually mean.",
      stage: "LIVE" as const,
      techStack: ["Chrome Extension", "TypeScript", "Claude API"],
      categories: ["AI / ML", "Side project"],
      score: 51,
      authorId: carol.id,
    },
    {
      type: "IDEA" as const,
      title: "GitHub contribution graph but for habits — open source",
      description: "A minimal habit tracker that shows your streaks as a contribution-style heatmap. No accounts, data stays local in IndexedDB. Export as PNG to flex on Twitter.",
      stage: "LIVE" as const,
      techStack: ["Svelte", "IndexedDB", "Canvas API"],
      categories: ["Open source", "Side project"],
      score: 34,
      authorId: bob.id,
    },
  ]

  // Needs
  const needs = [
    {
      type: "NEED" as const,
      title: "Automate patient intake forms for small clinics",
      description: "We're a 5-doctor clinic still using paper intake forms. Need a simple tablet-friendly web app where patients fill in their info, sign consent, and it flows into our system. HIPAA considerations are key.",
      industry: "Healthcare",
      willingToPay: true,
      score: 23,
      authorId: carol.id,
    },
    {
      type: "NEED" as const,
      title: "Dashboard to track warehouse inventory across 3 locations",
      description: "We run a small e-commerce brand with 3 warehouses. Currently tracking inventory in spreadsheets. Need a real-time dashboard showing stock levels, low-stock alerts, and transfer history between locations.",
      industry: "Logistics",
      willingToPay: true,
      score: 18,
      authorId: bob.id,
    },
    {
      type: "NEED" as const,
      title: "Simple booking system for a tutoring center",
      description: "Parents need to book 1-on-1 tutoring sessions for their kids. Need calendar view, automatic reminders, and payment integration. Nothing fancy, just reliable. Currently using WhatsApp groups and it's chaos.",
      industry: "Education",
      willingToPay: true,
      score: 31,
      authorId: dave.id,
    },
    {
      type: "NEED" as const,
      title: "Contract template generator for freelance lawyers",
      description: "Lawyers in our network draft similar contracts over and over. Need a tool where they pick a template, fill in variables (client name, terms, jurisdiction), and get a clean PDF. Must handle clause variations.",
      industry: "Legal",
      willingToPay: false,
      score: 14,
      authorId: alice.id,
    },
    {
      type: "NEED" as const,
      title: "Expense report tool that reads receipts with OCR",
      description: "Our 20-person team submits expense reports monthly. Currently they email photos of receipts to accounting. Need an app where they snap a photo, OCR extracts the amount/vendor/date, and it generates a report for approval.",
      industry: "Finance",
      willingToPay: true,
      score: 27,
      authorId: carol.id,
    },
  ]

  for (const idea of ideas) {
    await prisma.post.create({
      data: {
        ...idea,
        description: idea.description,
        industry: null,
        links: [],
        mediaUrls: [],
        willingToPay: false,
        status: "OPEN",
        categories: idea.categories,
      },
    })
  }

  for (const need of needs) {
    await prisma.post.create({
      data: {
        ...need,
        description: need.description,
        stage: null,
        techStack: [],
        links: [],
        mediaUrls: [],
          status: "OPEN",
        categories: [],
      },
    })
  }

  // Add some comments
  const allPosts = await prisma.post.findMany({ take: 5 })

  const comments = [
    { body: "This is exactly what I've been looking for. Would love to contribute to the frontend!", userId: bob.id },
    { body: "Have you considered using WebSockets for the real-time sync? Could simplify the architecture.", userId: carol.id },
    { body: "Shipped something similar last year — happy to share lessons learned. DM me!", userId: dave.id },
    { body: "The market for this is bigger than you think. Every small biz I know has this problem.", userId: alice.id },
    { body: "Clean idea. What's your monetization plan?", userId: bob.id },
    { body: "I'd pay for this today. Seriously, how do I sign up for the beta?", userId: carol.id },
    { body: "This pairs well with the OCR receipt scanner idea above. Could be one product.", userId: dave.id },
  ]

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i]
    // Add 1-2 comments per post
    const commenter = users[(i + 1) % users.length]
    await prisma.comment.create({
      data: {
        body: comments[i].body,
        userId: commenter.id,
        postId: post.id,
      },
    })

    if (i < 3) {
      const replier = users[(i + 2) % users.length]
      const parentComment = await prisma.comment.findFirst({ where: { postId: post.id } })
      if (parentComment) {
        await prisma.comment.create({
          data: {
            body: comments[i + 4].body,
            userId: replier.id,
            postId: post.id,
            parentId: parentComment.id,
          },
        })
      }
    }
  }

  console.log("Seeded 4 users, 11 posts, and comments.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
