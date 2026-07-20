<script setup>
import { ref, onMounted, nextTick } from "vue";
import { initModel, chat, getModelStatus } from "../ai/model";

const input = ref("");
const messages = ref([]);
const modelStatus = ref({ isLoading: false, isLoaded: false });
const isSending = ref(false);
const error = ref(null);
const progress = ref(0);
const progressText = ref("");
const messagesContainer = ref(null);

async function loadModel() {
    try {
        error.value = null;
        modelStatus.value = getModelStatus();

        await initModel((progressData) => {
            if (progressData.status === 'downloading') {
                progress.value = progressData.progress || 0;
                progressText.value = `正在下载 ${progressData.file}`;
            } else if (progressData.status === 'progress') {
                progress.value = progressData.progress || 0;
                progressText.value = `正在加载 ${progressData.file}`;
            } else if (progressData.status === 'initiate') {
                progressText.value = `正在初始化 ${progressData.file}`;
            } else if (progressData.status === 'done') {
                progressText.value = `${progressData.file} 已完成`;
            } else {
                progressText.value = JSON.stringify(progressData);
            }
        });

        modelStatus.value = getModelStatus();
    } catch (err) {
        error.value = "模型加载失败: " + err.message;
        modelStatus.value = getModelStatus();
    }
}

function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForRender() {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

async function typewriterEffect(text, index) {
    for (let i = 0; i < text.length; i++) {
        messages.value[index].content += text[i];
        scrollToBottom();
        // 调整打字速度，让效果更自然
        await sleep(Math.random() * 30 + 20);
    }
    // 打字机效果完成后，更新时间戳为完成时间
    messages.value[index].timestamp = new Date();
}

async function send() {
    if (!input.value.trim() || isSending.value) return;
    if (!modelStatus.value.isLoaded) {
        error.value = "请先加载模型";
        return;
    }

    const userMessage = input.value.trim();
    input.value = "";
    isSending.value = true;
    error.value = null;

    // 立即添加用户消息
    messages.value.push({
        role: "user",
        content: userMessage,
        timestamp: new Date()
    });
    scrollToBottom();

    // 先添加 AI 消息占位符
    const aiMessageIndex = messages.value.length;
    messages.value.push({
        role: "ai",
        content: "",
        timestamp: new Date(),
        processingTime: null
    });

    // 等待 UI 渲染完毕，确保用户消息和 AI 占位符先显示
    await waitForRender();

    // 开始计时
    const startTime = Date.now();

    try {
        const response = await chat(userMessage, messages.value.slice(0, -1));
        await typewriterEffect(response, aiMessageIndex);
        // 计算并保存处理时间
        const endTime = Date.now();
        messages.value[aiMessageIndex].processingTime = endTime - startTime;
    } catch (err) {
        error.value = "发送失败: " + err.message;
        // 如果出错，移除 AI 消息
        if (messages.value.length > aiMessageIndex) {
            messages.value.splice(aiMessageIndex, 1);
        }
    } finally {
        isSending.value = false;
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatProcessingTime(ms) {
    if (ms === null) return '';
    if (ms < 1000) {
        return ` · ${ms}ms`;
    } else {
        const seconds = (ms / 1000).toFixed(2);
        return ` · ${seconds}s`;
    }
}

onMounted(() => {
    modelStatus.value = getModelStatus();
});
</script>

<template>
    <div class="chat-container">
        <div class="chat-header">
            <h1>AI 问答助手</h1>
            <div class="model-status">
                <button v-if="!modelStatus.isLoading && !modelStatus.isLoaded" @click="loadModel" class="load-btn">
                    加载模型
                </button>
                <div v-else-if="modelStatus.isLoading" class="loading-status">
                    <div class="spinner"></div>
                    <div class="loading-text">
                        <div>模型加载中...</div>
                        <div class="loading-detail">{{ progressText }}</div>
                    </div>
                </div>
                <div v-else class="loaded-status">
                    <span class="status-dot"></span>
                    <span>模型已就绪</span>
                </div>
            </div>
        </div>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <div ref="messagesContainer" class="messages-container">
            <div v-if="messages.length === 0" class="welcome-message">
                <h2>欢迎使用 AI 问答助手</h2>
                <p>点击上方「加载模型」按钮开始聊天</p>
            </div>
            <div v-for="(item, index) in messages" :key="index" :class="['message', item.role]">
                <div class="message-content">
                    <div class="message-header">
                        <span class="role">
                            {{ item.role === 'user' ? '你' : 'AI' }}
                        </span>
                        <span class="time">
                            {{ formatTime(item.timestamp) }}
                            <span v-if="item.role === 'ai'" class="processing-time">{{
                                formatProcessingTime(item.processingTime) }}</span>
                        </span>
                    </div>
                    <p class="text">
                        {{ item.content }}
                        <span v-if="item.role === 'ai' && isSending && index === messages.length - 1"
                            class="cursor"></span>
                    </p>
                </div>
            </div>
        </div>

        <div class="input-area">
            <input v-model="input" @keyup.enter="send" :disabled="!modelStatus.isLoaded || isSending"
                placeholder="输入你的问题..." class="chat-input" />
            <button @click="send" :disabled="!modelStatus.isLoaded || isSending || !input.trim()" class="send-btn">
                发送
            </button>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 800px;
    margin: 0 auto;
    background: #f5f5f5;
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chat-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
}

.model-status {
    display: flex;
    align-items: center;
    gap: 10px;
}

.load-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    background: white;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.load-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.loading-status {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
}

.loading-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.loading-detail {
    font-size: 12px;
    opacity: 0.8;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loaded-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.status-dot {
    width: 10px;
    height: 10px;
    background: #4ade80;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.error-message {
    padding: 12px 20px;
    background: #fee2e2;
    color: #dc2626;
    border-left: 4px solid #dc2626;
    font-size: 14px;
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.welcome-message {
    text-align: center;
    margin-top: 60px;
    color: #666;
}

.welcome-message h2 {
    margin-bottom: 10px;
    color: #333;
}

.message {
    display: flex;
    gap: 12px;
}

.message.user {
    justify-content: flex-end;
}

.message-content {
    max-width: 75%;
}

.message.user .message-content {
    align-items: flex-end;
}

.message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.message.user .message-header {
    justify-content: flex-end;
}

.role {
    font-weight: 600;
    font-size: 12px;
    color: #666;
}

.time {
    font-size: 11px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 4px;
}

.processing-time {
    font-size: 10px;
    color: #667eea;
    opacity: 0.8;
}

.message .text {
    padding: 12px 16px;
    border-radius: 18px;
    margin: 0;
    line-height: 1.6;
    font-size: 15px;
    word-wrap: break-word;
}

.message.user .text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 4px;
}

.message.ai .text {
    background: white;
    color: #333;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: white;
    border-radius: 18px;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes typing {

    0%,
    80%,
    100% {
        transform: scale(0);
        opacity: 0.5;
    }

    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.cursor {
    display: inline-block;
    width: 8px;
    height: 16px;
    background: #667eea;
    margin-left: 4px;
    animation: blink 1s infinite;
    vertical-align: middle;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

.input-area {
    display: flex;
    gap: 12px;
    padding: 20px;
    background: white;
    border-top: 1px solid #e5e5e5;
}

.chat-input {
    flex: 1;
    padding: 14px 20px;
    border: 2px solid #e5e5e5;
    border-radius: 25px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.3s ease;
}

.chat-input:focus {
    border-color: #667eea;
}

.chat-input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
}

.send-btn {
    padding: 14px 28px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
    width: 6px;
}

.messages-container::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
}
</style>
