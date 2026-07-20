import { pipeline, env } from "@xenova/transformers";

// 禁用本地模型加载，强制从 Hugging Face Hub 下载
env.allowLocalModels = false;
env.allowRemoteModels = true;

let pipe = null;
let isLoading = false;
let isLoaded = false;

export async function initModel(onProgress = null) {
  if (isLoaded) return true;
  if (isLoading) return false;

  try {
    isLoading = true;
    console.log("开始加载模型...");

    pipe = await pipeline("text-generation", "Xenova/Qwen1.5-0.5B-Chat", {
      device: "wasm",
      progress_callback: (progress) => {
        console.log("加载进度:", progress);
        if (onProgress) {
          onProgress(progress);
        }
      },
      quantized: true,
    });

    console.log("模型加载成功！");
    isLoaded = true;
    isLoading = false;
    return true;
  } catch (error) {
    isLoading = false;
    console.error("模型加载失败:", error);
    console.error("错误详情:", error.message);
    console.error("错误堆栈:", error.stack);
    throw error;
  }
}

export async function chat(message, context = []) {
  if (!isLoaded) {
    throw new Error("请先加载模型");
  }

  try {
    // 使用模型的聊天模板
    const messages = [
      { role: "system", content: "你是一个有用的AI助手。请简洁地回答问题。" },
      ...context.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // 应用聊天模板
    const text = pipe.tokenizer.apply_chat_template(messages, {
      tokenize: false,
      add_generation_prompt: true,
    });

    console.log("发送的提示词:", text);

    const result = await pipe(text, {
      max_new_tokens: 256,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.95,
      repetition_penalty: 1.1,
      do_sample: true,
      return_full_text: false,
    });

    console.log("模型输出:", result);
    return result[0].generated_text.trim();
  } catch (error) {
    console.error("聊天失败:", error);
    throw error;
  }
}

export function getModelStatus() {
  return { isLoading, isLoaded };
}
