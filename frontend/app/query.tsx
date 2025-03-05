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
  const [codeQuery, setCodeQuery] = useState(""); // Stores user input for medication code
  const [nameQuery, setNameQuery] = useState(""); // Stores user input for medication name
  const [medicationData, setMedicationData] = useState(null); // Stores medication data fetched from the backend
  const [loading, setLoading] = useState(false); // Loading state

  // Function to fetch medication data
  const fetchMedicationData = async () => {
    if (!codeQuery && !nameQuery) {
      Alert.alert("Error", "Please enter either medication code or name.");
      return;
    }

    setLoading(true); // Start loading
    try {
      // Clean input values
      const cleanedCodeQuery = codeQuery.trim();
      const cleanedNameQuery = nameQuery.trim();

      // Build query URL
      let url = new URL("http://127.0.0.1:8000/medications");

      // Append code to URL if provided
      if (cleanedCodeQuery) {
        url.searchParams.append("code", cleanedCodeQuery);
      }

      // Append name to URL if provided
      if (cleanedNameQuery) {
        url.searchParams.append("name", cleanedNameQuery);
      }

      // Log request URL for debugging
      console.log("Request URL:", url.toString());

      // Send GET request to the backend
      const response = await fetch(url.toString(), {
        method: "GET",
      });

      // Check if the response is successful
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Medication not found.");
        } else {
          throw new Error("Failed to fetch medication data.");
        }
      }

      // Parse response data
      const data = await response.json();
      setMedicationData(data); // Update medication data state
    } catch (error) {
      // Handle errors
      Alert.alert("Error", error.message);
      console.error(error);
    } finally {
      setLoading(false); // End loading
      setCodeQuery(""); // Clear code input
      setNameQuery(""); // Clear name input
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Insurance Query</Text>

      {/* Input for medication code */}
      <TextInput
        style={styles.input}
        placeholder="Enter medication code"
        placeholderTextColor="#999"
        value={codeQuery}
        onChangeText={setCodeQuery} // Update code query state
        returnKeyType="search" // Show search key on keyboard
        onSubmitEditing={fetchMedicationData} // Trigger query on enter key press
      />

      {/* Input for medication name */}
      <TextInput
        style={styles.input}
        placeholder="Enter medication name"
        placeholderTextColor="#999"
        value={nameQuery}
        onChangeText={setNameQuery} // Update name query state
        returnKeyType="search" // Show search key on keyboard
        onSubmitEditing={fetchMedicationData} // Trigger query on enter key press
      />

      {/* Query button */}
      {loading ? (
        <ActivityIndicator size="large" color="#7C4DFF" /> // Show spinner while loading
      ) : (
        <View style={styles.buttonContainer}>
          <Button
            title="Query"
            onPress={fetchMedicationData}
            color="#7C4DFF" // Button color
          />
        </View>
      )}

      {/* Display query results */}
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3E5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4A148C",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#D1C4E9",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#4A148C",
  },
  buttonContainer: {
    width: "50%",
    marginBottom: 20,
  },
  resultContainer: {
    marginTop: 20,
    width: "100%",
    padding: 20,
    backgroundColor: "#EDE7F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1C4E9",
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#4A148C",
  },
});
