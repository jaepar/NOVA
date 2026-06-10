from fastapi import FastAPI

from app.api.routes.hospital_chat import router as hospital_chat_router


app = FastAPI()
app.include_router(hospital_chat_router)
