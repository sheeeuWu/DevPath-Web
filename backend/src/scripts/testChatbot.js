/**
 * Standalone validation script for the DevPath Chatbot configuration and system prompt.
 * Runs assertions to verify configuration, system prompt structure, and buildMessages logic.
 */

const {
  KNOWLEDGE_BASE,
  CONSTRAINTS,
  TONE_AND_GUIDELINES,
  FALLBACK_RESPONSES,
} = require("../config/chatbotConfig");

const openRouterService = require("../services/openRouterService");

// Simple assertion helper
const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
};

console.log("--------------------------------------------------");
console.log("🏃 Running Chatbot Configuration & Prompt Tests...");
console.log("--------------------------------------------------");

// 1. Verify structured knowledge base
console.log("1. Verifying structured knowledge base properties...");
assert(KNOWLEDGE_BASE.platform.name === "DevPath", "Platform name should be DevPath");
assert(typeof KNOWLEDGE_BASE.platform.tagline === "string", "Tagline must be a string");
assert(Array.isArray(KNOWLEDGE_BASE.roles.cityLeads.responsibilities), "City Leads responsibilities must be an array");
assert(KNOWLEDGE_BASE.roles.cityLeads.responsibilities.length > 0, "City Leads responsibilities must not be empty");
assert(KNOWLEDGE_BASE.supportAndContacts.email === "devpathind.community@gmail.com", "Support email should be correct");
assert(KNOWLEDGE_BASE.supportAndContacts.whatsappCommunity.includes("chat.whatsapp.com"), "WhatsApp link should be correct");
console.log("✅ Knowledge base properties verified.");

// 2. Verify constraints
console.log("2. Verifying chatbot constraints...");
assert(CONSTRAINTS.length >= 5, "Should have at least 5 constraints");
assert(CONSTRAINTS.some(c => c.toLowerCase().includes("restrict")), "Constraints should restrict topic scope");
assert(CONSTRAINTS.some(c => c.toLowerCase().includes("hallucinate") || c.toLowerCase().includes("make up")), "Constraints should prevent hallucinations");
console.log("✅ Constraints verified.");

// 3. Verify tone guidelines
console.log("3. Verifying tone guidelines...");
assert(TONE_AND_GUIDELINES.length >= 3, "Should have at least 3 tone guidelines");
assert(TONE_AND_GUIDELINES.some(g => g.toLowerCase().includes("polite") || g.toLowerCase().includes("concise")), "Tone guidelines should enforce standard behavior");
console.log("✅ Tone guidelines verified.");

// 4. Verify fallback responses
console.log("4. Verifying fallback responses...");
assert(typeof FALLBACK_RESPONSES.outOfScope === "string", "Out of scope fallback must be defined");
assert(typeof FALLBACK_RESPONSES.unknownFeature === "string", "Unknown feature fallback must be defined");
console.log("✅ Fallback responses verified.");

// 5. Verify buildMessages constructs system prompt correctly
console.log("5. Verifying buildMessages integration...");
// Use createStreamingChatCompletionConfig to construct stream config and inspect messages
const dummyMessage = "What is DevPath?";
const dummyHistory = [
  { role: "user", content: "Hi" },
  { role: "assistant", content: "Hello! I am DevPath Assistant." }
];

const config = openRouterService.createStreamingChatCompletionConfig({
  message: dummyMessage,
  history: dummyHistory
});

const messages = config.body.messages;

assert(Array.isArray(messages), "Messages should be an array");
assert(messages.length === 4, `Messages should have length 4 (system, user, assistant, user). Got: ${messages.length}`);
assert(messages[0].role === "system", "First message must be system message");
assert(messages[0].content.includes("DevPath Assistant"), "System prompt should identify assistant");
assert(messages[0].content.includes("STRUCTURED KNOWLEDGE BASE"), "System prompt should include structured knowledge base section");
assert(messages[0].content.includes("CONSTRAINTS"), "System prompt should include constraints section");
assert(messages[0].content.includes("TONE & GUIDELINES"), "System prompt should include tone/guidelines section");
assert(messages[0].content.includes("devpathind.community@gmail.com"), "System prompt should contain email from knowledge base");
assert(messages[0].content.includes("HackFiesta"), "System prompt should contain event HackFiesta info");

assert(messages[1].role === "user" && messages[1].content === "Hi", "History messages preserved correctly");
assert(messages[2].role === "assistant" && messages[2].content === "Hello! I am DevPath Assistant.", "History messages preserved correctly");
assert(messages[3].role === "user" && messages[3].content === dummyMessage, "Latest user message appended correctly");

console.log("✅ buildMessages integration verified.");

console.log("\n--------------------------------------------------");
console.log("🎉 All chatbot configuration & prompt tests passed successfully!");
console.log("--------------------------------------------------");
