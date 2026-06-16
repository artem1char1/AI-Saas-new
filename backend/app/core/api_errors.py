from typing import Any

from fastapi import HTTPException, status


def api_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"code": code, "message": message},
    )


def conflict(code: str, message: str) -> HTTPException:
    return api_error(status.HTTP_409_CONFLICT, code, message)


def bad_request(code: str, message: str) -> HTTPException:
    return api_error(status.HTTP_400_BAD_REQUEST, code, message)


def not_found(code: str, message: str) -> HTTPException:
    return api_error(status.HTTP_404_NOT_FOUND, code, message)


def extract_detail_message(detail: Any) -> str:
    if isinstance(detail, str):
        return detail
    if isinstance(detail, dict):
        message = detail.get("message")
        if isinstance(message, str):
            return message
        code = detail.get("code")
        if isinstance(code, str):
            return code
    return "Request failed"
