
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { config } from 'dotenv';

// 1. 设置环境变量
config();

async function translateWithPromptTemplate() {
  // 2. 创建提示模板
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", "Translate the following from English into Chinese:"],
    ["user", "{text}"]
  ]);

  // 3. 创建模型实例
  const model = new ChatOpenAI({
    modelName: "gpt-4"
  });

  try {
    // 4. 创建链式调用
    const chain = promptTemplate.pipe(model);
    
    // 5. 调用链并传入参数
    const result = await chain.invoke({"text": "Welcome to LLM application development!"});
    
    // 6. 输出结果
    console.log(result);
  } catch (error) {
    // 7. 错误处理
    console.error('Translation error:', error);
  }
}

// 8. 调用函数
translateWithPromptTemplate();