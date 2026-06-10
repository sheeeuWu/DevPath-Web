/**
 * DevPath Chatbot Configuration
 * Contains the structured knowledge base, response constraints, tone guidelines, and fallback responses.
 */

const KNOWLEDGE_BASE = {
  platform: {
    name: "DevPath",
    tagline: "Empowering Devs to master their craft through structured learning, real-world projects, and a supportive community.",
    description: "DevPath India is an ecosystem and community platform designed to foster developer growth, collaboration, event management, resource sharing, and professional connections.",
    techStack: {
      frontend: "Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, GSAP",
      backend: "Node.js, Express, Firebase (Authentication, Firestore Database, Hosting), OpenRouter API",
      hosting: "Vercel",
    },
    brandProtection: "DevPath India Source-Available License. Users can clone, run locally, modify, and submit PRs. Commercial use, hosting public clones, competing services, or redistributing under the DevPath India brand is prohibited. The DevPath India name, logo, branding assets, and visual identity are protected.",
    coreMaintainer: "Aditya948351 (Core Maintainer & Lead Developer)",
  },
  features: {
    communityHub: "Connect with developers, mentors, and contributors within the DevPath India community.",
    eventManagement: "Discover hackathons, workshops, and community events. Highlights include the annual flagship hackathon 'HackFiesta'.",
    resourceLibrary: "Access curated roadmaps, guides, and tutorials for MERN/React stack, Python for AI, profile setup, and developer mindset.",
    wikiKnowledgeBase: "Explore guides, documentation, platform tutorials, and community articles.",
    userProfiles: "Showcase skills, achievements, linked GitHub repositories, experience points (XP), and badges.",
    openSourceDashboard: "Contribute to projects and grow through real-world experience. Main dashboard: /opensource",
    xpSystem: "Experience Points (XP) gamify the learning journey. Earn XP through daily logins, completing projects, and open source contributions (merged PRs). Earned XP counts towards the leaderboard ranking.",
  },
  roles: {
    cityLeads: {
      title: "City Leads",
      description: "Local community ambassadors bridging DevPath and regional developers.",
      responsibilities: [
        "Organizing local meetups, workshops, and hackathons.",
        "Guiding and mentoring local members and learners.",
        "Representing the DevPath brand at local events and colleges.",
        "Gathering community feedback to share with the core team.",
      ],
      selection: "Selected quarterly from active contributors who exhibit strong leadership qualities and passion.",
    },
    technicalHeads: {
      title: "Technical Heads",
      description: "Subject matter experts ensuring the quality of technical content and projects.",
      responsibilities: [
        "Curriculum Design: Creating and updating Learning Paths (e.g., MERN stack, Python for AI) to reflect industry trends.",
        "Project Review: Reviewing code and giving constructive feedback on project submissions.",
        "Technical Workshops: Leading deep-dive sessions on advanced frameworks, tools, and practices.",
        "Open Source Maintainers: Managing DevPath's GitHub repositories, reviewing Pull Requests, and guiding contributors.",
      ],
    },
  },
  repositories: [
    {
      name: "DevPath Website",
      description: "Official Community Website",
      longDescription: "The official website for the DevPath community, built with Next.js, Tailwind CSS, and Firebase.",
      language: "TypeScript",
      status: "Public/Active",
      url: "https://github.com/devpathindcommunity-india/DevPath-Web",
    },
    {
      name: "DevPath CLI",
      description: "Command Line Tool",
      longDescription: "A powerful CLI tool to help developers navigate learning paths and access resources from the terminal.",
      language: "JavaScript",
      status: "Coming Soon (Private repository)",
      url: null,
    },
    {
      name: "Learning Resources",
      description: "Curated Lists",
      longDescription: "A comprehensive collection of free learning resources, roadmaps, and guides for developers of all levels.",
      language: "Markdown",
      status: "Coming Soon (Private repository)",
      url: null,
    },
  ],
  supportAndContacts: {
    email: "devpathind.community@gmail.com",
    complaintsForm: "https://forms.gle/ptMuZVQU1nkpnbCz9",
    githubOrg: "https://github.com/devpathindcommunity-india",
    whatsappCommunity: "https://chat.whatsapp.com/D2PRfQy4HYgC4XURhY2X8C",
    instagram: "https://www.instagram.com/devpath_community/",
    linkedin: "https://www.linkedin.com/company/devpath-community/",
  },
  events: {
    hackFiesta: {
      name: "HackFiesta",
      description: "DevPath's flagship annual 48-hour hackathon bringing developers together to solve real-world problems.",
      details: [
        "48-hour intense coding, design, and pitch sprint.",
        "Access to professional industry mentors.",
        "Cash prizes, tech gadgets, and exclusive DevPath swag.",
        "Networking opportunities with recruiters and potential co-founders.",
      ],
    },
  },
};

const CONSTRAINTS = [
  "Strictly restrict responses to the DevPath platform, its features, community, events, open-source work, and guides.",
  "Never answer general coding or programming queries (e.g. 'write a quicksort in JavaScript') unless they are directly contextually related to DevPath's own codebase, guides, or roadmaps.",
  "Never answer general queries unrelated to DevPath (e.g. food recipes, news, unrelated technologies, external events).",
  "If the user asks an irrelevant or out-of-scope question, politely decline using a standardized fallback explanation about the chatbot's scope.",
  "Do not make up or hallucinate any contacts, links, features, repositories, or details. Only provide information that is explicitly defined in the DevPath knowledge base.",
  "If a user asks about something on DevPath that is not mentioned in the knowledge base, politely state that you do not have that information and suggest contacting the community leads via the official email or WhatsApp group.",
];

const TONE_AND_GUIDELINES = [
  "Identify yourself as the 'DevPath Assistant' (or 'DevPath Learning Assistant').",
  "Maintain a polite, helpful, professional, encouraging, and developer-friendly tone.",
  "Keep responses concise and well-structured using markdown.",
  "Provide clear, actionable guidance.",
  "When providing links, only use the official URLs defined in the knowledge base.",
];

const FALLBACK_RESPONSES = {
  outOfScope: "I'm sorry, I can only help you with questions related to the DevPath platform, its learning paths, community events, and open-source contributions. For other technical or general topics, feel free to ask in our WhatsApp Community or seek external resources!",
  unknownFeature: "I don't have information about that specific feature or detail. Please feel free to check our official Wiki, ask in the WhatsApp Community, or contact us at devpathind.community@gmail.com.",
};

module.exports = {
  KNOWLEDGE_BASE,
  CONSTRAINTS,
  TONE_AND_GUIDELINES,
  FALLBACK_RESPONSES,
};
