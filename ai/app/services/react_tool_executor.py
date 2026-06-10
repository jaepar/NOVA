import logging

from app.clients.backend_hospital_client import BackendHospitalClient
from app.models.react_tool import ReActToolResult


logger = logging.getLogger(__name__)


class ReActToolExecutor:
    def __init__(self, backend_client: BackendHospitalClient) -> None:
        self.backend_client = backend_client

    def execute(
        self,
        tool_name: str,
        tool_input: dict,
        jsessionid: str,
    ) -> ReActToolResult:
        logger.info(
            "Tool execution started: tool_name=%s, input_keys=%s, has_jsessionid=%s",
            tool_name,
            sorted(tool_input.keys()) if tool_input is not None else [],
            jsessionid is not None,
        )
        try:
            if tool_name == "get_hospitals":
                payload = self.backend_client.get_hospitals(
                    jsessionid=jsessionid,
                    department_type=tool_input.get("department_type"),
                )
                logger.info("Tool execution succeeded: tool_name=%s", tool_name)
                return ReActToolResult(
                    tool_name=tool_name,
                    success=True,
                    payload=payload,
                )

            if tool_name == "get_available_slots":
                payload = self.backend_client.get_available_slots(
                    jsessionid=jsessionid,
                    hospital_id=tool_input["hospital_id"],
                    date=tool_input["date"],
                )
                logger.info("Tool execution succeeded: tool_name=%s", tool_name)
                return ReActToolResult(
                    tool_name=tool_name,
                    success=True,
                    payload=payload,
                )

            if tool_name == "create_reservation":
                payload = self.backend_client.create_reservation(
                    jsessionid=jsessionid,
                    hospital_id=tool_input["hospital_id"],
                    reserved_at=tool_input["reserved_at"],
                )
                logger.info("Tool execution succeeded: tool_name=%s", tool_name)
                return ReActToolResult(
                    tool_name=tool_name,
                    success=True,
                    payload=payload,
                )

            if tool_name == "update_reservation":
                payload = self.backend_client.update_reservation(
                    jsessionid=jsessionid,
                    reservation_id=tool_input["reservation_id"],
                    action=tool_input["action"],
                    reserved_at=tool_input.get("reserved_at"),
                )
                logger.info("Tool execution succeeded: tool_name=%s", tool_name)
                return ReActToolResult(
                    tool_name=tool_name,
                    success=True,
                    payload=payload,
                )

            if tool_name == "get_reservations":
                payload = self.backend_client.get_reservations(jsessionid=jsessionid)
                logger.info("Tool execution succeeded: tool_name=%s", tool_name)
                return ReActToolResult(
                    tool_name=tool_name,
                    success=True,
                    payload=payload,
                )
        except Exception as error:
            logger.warning(
                "Tool execution failed: tool_name=%s, error=%s",
                tool_name,
                error,
            )
            return ReActToolResult(
                tool_name=tool_name,
                success=False,
                error=str(error),
            )

        logger.warning("Unknown tool requested: tool_name=%s", tool_name)
        return ReActToolResult(
            tool_name=tool_name,
            success=False,
            error=tool_name,
        )
