from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from transformers import pipeline  # 导入 Hugging Face pipeline

# 加载 .env 文件
env_path = os.path.join(os.path.dirname(__file__), "../.env")
print("Loading .env file from:", os.path.abspath(env_path))
load_dotenv(env_path)

# 打印当前工作目录和 .env 文件路径
print("Current Working Directory:", os.getcwd())
print(".env File Path:", os.path.abspath(env_path))

# FastAPI instance
app = FastAPI()

# CORS 中间件配置
origins = [
    "http://localhost:8081",  # 允许来自前端开发服务器的请求
    "http://127.0.0.1:8081",  # 允许来自 localhost 的请求
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection URL for PostgreSQL on Neon
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
# Create a database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"sslmode": "require"})

# Create a base class for models
Base = declarative_base()

# Create a session maker for interacting with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Medication model for SQLAlchemy ORM
class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # 药物编号
    name = Column(String, index=True, unique=True)
    coverage_percentage = Column(Float)
    deductible = Column(Float)

# Create tables in the database
Base.metadata.create_all(bind=engine)

# Pydantic model for request validation
class MedicationRequest(BaseModel):
    code: str  # 药物编号
    name: str
    coverage_percentage: float
    deductible: float  # 必填字段

# Pydantic model for response
class MedicationResponse(BaseModel):
    code: str  # 药物编号
    medication_name: str
    coverage_percentage: float
    deductible: float
    total_cost: float

# Function to calculate medication cost
def calculate_cost(coverage_percentage: float, deductible: float):
    return round(deductible * (1 - coverage_percentage), 2)

# ✅ **POST /medications: Create a new medication**
@app.post("/medications", response_model=MedicationResponse)
def create_medication(request: MedicationRequest):
    db = SessionLocal()
    try:
        # Check if medication with the same code or name already exists
        existing_med = db.query(Medication).filter(
            (func.lower(Medication.code) == func.lower(request.code)) | (func.lower(Medication.name) == func.lower(request.name))
        ).first()
        if existing_med:
            raise HTTPException(status_code=400, detail="Medication with the same code or name already exists")

        # Create new medication
        new_med = Medication(
            code=request.code,  # 药物编号
            name=request.name,
            coverage_percentage=request.coverage_percentage,
            deductible=request.deductible  # 必填字段
        )

        db.add(new_med)
        db.commit()
        db.refresh(new_med)

        return MedicationResponse(
            code=new_med.code,  # 药物编号
            medication_name=new_med.name,
            coverage_percentage=new_med.coverage_percentage,
            deductible=new_med.deductible,
            total_cost=calculate_cost(new_med.coverage_percentage, new_med.deductible)
        )
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {e}")  # 打印具体的异常信息
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        db.close()

# ✅ **PUT /medications/{medication_id}: Update medication information**
@app.put("/medications/{medication_id}", response_model=MedicationResponse)
def update_medication(medication_id: int, request: MedicationRequest):
    db = SessionLocal()
    try:
        medication = db.query(Medication).filter(Medication.id == medication_id).first()
        if not medication:
            raise HTTPException(status_code=404, detail="Medication not found")

        # Check if the new code conflicts with existing medications
        if func.lower(request.code) != func.lower(medication.code):
            existing_code = db.query(Medication).filter(func.lower(Medication.code) == func.lower(request.code)).first()
            if existing_code:
                raise HTTPException(status_code=400, detail="Medication with the same code already exists")

        # Update medication fields
        medication.code = request.code  # 更新药物编号
        medication.name = request.name
        medication.coverage_percentage = request.coverage_percentage
        medication.deductible = request.deductible  # 必填字段

        db.commit()

        return MedicationResponse(
            code=medication.code,  # 药物编号
            medication_name=medication.name,
            coverage_percentage=medication.coverage_percentage,
            deductible=medication.deductible,
            total_cost=calculate_cost(medication.coverage_percentage, medication.deductible)
        )
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {e}")  # 打印具体的异常信息
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        db.close()

# ✅ **DELETE /medications/{medication_id}: Delete medication**
@app.delete("/medications/{medication_id}")
def delete_medication(medication_id: int):
    db = SessionLocal()
    try:
        medication = db.query(Medication).filter(Medication.id == medication_id).first()
        if not medication:
            raise HTTPException(status_code=404, detail="Medication not found")
        
        db.delete(medication)
        db.commit()

        return {
            "detail": "Medication deleted successfully",
            "code": medication.code  # 返回被删除药物的编号
        }
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {e}")  # 打印具体的异常信息
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        db.close()

# ✅ **GET /medications: Query medication by code or name**
@app.get("/medications", response_model=MedicationResponse)
def get_medication(
    code: Optional[str] = Query(None, description="The code of the medication"),
    name: Optional[str] = Query(None, description="The name of the medication")
):
    db = SessionLocal()
    try:
        if code:
            # 不区分大小写查询
            medication = db.query(Medication).filter(func.lower(Medication.code) == func.lower(code)).first()
        elif name:
            # 不区分大小写查询
            medication = db.query(Medication).filter(func.lower(Medication.name) == func.lower(name)).first()
        else:
            raise HTTPException(status_code=400, detail="Either code or name must be provided")

        if not medication:
            raise HTTPException(status_code=404, detail="Medication not found")

        return MedicationResponse(
            code=medication.code,  # 药物编号
            medication_name=medication.name,
            coverage_percentage=medication.coverage_percentage,
            deductible=medication.deductible,
            total_cost=calculate_cost(medication.coverage_percentage, medication.deductible)
        )
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {e}")  # 打印具体的异常信息
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        db.close()

# 定义请求体模型
class ChatRequest(BaseModel):
    message: str  # 用户输入的消息

# 加载 GPT-2 模型
print("Loading GPT-2 model...")
try:
    pipe = pipeline("text-generation", model="openai-community/gpt2")
    print("GPT-2 model loaded successfully.")
except Exception as e:
    print(f"Error loading GPT-2 model: {e}")
    raise RuntimeError("Failed to load GPT-2 model")

# ✅ **Chat with GPT-2**
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        print("Received chat request:", request.message)  # 打印用户输入

        # 使用模型生成回复
        response = pipe(request.message, max_length=50)

        # 提取生成的文本
        reply = response[0].get("generated_text", "Sorry, I didn't understand that.")

        return {"reply": reply}
    except Exception as e:
        print(f"Error in /chat endpoint: {e}")  # 打印异常信息
        raise HTTPException(status_code=500, detail=str(e))

# ✅ **Test route**
@app.get("/test")
def test():
    return {"message": "Test route is working!"}

# ✅ **Root path**
@app.get("/")
def read_root():
    return {"message": "Welcome to the Medication Insurance API!"}