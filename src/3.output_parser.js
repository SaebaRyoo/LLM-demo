import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { config } from 'dotenv';

// 1. 设置环境变量
config();

async function translateWithOutputParser() {
  // 2. 创建提示模板
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", "Translate the following from English into Chinese:"],
    ["user", "{text}"]
  ]);

  // 3. 创建模型实例
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini"
  });

  // 4. 创建输出解析器
  const parser = new StringOutputParser();

  try {
    // 5. 创建链式调用，包含提示模板、模型和输出解析器
    // 5.1 promptTemplate处理输入的文本，将其转换为标准的提示格式
    // 5.2 通过.pipe(model)将格式化后的提示传递给ChatOpenAI模型进行处理
    // 5.3 通过.pipe(parser)将模型的输出传递给StringOutputParser进行解析，将复杂的响应对象简化为纯文本字符串
    const chain = promptTemplate
        .pipe(model)
        .pipe(parser);
    
    // 6. 调用链并传入参数
    const result = await chain.invoke({"text": "Welcome to LLM application development!"});
    
    // 7. 输出结果
    console.log(result);
  } catch (error) {
    // 8. 错误处理
    console.error('Translation error:', error);
  }
}

// 9. 调用函数
translateWithOutputParser();