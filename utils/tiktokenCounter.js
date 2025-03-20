import { encodingForModel } from "@langchain/core/utils/tiktoken";
import {
  HumanMessage,
  AIMessage,
  ToolMessage,
  SystemMessage,
} from "@langchain/core/messages";

async function strTokenCounter(
  messageContent
){
  if (typeof messageContent === "string") {
    return (await encodingForModel("gpt-4")).encode(messageContent).length;
  } else {
    if (messageContent.every((x) => x.type === "text" && x.text)) {
      return (await encodingForModel("gpt-4")).encode(
        messageContent
          .map(({ text }) => text)
          .join("")
      ).length;
    }
    throw new Error(
      `Unsupported message content ${JSON.stringify(messageContent)}`
    );
  }
}

// https://js.langchain.com/docs/how_to/trim_messages/
export default async function tiktokenCounter(messages){
  let numTokens = 3; // every reply is primed with <|start|>assistant<|message|>
  const tokensPerMessage = 3;
  const tokensPerName = 1;

  for (const msg of messages) {
    let role;
    if (msg instanceof HumanMessage) {
      role = "user";
    } else if (msg instanceof AIMessage) {
      role = "assistant";
    } else if (msg instanceof ToolMessage) {
      role = "tool";
    } else if (msg instanceof SystemMessage) {
      role = "system";
    } else {
      throw new Error(`Unsupported message type ${msg.constructor.name}`);
    }

    numTokens +=
      tokensPerMessage +
      (await strTokenCounter(role)) +
      (await strTokenCounter(msg.content));

    if (msg.name) {
      numTokens += tokensPerName + (await strTokenCounter(msg.name));
    }
  }

  return numTokens;
}
