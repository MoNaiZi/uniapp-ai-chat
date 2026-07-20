import { pipeline, TextStreamer } from "@huggingface/transformers";
import UNIAPP_KNOWLEDGE from "./uniapp-knowledge.js";

/**
 * AI 模型封装 - Transformers.js v4
 * 模型: onnx-community/Qwen3-0.6B-ONNX (~300MB, q4f16 量化)
 * 支持 WebGPU 加速（自动降级到 WASM）
 */

let pipe = null;
let isLoaded = false;

/**
 * 加载模型，返回加载进度回调
 */
export async function initModel(onProgress) {
  if (pipe) return true;

  try {
    pipe = await pipeline("text-generation", "onnx-community/Qwen3-0.6B-ONNX", {
      dtype: "q4f16",
      device: "webgpu",
      progress_callback: (progress) => {
        if (onProgress) onProgress(progress);
      },
      tokenizer: {
        chat_template_kwargs: { enable_thinking: false },
      },
    });
    isLoaded = true;
    return true;
  } catch (e) {
    // WebGPU 不可用时降级到 WASM
    console.warn("WebGPU 不可用，降级到 WASM:", e.message);
    try {
      pipe = await pipeline(
        "text-generation",
        "onnx-community/Qwen3-0.6B-ONNX",
        {
          dtype: "q4f16",
          device: "wasm",
          progress_callback: (progress) => {
            if (onProgress) onProgress(progress);
          },
          tokenizer: {
            chat_template_kwargs: { enable_thinking: false },
          },
        },
      );
      isLoaded = true;
      return true;
    } catch (e2) {
      console.error("模型加载失败:", e2);
      throw e2;
    }
  }
}

/**
 * 发送消息，返回 AI 回复（流式）
 * @param {string} userInput - 当前用户输入
 * @param {Array} context - 对话历史 [{role, content}]
 * @param {function} onToken - 流式回调，每生成一段文本时调用
 */
export async function chat(userInput, context, onToken) {
  if (!pipe) throw new Error("模型尚未加载");

  const messages = [
    {
      role: "system",
      content:
        "你是一个前端开发助手，精通 uni-app 和 Vue.js。以下是 uni-app 核心知识，请严格据此回答：\n\n" +
        UNIAPP_KNOWLEDGE +
        "\n\n回答规则：1) 优先参考上面的知识库给出准确代码 2) 给出完整可运行的代码示例 3) 用中文解释关键步骤。回答要简洁直接，不要输出推理过程。",
    },
    ...context.slice(-4).map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: "user", content: "/no_think " + userInput },
  ];

  const streamer = new TextStreamer(pipe.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => {
      if (onToken) onToken(text);
    },
  });

  try {
    const result = await pipe(messages, {
      max_new_tokens: 256,
      temperature: 0.5,
      do_sample: false,
      streamer,

      chat_template_kwargs: {
        enable_thinking: false,
      },
    });

    // v4 返回格式: [{generated_text: [{role, content}, ...]}]
    const generated = result[0].generated_text;
    const lastMsg = generated.at(-1);
    let content = lastMsg.content || JSON.stringify(lastMsg);

    // Qwen3 模型会输出 <think>...</think> 思考过程（可能不闭合），需要过滤
    content = content.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "").trim();
    // 清理可能残留的 </think> 闭合标签
    content = content.replace(/<\/think>/gi, "").trim();

    return content;
  } catch (e) {
    console.error("聊天失败:", e);
    throw e;
  }
}

/**
 * 模型是否已加载
 */
export function getModelStatus() {
  return { isLoading: false, isLoaded };
}
