import logging

from app.clients.backend_hospital_client import BackendHospitalClient
from app.config import BACKEND_BASE_URL
from app.models.hospital_chat import ChatData, ChatResponse
from app.services.hospital_chat_agent_factory import create_hospital_chat_agent
from app.services.langgraph_hospital_agent import LangGraphHospitalAgent
from app.services.session_store import SessionStore


logger = logging.getLogger(__name__)


class HospitalChatService:
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

    def start_session(self) -> ChatResponse:
        conversation_id = self.session_store.create()
        logger.info("Hospital chat session started: conversation_id=%s", conversation_id)
        return ChatResponse(
            conversation_id=conversation_id,
            message="병원 예약 상담을 시작합니다.",
            data=None,
        )

    def send_message(
        self,
        conversation_id: str,
        message: str,
        jsessionid: str | None = None,
    ) -> ChatResponse:
        logger.info(
            "Hospital chat message received: conversation_id=%s, message_length=%s, has_jsessionid=%s",
            conversation_id,
            len(message),
            jsessionid is not None,
        )
        self.session_store.append_message(conversation_id, "user", message)
        if self.hospital_chat_agent is None:
            logger.warning("Hospital chat agent is not configured")
            return ChatResponse(
                conversation_id=conversation_id,
                message="병원 예약 상담 구성이 완료되지 않았습니다.",
                data=ChatData(intent="FAIL", action_required="NONE"),
            )

        if jsessionid is None:
            logger.info("Hospital chat request rejected due to missing JSESSIONID")
            return ChatResponse(
                conversation_id=conversation_id,
                message="로그인이 필요합니다.",
                data=ChatData(intent="AUTH_REQUIRED", action_required="NONE"),
            )

        conversation_messages = self.session_store.get_messages(conversation_id)
        persisted_state = self.session_store.get_graph_state(conversation_id)
        agent_result = self.hospital_chat_agent.run_turn(
            conversation_id=conversation_id,
            user_message=message,
            conversation_messages=conversation_messages,
            jsessionid=jsessionid,
            persisted_state=persisted_state,
        )
        self.session_store.set_graph_state(conversation_id, agent_result["state"])
        self.session_store.append_message(conversation_id, "assistant", agent_result["message"])
        logger.info(
            "Hospital chat LangGraph response prepared: conversation_id=%s, action=%s",
            conversation_id,
            agent_result["action"],
        )
        return ChatResponse(
            conversation_id=conversation_id,
            message=agent_result["message"],
            data=ChatData(
                intent="REACT",
                action_required="ASK_USER" if agent_result["action"] == "ask_user" else "NONE",
                items=agent_result.get("items"),
            ),
        )

    def end_session(self, conversation_id: str) -> ChatResponse:
        self.session_store.delete(conversation_id)
        logger.info("Hospital chat session ended: conversation_id=%s", conversation_id)
        return ChatResponse(
            conversation_id=conversation_id,
            message="병원 예약 대화를 종료했습니다.",
            data=None,
        )
