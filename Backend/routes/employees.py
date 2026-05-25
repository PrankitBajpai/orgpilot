from fastapi import APIRouter, HTTPException, status
from database import employees_collection
from pydantic import BaseModel, EmailStr
from bson import ObjectId

router = APIRouter()

# --- PYDANTIC VALIDATION SCHEMAS ---
class EmployeeSchema(BaseModel):
    name: str
    email: EmailStr
    dept: str
    role: str

@router.post("/employees", status_code=status.HTTP_201_CREATED)
async def add_employee(emp: EmployeeSchema):
    # Prevent duplicate data entries
    existing_emp = await employees_collection.find_one({"email": emp.email})
    if existing_emp:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")

    # Save to MongoDB cluster (.model_dump() is standard for Pydantic v2)
    result = await employees_collection.insert_one(emp.model_dump())
    return {"id": str(result.inserted_id), "message": "Employee added successfully"}

@router.get("/employees")
async def get_employees():
    employees = []
    # Stream documents out of the database cursor asynchronously
    async for emp in employees_collection.find():
        emp["id"] = str(emp["_id"])
        del emp["_id"]  # Remove non-serializable BSON ObjectId
        employees.append(emp)
    return employees

@router.delete("/employees/{id}")
async def delete_employee(id: str):
    try:
        # BSON safety guard check
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid target ID structure format")

    result = await employees_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee record target not located")
        
    return {"message": "Employee deleted successfully"}