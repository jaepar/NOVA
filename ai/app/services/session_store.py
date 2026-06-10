import uuid


class SessionStore:
    # 지금은 메모리 기반 저장소로 두고, 대화 히스토리와 graph state를 함께 관리한다.
    def __init__(self) -> None:
        self._sessions: dict[str, dict] = {}

    def create(self) -> str:
        conversation_id = f"conv_{uuid.uuid4().hex[:12]}"
        self._sessions[conversation_id] = {"messages": [], "graph_state": {}}
        return conversation_id

    def exists(self, conversation_id: str) -> bool:
        return conversation_id in self._sessions

    def append_message(self, conversation_id: str, role: str, message: str) -> None:
        if not self.exists(conversation_id):
            raise KeyError(conversation_id)

        # 메시지는 직렬화하기 쉬운 단순 dict 형태로 저장한다.
        self._sessions[conversation_id]["messages"].append(
            {"role": role, "message": message}
        )

    def get_messages(self, conversation_id: str) -> list[dict]:
        if not self.exists(conversation_id):
            raise KeyError(conversation_id)
        return list(self._sessions[conversation_id]["messages"])

    def get_graph_state(self, conversation_id: str) -> dict:
        if not self.exists(conversation_id):
            raise KeyError(conversation_id)
        return dict(self._sessions[conversation_id]["graph_state"])

    def set_graph_state(self, conversation_id: str, graph_state: dict) -> None:
        if not self.exists(conversation_id):
            raise KeyError(conversation_id)
        # graph state는 다음 턴에서 이어서 쓸 최소 실행 결과만 저장한다.
        self._sessions[conversation_id]["graph_state"] = dict(graph_state)

    def delete(self, conversation_id: str) -> None:
        self._sessions.pop(conversation_id, None)
