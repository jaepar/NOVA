from typing import Generic, TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class ErrorInfo(BaseModel):
    # 공통 에러 응답에서 기계적으로 해석할 수 있는 최소 필드를 둔다.
    code: str
    detail: str | None = None


class ApiResponse(BaseModel, Generic[T]):
    # 모든 성공/실패 응답을 같은 껍데기로 감싸기 위한 공통 래퍼다.
    success: bool
    message: str
    data: T | None = None
    error: ErrorInfo | None = None


def ok_response(message: str, data: T | None = None) -> ApiResponse[T]:
    return ApiResponse(success=True, message=message, data=data, error=None)


def error_response(message: str, code: str, detail: str | None = None) -> ApiResponse[None]:
    return ApiResponse(
        success=False,
        message=message,
        data=None,
        error=ErrorInfo(code=code, detail=detail),
    )
