from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.hospital_chat import router as hospital_chat_router
from app.models.common_response import error_response


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(hospital_chat_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "UP"}


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    # 라우트에서 발생한 HTTP 예외도 공통 응답 포맷으로 감싼다.
    body = error_response(
        message=str(exc.detail),
        code=f"HTTP_{exc.status_code}",
        detail=str(exc.detail),
    )
    return JSONResponse(status_code=exc.status_code, content=body.model_dump())


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    body = error_response(
        message="요청 형식이 올바르지 않습니다.",
        code="VALIDATION_ERROR",
        detail=str(exc.errors()),
    )
    return JSONResponse(status_code=422, content=body.model_dump())


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    body = error_response(
        message="서버 내부 오류가 발생했습니다.",
        code="INTERNAL_SERVER_ERROR",
        detail=str(exc),
    )
    return JSONResponse(status_code=500, content=body.model_dump())
