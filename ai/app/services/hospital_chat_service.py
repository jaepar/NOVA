import logging

from app.agent import LangGraphHospitalAgent, create_hospital_chat_agent
from app.clients.backend_hospital_client import BackendHospitalClient
from app.config import BACKEND_BASE_URL
from app.models.hospital_chat import ChatData, ChatPayload
from app.services.session_store import SessionStore


logger = logging.getLogger(__name__)


class HospitalChatService:
    # API 라우트는 HTTP 입출력만 담당하고, 실제 세션 흐름 제어는 서비스가 맡는다.
    def __init__(
        self,
        session_store: SessionStore | None = None,
        backend_client: BackendHospitalClient | None = None,
        hospital_chat_agent: LangGraphHospitalAgent | None = None,
    ) -> None:
        self.session_store = session_store or SessionStore()
        self.backend_client = backend_client or BackendHospitalClient(
            base_url=BACKEND_BASE_URL
        )
        self.hospital_chat_agent = hospital_chat_agent or create_hospital_chat_agent(
            backend_client=self.backend_client
        )
        logger.info(
            "HospitalChatService initialized: has_custom_session_store=%s, has_custom_backend_client=%s, has_agent=%s",
            session_store is not None,
            backend_client is not None,
            self.hospital_chat_agent is not None,
        )

    def start_session(self) -> ChatPayload:
        # 대화 시작 시에는 새 conversation_id만 발급하고 메시지 히스토리를 비운다.
        conversation_id = self.session_store.create()
        logger.info("Hospital chat session started: conversation_id=%s", conversation_id)
        return ChatPayload(
            conversation_id=conversation_id,
            message="병원 예약 상담을 시작합니다.",
            data=None,
        )

    def send_message(
        self,
        conversation_id: str,
        message: str,
        jsessionid: str | None = None,
    ) -> ChatPayload:
        logger.info(
            "Hospital chat message received: conversation_id=%s, message_length=%s, has_jsessionid=%s",
            conversation_id,
            len(message),
            jsessionid is not None,
        )
        # 사용자 발화는 에이전트 실행 전에 먼저 세션 히스토리에 저장한다.
        self.session_store.append_message(conversation_id, "user", message)
        if self.hospital_chat_agent is None:
            logger.warning("Hospital chat agent is not configured")
            return ChatPayload(
                conversation_id=conversation_id,
                message="병원 예약 상담 구성이 완료되지 않았습니다.",
                data=ChatData(intent="FAIL", action_required="NONE"),
            )

        if jsessionid is None:
            logger.info("Hospital chat request rejected due to missing JSESSIONID")
            return ChatPayload(
                conversation_id=conversation_id,
                message="로그인이 필요합니다.",
                data=ChatData(intent="AUTH_REQUIRED", action_required="NONE"),
            )

        conversation_messages = self.session_store.get_messages(conversation_id)
        persisted_state = self.session_store.get_graph_state(conversation_id)
        logger.info(
            "Hospital chat agent invocation prepared: conversation_id=%s, history_count=%s, persisted_keys=%s",
            conversation_id,
            len(conversation_messages),
            sorted(persisted_state.keys()),
        )
        # 에이전트는 전체 대화 히스토리와 이전 graph state를 함께 받아 후속 발화를 해석한다.
        agent_result = self.hospital_chat_agent.run_turn(
            conversation_id=conversation_id,
            user_message=message,
            conversation_messages=conversation_messages,
            jsessionid=jsessionid,
            persisted_state=persisted_state,
        )
        # 이번 턴 실행 결과는 다음 턴에서 이어서 쓸 수 있도록 다시 저장한다.
        self.session_store.set_graph_state(conversation_id, agent_result["state"])
        self.session_store.append_message(conversation_id, "assistant", agent_result["message"])
        logger.info(
            "Hospital chat LangGraph response prepared: conversation_id=%s, action=%s, item_count=%s",
            conversation_id,
            agent_result["action"],
            len(agent_result.get("items") or []),
        )
        return ChatPayload(
            conversation_id=conversation_id,
            message=agent_result["message"],
            data=ChatData(
                intent="REACT",
                action_required="ASK_USER" if agent_result["action"] == "ask_user" else "NONE",
                items=agent_result.get("items"),
            ),
        )

    def end_session(self, conversation_id: str) -> ChatPayload:
        # 세션 종료 시 히스토리와 graph state를 함께 제거한다.
        self.session_store.delete(conversation_id)
        logger.info("Hospital chat session ended: conversation_id=%s", conversation_id)
        return ChatPayload(
            conversation_id=conversation_id,
            message="병원 예약 대화를 종료했습니다.",
            data=None,
        )
