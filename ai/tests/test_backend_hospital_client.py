from unittest.mock import Mock

from app.clients.backend_hospital_client import BackendHospitalClient


def test_get_hospitals_passes_session_cookie():
    http_client = Mock()
    response = Mock()
    response.json.return_value = {"data": {"items": []}}
    response.raise_for_status.return_value = None
    http_client.get.return_value = response

    client = BackendHospitalClient(
        base_url="http://backend.test",
        http_client=http_client,
    )

    result = client.get_hospitals(jsessionid="abc123", department_type="INTERNAL_MEDICINE")

    assert result == {"data": {"items": []}}
    http_client.get.assert_called_once_with(
        "http://backend.test/hospital",
        params={"type": "INTERNAL_MEDICINE"},
        cookies={"JSESSIONID": "abc123"},
    )


def test_get_hospitals_without_type_omits_query_param():
    http_client = Mock()
    response = Mock()
    response.json.return_value = {"data": {"items": []}}
    response.raise_for_status.return_value = None
    http_client.get.return_value = response

    client = BackendHospitalClient(
        base_url="http://backend.test",
        http_client=http_client,
    )

    client.get_hospitals(jsessionid="abc123")

    http_client.get.assert_called_once_with(
        "http://backend.test/hospital",
        params={},
        cookies={"JSESSIONID": "abc123"},
    )


def test_get_available_slots_passes_session_cookie_and_date():
    http_client = Mock()
    response = Mock()
    response.json.return_value = {"data": {"items": []}}
    response.raise_for_status.return_value = None
    http_client.get.return_value = response

    client = BackendHospitalClient(
        base_url="http://backend.test",
        http_client=http_client,
    )

    result = client.get_available_slots(
        jsessionid="abc123",
        hospital_id=1,
        date="2026-06-11",
    )

    assert result == {"data": {"items": []}}
    http_client.get.assert_called_once_with(
        "http://backend.test/hospital/1/available-slots",
        params={"date": "2026-06-11"},
        cookies={"JSESSIONID": "abc123"},
    )


def test_create_reservation_passes_payload_and_cookie():
    http_client = Mock()
    response = Mock()
    response.json.return_value = {"success": True, "data": None}
    response.raise_for_status.return_value = None
    http_client.post.return_value = response

    client = BackendHospitalClient(
        base_url="http://backend.test",
        http_client=http_client,
    )

    result = client.create_reservation(
        jsessionid="abc123",
        hospital_id=1,
        reserved_at="2026-06-11T09:30:00",
    )

    assert result == {"success": True, "data": None}
    http_client.post.assert_called_once_with(
        "http://backend.test/hospital/reservations",
        json={
            "hospital_id": 1,
            "reserved_at": "2026-06-11T09:30:00",
        },
        cookies={"JSESSIONID": "abc123"},
    )


def test_update_reservation_passes_action_and_reserved_at():
    http_client = Mock()
    response = Mock()
    response.json.return_value = {"success": True, "data": None}
    response.raise_for_status.return_value = None
    http_client.patch.return_value = response

    client = BackendHospitalClient(
        base_url="http://backend.test",
        http_client=http_client,
    )

    result = client.update_reservation(
        jsessionid="abc123",
        reservation_id=15,
        action="CHANGE",
        reserved_at="2026-06-12T10:00:00",
    )

    assert result == {"success": True, "data": None}
    http_client.patch.assert_called_once_with(
        "http://backend.test/hospital/reservations/15",
        json={
            "action": "CHANGE",
            "reserved_at": "2026-06-12T10:00:00",
        },
        cookies={"JSESSIONID": "abc123"},
    )


def test_get_reservations_passes_cookie():
    http_client = Mock()
    response = Mock()
    response.json.return_value = {"data": {"items": []}}
    response.raise_for_status.return_value = None
    http_client.get.return_value = response

    client = BackendHospitalClient(
        base_url="http://backend.test",
        http_client=http_client,
    )

    result = client.get_reservations(jsessionid="abc123")

    assert result == {"data": {"items": []}}
    http_client.get.assert_called_once_with(
        "http://backend.test/hospital/reservations",
        cookies={"JSESSIONID": "abc123"},
    )
