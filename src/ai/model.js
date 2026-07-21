import { pipeline, TextStreamer } from "@huggingface/transformers";

/**
 * AI 模型封装 - Transformers.js v4
 * 模型: onnx-community/Qwen3-0.6B-ONNX (~300MB, q4f16 量化, 最大 32k context)
 * 支持 WebGPU 加速（自动降级到 WASM）
 */

// ==================== 上下文预算配置 ====================
/** 总 context 预算（token），32k 中留足余量给输出 */
const MAX_CONTEXT_TOKENS = 6000;
/** RAG 知识最大 token 数 */
const MAX_RAG_TOKENS = 1000;
/** 单条消息最大 token 数（超出则截断） */
const MAX_MSG_TOKENS = 1500;
/** 输出最大 token 数 */
const MAX_NEW_TOKENS = 512;

let pipe = null;
let isLoaded = false;

// ==================== Token 工具 ====================

/**
 * 计算文本的 token 数
 */
function countTokens(text) {
  if (!pipe || !pipe.tokenizer) return Math.ceil(text.length / 2);
  return pipe.tokenizer.encode(text).length;
}

/**
 * 按 token 预算截断文本（从尾部保留）
 */
function truncateText(text, maxTokens) {
  if (!pipe || !pipe.tokenizer) return text.slice(-maxTokens * 2);
  const encoded = pipe.tokenizer.encode(text);
  if (encoded.length <= maxTokens) return text;
  return pipe.tokenizer.decode(encoded.slice(-maxTokens));
}

// ==================== 模型加载 ====================

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

// ==================== 上下文构建 ====================

/**
 * 构建 system prompt
 */
function buildSystemPrompt(ragContext) {
  if (ragContext) {
    return (
      "你是一个前端开发助手，精通 uni-app 和 Vue.js。以下是与你回答相关的知识，请严格据此回答：\n\n" +
      ragContext +
      "\n\n回答规则：1) 优先参考上面的知识库给出准确代码 2) 给出完整可运行的代码示例 3) 用中文解释关键步骤。回答要简洁直接，不要输出推理过程。"
    );
  }
  return (
    "你是一个前端开发助手，精通 uni-app 和 Vue.js。" +
    "\n\n回答规则：1) 给出完整可运行的代码示例 2) 用中文解释关键步骤。回答要简洁直接，不要输出推理过程。"
  );
}

/**
 * 构建 messages 数组，token 感知地保留尽可能多的历史
 * @returns {{ messages: Array, truncated: boolean }}
 */
function buildMessages(userInput, context, systemContent) {
  const systemTokens = countTokens(systemContent);
  const userTokens = countTokens(userInput);
  const overheadTokens = systemTokens + userTokens + 200; // 200 为 chat template 开销

  let remaining = MAX_CONTEXT_TOKENS - overheadTokens;
  let truncated = false;

  // 从最新到最旧，尽可能多地保留历史消息
  const keptContext = [];
  for (let i = context.length - 1; i >= 0; i--) {
    let content = context[i].content;

    // 单条消息截断
    if (countTokens(content) > MAX_MSG_TOKENS) {
      content = truncateText(content, MAX_MSG_TOKENS);
    }

    const tokens = countTokens(content);
    if (remaining - tokens < 0) {
      truncated = true;
      break;
    }

    remaining -= tokens;
    keptContext.unshift({ role: context[i].role, content });
  }

  const messages = [{ role: "system", content: systemContent }];

  // 如果历史被截断，加一条提示
  if (truncated && keptContext.length > 0) {
    messages.push({
      role: "system",
      content: `[注意：对话历史已超出上下文限制，以下仅保留最近 ${keptContext.length} 轮对话]`,
    });
  }

  messages.push(...keptContext);
  messages.push({ role: "user", content: "/no_think " + userInput });

  return { messages, truncated };
}

// ==================== 聊天接口 ====================

/**
 * 发送消息，返回 AI 回复（流式）
 * @param {string} userInput - 当前用户输入
 * @param {Array} context - 对话历史 [{role, content}]
 * @param {function} onToken - 流式回调，每生成一段文本时调用
 * @param {string} ragContext - RAG 检索到的知识上下文（可选）
 */
export async function chat(userInput, context, onToken, ragContext = "") {
  if (!pipe) throw new Error("模型尚未加载");

  // RAG 上下文截断
  const trimmedRag =
    ragContext && countTokens(ragContext) > MAX_RAG_TOKENS
      ? truncateText(ragContext, MAX_RAG_TOKENS)
      : ragContext;

  const systemContent = buildSystemPrompt(trimmedRag);

  const { messages, truncated } = buildMessages(
    userInput,
    context,
    systemContent,
  );

  if (truncated) {
    console.warn(
      `[Context] 对话历史已截断，保留 ${messages.length - 2} 条历史消息`,
    );
  }

  const streamer = new TextStreamer(pipe.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => {
      if (onToken) onToken(text);
    },
  });

  try {
    const result = await pipe(messages, {
      max_new_tokens: MAX_NEW_TOKENS,
      temperature: 0.5,
      do_sample: false,
      num_beams: 1,
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
