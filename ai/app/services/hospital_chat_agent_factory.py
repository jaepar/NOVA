from app.clients.openai_intent_client import OpenAiIntentClient
from app.config import OPENAI_API_KEY, OPENAI_MODEL, USE_LLM_INTENT_RESOLVER
from app.services.langgraph_hospital_agent import LangGraphHospitalAgent
from app.services.llm_react_step_resolver import LlmReActStepResolver
from app.services.react_tool_executor import ReActToolExecutor


def create_hospital_chat_agent(
    use_llm: bool | None = None,
    openai_api_key: str | None = None,
    openai_model: str | None = None,
    backend_client=None,
):
    effective_use_llm = USE_LLM_INTENT_RESOLVER if use_llm is None else use_llm
    effective_api_key = OPENAI_API_KEY if openai_api_key is None else openai_api_key
    effective_model = OPENAI_MODEL if openai_model is None else openai_model

    if not effective_use_llm or not effective_api_key or backend_client is None:
        return None

    step_resolver = LlmReActStepResolver(
        llm_client=OpenAiIntentClient(
            api_key=effective_api_key,
            model=effective_model,
        )
    )
    tool_executor = ReActToolExecutor(backend_client=backend_client)
    return LangGraphHospitalAgent(
        step_resolver=step_resolver,
        tool_executor=tool_executor,
    )
