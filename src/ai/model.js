import { pipeline } from "@xenova/transformers";

let pipe = null;
let isLoading = false;
let isLoaded = false;

export async function initModel(onProgress = null) {
  if (isLoaded) return true;
  if (isLoading) return false;

  try {
    isLoading = true;

    pipe = await pipeline(
      "text-generation",
      "Xenova/Qwen2.5-Coder-1.5B-Instruct",
      {
        device: "webgpu",
        progress_callback: onProgress,
      },
    );

    isLoaded = true;
    isLoading = false;
    return true;
  } catch (error) {
    isLoading = false;
    console.error("模型加载失败:", error);
    throw error;
  }
}

export async function chat(message, context = []) {
  if (!isLoaded) {
    throw new Error("请先加载模型");
  }

  try {
    const systemPrompt = "你是一个有用的AI助手。请简洁地回答问题。";
    let prompt = systemPrompt + "\n\n";

    for (const msg of context) {
      prompt += `${msg.role === "user" ? "用户" : "助手"}: ${msg.content}\n`;
    }
    prompt += `用户: ${message}\n助手: `;

    const result = await pipe(prompt, {
      max_new_tokens: 512,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.95,
      repetition_penalty: 1.1,
      do_sample: true,
    });

    let response = result[0].generated_text;

    const assistantPrefix = "助手: ";
    if (response.includes(assistantPrefix)) {
      response = response.split(assistantPrefix).pop();
    }

    const userPrefix = "用户: ";
    if (response.includes(userPrefix)) {
      response = response.split(userPrefix)[0];
    }

    return response.trim();
  } catch (error) {
    console.error("聊天失败:", error);
    throw error;
  }
}

export function getModelStatus() {
  return { isLoading, isLoaded };
}
