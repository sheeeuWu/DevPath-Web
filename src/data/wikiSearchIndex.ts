import { SearchableArticle } from '@/utils/wikiSearch';

/**
 * Flat search index for all wiki articles.
 * Add `description` and `keywords` here when you add new articles to wikiContent.tsx.
 */
export const wikiSearchIndex: SearchableArticle[] = [
    {
        id: "intro",
        title: "Introduction to DevPath",
        category: "Getting Started",
        description: "Learn what DevPath is — a developer ecosystem for structured learning, real-world projects, XP, badges, and peer collaboration.",
        keywords: ["devpath", "overview", "learning", "xp", "badges", "projects", "community", "ecosystem", "get started"],
    },
    {
        id: "setup",
        title: "Setting Up Your Profile",
        category: "Getting Started",
        description: "Complete your bio, link your GitHub account, and add your skills to get personalized project recommendations.",
        keywords: ["profile", "bio", "github", "skills", "setup", "account", "onboarding"],
    },
    {
        id: "xp",
        title: "Understanding XP System",
        category: "Getting Started",
        description: "Earn XP through daily logins, completing projects, and merged pull requests. Gamify your learning journey.",
        keywords: ["xp", "experience points", "gamification", "leaderboard", "rewards", "points", "login streak", "pull request"],
    },
    {
        id: "react",
        title: "Full Stack React Guide",
        category: "Learning Paths",
        description: "Master the MERN stack with React, Node.js, Express, MongoDB, Redux, and Zustand through a hands-on curriculum.",
        keywords: ["react", "mern", "node", "express", "mongodb", "redux", "zustand", "full stack", "javascript", "frontend", "backend", "hooks"],
    },
    {
        id: "python",
        title: "Python for AI Roadmap",
        category: "Learning Paths",
        description: "Go from Python basics to building neural networks with NumPy, Pandas, Scikit-Learn, TensorFlow, and PyTorch.",
        keywords: ["python", "ai", "machine learning", "deep learning", "numpy", "pandas", "scikit-learn", "tensorflow", "pytorch", "neural network", "roadmap"],
    },
    {
        id: "community-offerings",
        title: "What Community Offers",
        category: "Community",
        description: "Discover structured roadmaps, peer learning, career support, mock interviews, job referrals, and exclusive hackathon access.",
        keywords: ["benefits", "career", "roadmap", "peer learning", "interview", "job", "referral", "hackathon", "webinar", "recognition"],
    },
    {
        id: "city-leads",
        title: "City Leads",
        category: "Community",
        description: "City Leads organize local meetups, workshops, and hackathons. Learn how to apply and what responsibilities are involved.",
        keywords: ["city lead", "local", "meetup", "workshop", "ambassador", "leadership", "mentorship", "region", "apply"],
    },
    {
        id: "technical-heads",
        title: "Technical Heads",
        category: "Community",
        description: "Technical Heads design curriculum, review projects, conduct workshops, and maintain open-source repositories.",
        keywords: ["technical head", "curriculum", "project review", "workshop", "open source", "maintainer", "expert", "pr review"],
    },
    {
        id: "wp-community",
        title: "WhatsApp Community",
        category: "Community",
        description: "Join the WhatsApp group for instant updates, bug help, daily tech discussions, polls, and quizzes.",
        keywords: ["whatsapp", "chat", "group", "instant", "updates", "discussions", "polls", "quiz", "notifications"],
    },
    {
        id: "hackfiesta",
        title: "HackFiesta",
        category: "Community",
        description: "DevPath's flagship 48-hour annual hackathon with mentors, cash prizes, swag, and networking opportunities.",
        keywords: ["hackathon", "hackfiesta", "48 hour", "prizes", "swag", "mentors", "networking", "annual", "event", "coding competition"],
    },
    {
        id: "guidelines",
        title: "Code of Conduct",
        category: "Community",
        description: "Our community standards: be respectful, inclusive, avoid harassment and discrimination, and give only constructive criticism.",
        keywords: ["conduct", "rules", "guidelines", "respect", "inclusive", "harassment", "safe", "standards", "community rules"],
    },
    {
        id: "contributing",
        title: "How to Contribute",
        category: "Community",
        description: "Fork the repo, create a feature branch, commit changes, and open a Pull Request to contribute to DevPath.",
        keywords: ["contribute", "fork", "pull request", "pr", "branch", "git", "open source", "commit", "github"],
    },
    {
        id: "open-source",
        title: "Open Source at DevPath",
        category: "Community",
        description: "Explore active repositories, pick good-first-issue tickets, submit PRs, and earn open source badges and extra XP.",
        keywords: ["open source", "github", "repository", "good first issue", "pr", "badge", "xp", "contribution", "maintainer"],
    },
];
