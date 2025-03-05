import requests

# FastAPI 服务器的 URL
url = "http://localhost:8000/medications"

# 初始药物数据
initial_medications = [
    {"code": "M1234", "name": "Aspirin1", "coverage_percentage": 0.8, "deductible": 10.0},
    {"code": "M1235", "name": "Aspirin2", "coverage_percentage": 0.7, "deductible": 12.0},
    {"code": "M1236", "name": "Aspirin3", "coverage_percentage": 0.75, "deductible": 8.0},
    {"code": "M1237", "name": "Aspirin4", "coverage_percentage": 0.85, "deductible": 9.0},
    {"code": "M1238", "name": "Aspirin5", "coverage_percentage": 0.9, "deductible": 7.0},
    {"code": "M1239", "name": "Aspirin6", "coverage_percentage": 0.65, "deductible": 15.0},
    {"code": "M1240", "name": "Aspirin7", "coverage_percentage": 0.8, "deductible": 10.0},
    {"code": "M1241", "name": "Aspirin8", "coverage_percentage": 0.75, "deductible": 12.0},
    {"code": "M1242", "name": "Aspirin9", "coverage_percentage": 0.85, "deductible": 11.0},
    {"code": "M1243", "name": "Aspirin10", "coverage_percentage": 0.7, "deductible": 13.0},
    {"code": "M1244", "name": "Aspirin11", "coverage_percentage": 0.9, "deductible": 6.0},
    {"code": "M1245", "name": "Aspirin12", "coverage_percentage": 0.6, "deductible": 14.0},
]

# Iterate through the initial medications and send POST requests to add them to the database
for medication in initial_medications:
    # Send POST request with the medication data
    response = requests.post(url, json=medication)
    
    # Check the response status
    if response.status_code == 200:
        print(f"Successfully added medication: {medication['name']}")
    else:
        print(f"Failed to add medication {medication['name']} - Status code: {response.status_code}")
        print("Error details:", response.json())
