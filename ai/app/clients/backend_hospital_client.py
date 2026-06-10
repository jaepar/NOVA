import httpx


class BackendHospitalClient:
    def __init__(
        self,
        base_url: str,
        http_client: httpx.Client | None = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.http_client = http_client or httpx.Client()

    def get_hospitals(
        self,
        jsessionid: str,
        department_type: str | None = None,
    ) -> dict:
        params = {}
        if department_type is not None:
            params["type"] = department_type

        response = self.http_client.get(
            f"{self.base_url}/hospital",
            params=params,
            cookies={"JSESSIONID": jsessionid},
        )
        response.raise_for_status()
        return response.json()

    def get_available_slots(
        self,
        jsessionid: str,
        hospital_id: int,
        date: str,
    ) -> dict:
        response = self.http_client.get(
            f"{self.base_url}/hospital/{hospital_id}/available-slots",
            params={"date": date},
            cookies={"JSESSIONID": jsessionid},
        )
        response.raise_for_status()
        return response.json()

    def create_reservation(
        self,
        jsessionid: str,
        hospital_id: int,
        reserved_at: str,
    ) -> dict:
        response = self.http_client.post(
            f"{self.base_url}/hospital/reservations",
            json={
                "hospital_id": hospital_id,
                "reserved_at": reserved_at,
            },
            cookies={"JSESSIONID": jsessionid},
        )
        response.raise_for_status()
        return response.json()

    def update_reservation(
        self,
        jsessionid: str,
        reservation_id: int,
        action: str,
        reserved_at: str | None = None,
    ) -> dict:
        payload = {"action": action}
        if reserved_at is not None:
            payload["reserved_at"] = reserved_at

        response = self.http_client.patch(
            f"{self.base_url}/hospital/reservations/{reservation_id}",
            json=payload,
            cookies={"JSESSIONID": jsessionid},
        )
        response.raise_for_status()
        return response.json()

    def get_reservations(self, jsessionid: str) -> dict:
        response = self.http_client.get(
            f"{self.base_url}/hospital/reservations",
            cookies={"JSESSIONID": jsessionid},
        )
        response.raise_for_status()
        return response.json()
