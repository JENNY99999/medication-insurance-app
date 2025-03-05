import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

export default function Query() {
  const [codeQuery, setCodeQuery] = useState(""); // 存储用户输入的药品编号
  const [nameQuery, setNameQuery] = useState(""); // 存储用户输入的药品名称
  const [medicationData, setMedicationData] = useState(null); // 存储从后端获取的药品数据
  const [loading, setLoading] = useState(false); // 加载状态

  // 查询药品信息的函数
  const fetchMedicationData = async () => {
    if (!codeQuery && !nameQuery) {
      Alert.alert("Error", "Please enter either medication code or name.");
      return;
    }

    setLoading(true); // 开始加载
    try {
      // 清理输入内容
      const cleanedCodeQuery = codeQuery.trim();
      const cleanedNameQuery = nameQuery.trim();

      // 构建查询 URL
      let url = new URL("http://127.0.0.1:8000/medications");

      // 如果输入药品编号，则通过 code 查询
      if (cleanedCodeQuery) {
        url.searchParams.append("code", cleanedCodeQuery);
      }

      // 如果输入药品名称，则通过 name 查询
      if (cleanedNameQuery) {
        url.searchParams.append("name", cleanedNameQuery);
      }

      // 打印请求 URL 以便调试
      console.log("Request URL:", url.toString());

      // 发送 GET 请求到后端
      const response = await fetch(url.toString(), {
        method: "GET",
      });

      // 检查响应是否成功
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Medication not found.");
        } else {
          throw new Error("Failed to fetch medication data.");
        }
      }

      // 解析响应数据
      const data = await response.json();
      setMedicationData(data); // 更新药品数据状态
    } catch (error) {
      // 处理错误
      Alert.alert("Error", error.message);
      console.error(error);
    } finally {
      setLoading(false); // 结束加载
      setCodeQuery(""); // 清空 code 输入框
      setNameQuery(""); // 清空 name 输入框
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Insurance Query</Text>

      {/* 输入药品编号 */}
      <TextInput
        style={styles.input}
        placeholder="Enter medication code"
        placeholderTextColor="#999"
        value={codeQuery}
        onChangeText={setCodeQuery} // 更新药品编号查询状态
        returnKeyType="search" // 按回车显示搜索键
        onSubmitEditing={fetchMedicationData} // 按回车键触发查询
      />

      {/* 输入药品名称 */}
      <TextInput
        style={styles.input}
        placeholder="Enter medication name"
        placeholderTextColor="#999"
        value={nameQuery}
        onChangeText={setNameQuery} // 更新药品名称查询状态
        returnKeyType="search" // 按回车显示搜索键
        onSubmitEditing={fetchMedicationData} // 按回车键触发查询
      />

      {/* 查询按钮 */}
      {loading ? (
        <ActivityIndicator size="large" color="#7C4DFF" /> // 加载中显示旋转图标
      ) : (
        <View style={styles.buttonContainer}>
          <Button
            title="Query"
            onPress={fetchMedicationData}
            color="#7C4DFF" // 按钮颜色
          />
        </View>
      )}

      {/* 显示查询结果 */}
      {medicationData ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Medication Code: {medicationData.code}
          </Text>
          <Text style={styles.resultText}>
            Medication Name: {medicationData.medication_name}
          </Text>
          <Text style={styles.resultText}>
            Coverage Percentage: {medicationData.coverage_percentage}%
          </Text>
          <Text style={styles.resultText}>
            Deductible: ${medicationData.deductible}
          </Text>
          <Text style={styles.resultText}>
            Total Cost: ${medicationData.total_cost}
          </Text>
        </View>
      ) : (
        <Text style={styles.resultText}>No data found.</Text>
      )}
    </View>
  );
}

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3E5F5", // 浅紫色背景
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4A148C", // 深紫色标题
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#D1C4E9", // 浅紫色边框
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#FFFFFF", // 输入框背景色
    fontSize: 16,
    color: "#4A148C", // 深紫色文本
  },
  buttonContainer: {
    width: "50%",
    marginBottom: 20,
  },
  resultContainer: {
    marginTop: 20,
    width: "100%",
    padding: 20,
    backgroundColor: "#EDE7F6", // 浅紫色背景
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1C4E9", // 浅紫色边框
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#4A148C", // 深紫色文本
  },
});
