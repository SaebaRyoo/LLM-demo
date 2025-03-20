import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { 
    AIMessage,
    HumanMessage,
    SystemMessage, trimMessages } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { config } from 'dotenv';

const messages = [
    new SystemMessage("you're a good assistant, you always respond with a joke."),
    new HumanMessage("i wonder why it's called langchain"),
    new AIMessage(
      'Well, I guess they thought "WordRope" and "SentenceString" just didn\'t have the same ring to it!'
    ),
    new HumanMessage("and who is harrison chasing anyways"),
    new AIMessage(
      "Hmmm let me think.\n\nWhy, he's probably chasing after the last cup of coffee in the office!"
    ),
    new HumanMessage("what do you call a speechless parrot"),
  ];
config();
const chatHistory = new InMemoryChatMessageHistory(messages.slice(0, -1));

const dummyGetSessionHistory = async (sessionId) => {
  if (sessionId !== "1") {
    throw new Error("Session not found");
  }
  return chatHistory;
};

const llm = new ChatOpenAI({ model: "gpt-4o" });

const trimmer = trimMessages({
  maxTokens: 45,
  strategy: "last",
  tokenCounter: llm,
  includeSystem: true,
});

const chain = trimmer.pipe(llm);
const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: dummyGetSessionHistory,
});
await chainWithHistory.invoke(
  [new HumanMessage("what do you call a speechless parrot")],
  { configurable: { sessionId: "1" } }
);