// api/api.ts
import axios from "axios";

// Define interfaces for request and response
export interface MedicationRequest {
  name: string;
  coverage_percentage: number;
  deductible: number;
}

export interface MedicationResponse {
  medication_name: string;
  coverage_percentage: number;
  deductible: number;
  total_cost: number;
}

// Set base URL for the backend API
const API_BASE_URL = "http://localhost:8000"; 

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// POST request: Create a new medication
export const createMedication = async (
  data: MedicationRequest
): Promise<MedicationResponse> => {
  const response = await api.post("/medications", data);
  return response.data;
};

// GET request: Get medication info by ID
export const getMedication = async (
  id: number
): Promise<MedicationResponse> => {
  const response = await api.get(`/medications/${id}`);
  return response.data;
};

// Additional API calls can be added here if needed
