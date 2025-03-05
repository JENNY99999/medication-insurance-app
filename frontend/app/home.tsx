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
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  ); // Stores chat messages
  const [userInput, setUserInput] = useState(""); // Stores user input
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const scrollViewRef = useRef<ScrollView>(null); // Reference for scrolling to the bottom

  // Send message to the backend API
  const sendMessage = async () => {
    if (!userInput.trim()) return; // Ignore empty input

    setIsLoading(true);
    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages); // Add user message to chat history
    setUserInput(""); // Clear input field

    try {
      // Call the backend API
      const response = await axios.post("http://localhost:8000/chat", {
        message: userInput,
      });

      // Add assistant's reply to chat history
      setMessages([
        ...newMessages,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Sorry, something went wrong.";
      if (error.response) {
        // Use error message from the backend if available
        errorMessage = error.response.data.detail || errorMessage;
      }
      setMessages([
        ...newMessages,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom(); // Scroll to the bottom after sending the message
    }
  };

  // Scroll to the bottom of the chat window
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Chatbot</Text>
      <ScrollView
        style={styles.chatWindow}
        ref={scrollViewRef}
        onContentSizeChange={scrollToBottom} // Auto-scroll when content changes
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
          onSubmitEditing={sendMessage} // Send message on pressing enter
          editable={!isLoading}
          placeholderTextColor="#7e57c2"
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
    backgroundColor: "#f3e5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#4a148c",
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
    backgroundColor: "#9c27b0",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  messageText: {
    fontSize: 16,
    color: "#4a148c",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#d1c4e9",
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 0,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#fff",
    color: "#4a148c",
  },
  sendButton: {
    padding: 12,
    backgroundColor: "#9c27b0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
});
