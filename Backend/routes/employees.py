from fastapi import APIRouter, HTTPException, status
from database import employees_collection
from pydantic import BaseModel, EmailStr
from bson import ObjectId

router = APIRouter(prefix="/employees", tags=["employees"])

class EmployeeSchema(BaseModel):
    name: str
    email: EmailStr
    dept: str
    role: str

@router.post("", status_code=status.HTTP_201_CREATED)
async def add_employee(emp: EmployeeSchema):
    existing = await employees_collection.find_one({"email": emp.email})
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this email already exists")

    result = await employees_collection.insert_one(emp.model_dump())
    return {"id": str(result.inserted_id), "message": "Employee added successfully"}

@router.get("")
async def get_employees():
    employees = []
    async for emp in employees_collection.find():
        emp["id"] = str(emp["_id"])
        del emp["_id"]
        employees.append(emp)
    return employees

@router.delete("/{id}")
async def delete_employee(id: str):
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    result = await employees_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"message": "Employee deleted successfully"}