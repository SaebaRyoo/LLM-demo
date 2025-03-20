import { ChatOpenAI } from '@langchain/openai';  
import { SystemMessage, HumanMessage } from '@langchain/core/messages';  
import { config } from 'dotenv';

// 1. 设置环境变量  
config();

async function translateMessage() {  
  // 2. 创建消息数组
  const messages = [  
    new SystemMessage({ content: "Translate the following from English into Chinese:" }),  
    new HumanMessage({ content: "Welcome to LLM application development!" })  
  ];

  // 3. 创建聊天模型实例
  const mychatmodel = new ChatOpenAI({  
    modelName: "gpt-4o-mini",  
    // 可选：配置其他参数  
    // temperature: 0.7,  
    // maxTokens: 100  
  });

  try {  
    // 4. 使用stream方法实现流式输出
    const stream = await mychatmodel.stream(messages);
    
    // 5. 处理流式响应
    process.stdout.write('输出: ');
    for await (const chunk of stream) {
      process.stdout.write(chunk.content + '|');
    }
    process.stdout.write('\n');
  } catch (error) {  
    // 6. 错误处理
    console.error('Translation error:', error);  
  }  
}  

// 7. 调用函数  
translateMessage();