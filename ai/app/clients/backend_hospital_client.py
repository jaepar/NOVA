import httpx


class BackendHospitalClient:
    # 병원/예약 관련 백엔드 REST API 호출을 한 곳으로 모아두는 클라이언트다.
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
        # 진료과 필터는 백엔드 enum 코드 기준으로만 전달한다.
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
        # 날짜별 슬롯 조회는 병원 단위로 분리되어 있으므로 hospital_id가 필수다.
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
        # 예약 생성은 병원과 확정 시간 둘 다 있어야만 요청할 수 있다.
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
        # 변경과 취소를 하나의 endpoint에서 action 값으로 구분한다.
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
        # 로그인 세션 기준으로 현재 사용자의 예약 목록을 조회한다.
        response = self.http_client.get(
            f"{self.base_url}/hospital/reservations",
            cookies={"JSESSIONID": jsessionid},
        )
        response.raise_for_status()
        return response.json()
