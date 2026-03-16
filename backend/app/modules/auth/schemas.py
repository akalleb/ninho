from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str
    avatar_url: str | None
    cover_url: str | None = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict
