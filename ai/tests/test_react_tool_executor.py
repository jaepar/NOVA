from unittest.mock import Mock

from app.services.react_tool_executor import ReActToolExecutor


def test_react_tool_executor_runs_get_hospitals():
    backend_client = Mock()
    backend_client.get_hospitals.return_value = {"data": {"items": [{"hospital_id": 1}]}}
    executor = ReActToolExecutor(backend_client=backend_client)

    result = executor.execute(
        tool_name="get_hospitals",
        tool_input={"department_type": "INTERNAL_MEDICINE"},
        jsessionid="abc123",
    )

    backend_client.get_hospitals.assert_called_once_with(
        jsessionid="abc123",
        department_type="INTERNAL_MEDICINE",
    )
    assert result.tool_name == "get_hospitals"
    assert result.success is True
    assert result.payload == {"data": {"items": [{"hospital_id": 1}]}}


def test_react_tool_executor_runs_create_reservation():
    backend_client = Mock()
    backend_client.create_reservation.return_value = {"success": True, "data": None}
    executor = ReActToolExecutor(backend_client=backend_client)

    result = executor.execute(
        tool_name="create_reservation",
        tool_input={
            "hospital_id": 1,
            "reserved_at": "2026-06-11T09:30:00",
        },
        jsessionid="abc123",
    )

    backend_client.create_reservation.assert_called_once_with(
        jsessionid="abc123",
        hospital_id=1,
        reserved_at="2026-06-11T09:30:00",
    )
    assert result.tool_name == "create_reservation"
    assert result.success is True


def test_react_tool_executor_returns_fail_for_unknown_tool():
    backend_client = Mock()
    executor = ReActToolExecutor(backend_client=backend_client)

    result = executor.execute(
        tool_name="unknown_tool",
        tool_input={},
        jsessionid="abc123",
    )

    assert result.tool_name == "unknown_tool"
    assert result.success is False
    assert result.error == "unknown_tool"
