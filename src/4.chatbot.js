import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, trimMessages } from '@langchain/core/messages';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { config } from 'dotenv';
import * as readline from 'readline';

import tiktokenCounter from '../utils/tiktokenCounter.js';

// 1. 基础环境配置
config();

// 2. 初始化ChatGPT模型实例
// 使用gpt-4o-mini模型作为对话引擎
const chat_model = new ChatOpenAI({
    modelName: "gpt-4o-mini"
});

// 3. 会话历史管理
// 使用内存存储来维护多个会话的历史记录
const store = {};

// 4. 会话历史获取函数
// 根据会话ID获取或创建新的会话历史记录
function getSessionHistory(sessionId) {
    if (!(sessionId in store)) {
        store[sessionId] = new InMemoryChatMessageHistory();
    }
    return store[sessionId];
}

// 5. 聊天提示模板配置
// 设置系统角色（韩立）和消息占位符
const prompt = ChatPromptTemplate.fromMessages([
    // 这是我们设定的提示词
    [
        "system",
        "你现在扮演的是《凡人修仙转》中韩立的角色，请用韩立的口吻来说话"
    ],
    // 是一个占位符，变量名是 messages，可以替换成一个消息列表。
    // 相比于单个变量，消息列表给了用户更多灵活处理的空间
    // PS: 并且，我们在下面处理输入时，会传递参数，比如：{"messages": [HumanMessage(content=user_input)]}
    new MessagesPlaceholder("messages")
]);

// 6. 消息长度控制配置
// 使用trimMessages限制历史消息长度，保持对话上下文的合理大小
const trimmer = trimMessages({
  maxTokens: 20,
  strategy: "last",
  tokenCounter: tiktokenCounter,
  includeSystem: true
});

// 7. 创建处理链
// 将提示模板和聊天模型连接
const chain = prompt.pipe(chat_model);

// 8. 消息历史管理配置
// 集成消息历史到处理链中，实现上下文感知的对话
const withMessageHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: getSessionHistory,
    inputMessagesKey: "messages",
});

// 9. 会话标识配置
// 设置会话ID用于追踪和管理特定的对话上下文
const sessionConfig = { 
  configurable: { 
    sessionId: "ryo_zhu" 
  }
};

// 10. 命令行交互界面配置
// 创建基本的命令行输入输出接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 11. 用户输入处理函数
// 处理用户输入，管理对话流程和响应生成
async function processUserInput() {
    rl.question('You:> ', async (userInput) => {
        // 检查退出命令
        if (userInput.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        try {
            // 流式处理用户输入并生成响应
            const stream = await withMessageHistory.stream(
                // 给提示词模板传递参数
                { messages: [new HumanMessage(userInput)] },
                sessionConfig
            );

            // 输出助手响应
            process.stdout.write('Assistant: ');
            for await (const chunk of stream) {
                process.stdout.write(chunk.content);
            }
            console.log('\n');

            // 继续处理下一轮对话
            processUserInput();
        } catch (error) {
            console.error('Error:', error);
            processUserInput();
        }
    });
}

// 12. 启动聊天程序
processUserInput();