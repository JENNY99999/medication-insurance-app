import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // 使用图标库

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  ); // 聊天记录
  const [userInput, setUserInput] = useState(""); // 用户输入
  const [isLoading, setIsLoading] = useState(false); // 加载状态
  const scrollViewRef = useRef<ScrollView>(null); // 用于自动滚动

  // 发送消息到后端 API
  const sendMessage = async () => {
    if (!userInput.trim()) return; // 如果输入为空，直接返回

    setIsLoading(true);
    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages); // 添加用户消息到聊天记录
    setUserInput(""); // 清空输入框

    try {
      // 调用后端 API
      const response = await axios.post("http://localhost:8000/chat", {
        message: userInput,
      });

      // 添加助手回复到聊天记录
      setMessages([
        ...newMessages,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Sorry, something went wrong.";
      if (error.response) {
        // 从后端返回的错误信息
        errorMessage = error.response.data.detail || errorMessage;
      }
      setMessages([
        ...newMessages,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom(); // 滚动到底部
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Chatbot</Text>
      <ScrollView
        style={styles.chatWindow}
        ref={scrollViewRef}
        onContentSizeChange={scrollToBottom} // 内容变化时自动滚动
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.role === "user"
                ? styles.userBubble
                : styles.assistantBubble,
            ]}
          >
            <Text style={styles.messageText}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={userInput}
          onChangeText={setUserInput}
          onSubmitEditing={sendMessage} // 按下回车发送消息
          editable={!isLoading}
          placeholderTextColor="#7e57c2" // 浅紫色占位符
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3e5f5", // 浅紫色背景
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#4a148c", // 深紫色文字
  },
  chatWindow: {
    flex: 1,
    marginBottom: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#9c27b0", // 用户消息背景色（紫色）
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff", // 助手消息背景色
  },
  messageText: {
    fontSize: 16,
    color: "#4a148c", // 深紫色文字
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff", // 输入框背景色
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#d1c4e9", // 浅紫色边框
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 0, // 去掉边框
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#fff", // 输入框背景色
    color: "#4a148c", // 深紫色文字
  },
  sendButton: {
    padding: 12,
    backgroundColor: "#9c27b0", // 发送按钮背景色（紫色）
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
