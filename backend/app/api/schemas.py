import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# Auth
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    org_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    role: str
    org_id: uuid.UUID


# Organization
class OrgResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    plan: str
    created_at: datetime


# AWS Connection
class AwsConnectionCreate(BaseModel):
    name: str
    role_arn: str
    aws_account_id: str | None = None


class AwsConnectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    aws_account_id: str | None
    role_arn: str
    created_at: datetime


# Scan
class ScanCreate(BaseModel):
    product: str  # finops / cloudguard / infrascore / supplyguard / zerovis
    aws_connection_id: uuid.UUID | None = None
    demo_mode: bool = False


class ScanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product: str
    status: str
    result: dict | None
    report_url: str | None
    created_at: datetime
    completed_at: datetime | None
