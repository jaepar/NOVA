import { useEffect, useRef, useState } from 'react'
import { Bot, SendHorizontal } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { hospitalChatApi } from '../../../api'

type HospitalChatLocationState = {
  conversationId?: string
  initialMessage?: string
}

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  text: string
  createdAt: string
}

const TEXTAREA_MAX_HEIGHT = 120

function formatChatTime(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function createAssistantMessage(text: string): ChatMessage {
  return {
    id: `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    text,
    createdAt: formatChatTime(),
  }
}

function createUserMessage(text: string): ChatMessage {
  return {
    id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'user',
    text,
    createdAt: formatChatTime(),
  }
}

function TypingBubble() {
  return (
    <div className="flex w-full items-end gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary">
        <Bot className="h-6 w-6" />
      </div>
      <div className="max-w-[calc(100%-4.5rem)] rounded-[28px] rounded-bl-[10px] border border-blue-100 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary/70 [animation-delay:0ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary/70 [animation-delay:180ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary/70 [animation-delay:360ms]" />
        </div>
      </div>
    </div>
  )
}

export function HospitalChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state as HospitalChatLocationState | null) ?? null
  const conversationId = locationState?.conversationId ?? null
  const initialMessage = locationState?.initialMessage ?? ''
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollEndRef = useRef<HTMLDivElement | null>(null)
  const messageListRef = useRef<HTMLElement | null>(null)
  const pendingMessagesRef = useRef<string[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialMessage ? [createAssistantMessage(initialMessage)] : []
  )

  const hasConversation = Boolean(conversationId)
  const isComposerDisabled = !hasConversation || isEndingSession
  const placeholder = isSending
    ? '챗봇이 답변을 준비하고 있어요.'
    : '메시지를 입력해주세요.'

  useEffect(() => {
    if (!conversationId) {
      navigate('/main', { replace: true })
    }
  }, [conversationId, navigate])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      messageListRef.current?.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth',
      })
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [messages, isSending])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'
    const nextHeight = Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)
    textarea.style.height = `${nextHeight}px`
    textarea.style.overflowY = textarea.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden'
  }, [draft])

  const appendAssistantError = () => {
    setMessages((current) => [
      ...current,
      createAssistantMessage('지금은 답변을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.'),
    ])
  }

  const flushPendingMessages = async () => {
    if (isSending || isEndingSession) {
      return
    }

    const nextMessage = pendingMessagesRef.current.shift()
    if (!nextMessage) {
      return
    }

    await sendMessage(nextMessage)
  }

  const sendMessage = async (rawMessage: string) => {
    const trimmedMessage = rawMessage.trim()
    if (!trimmedMessage || !conversationId || isEndingSession) {
      return
    }

    if (isSending) {
      pendingMessagesRef.current.push(trimmedMessage)
      return
    }

    setMessages((current) => [...current, createUserMessage(trimmedMessage)])
    setIsSending(true)

    try {
      const response = await hospitalChatApi.sendMessage(conversationId, trimmedMessage)

      setMessages((current) => [
        ...current,
        createAssistantMessage(response.message),
      ])
    } catch {
      appendAssistantError()
    } finally {
      setIsSending(false)
      void flushPendingMessages()
    }
  }

  const handleSubmit = async () => {
    const nextDraft = draft.trim()
    if (!nextDraft) {
      return
    }

    setDraft('')
    await sendMessage(nextDraft)
  }

  const handleBack = async () => {
    if (isEndingSession) {
      return
    }

    setIsEndingSession(true)

    try {
      if (conversationId) {
        await hospitalChatApi.endSession(conversationId)
      }
    } catch {
      // 세션 종료 실패 시에도 사용자가 화면을 빠져나갈 수 있게 한다.
    } finally {
      navigate('/main', { replace: true })
    }
  }

  return (
    <div className="h-full w-full bg-white">
      <MobileLayout
        title="병원 예약"
        onBack={handleBack}
        bottomBackgroundColor="#ffffff"
        bottomContent={
          <div className="rounded-[30px] border border-blue-100/80 bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <textarea
                ref={textareaRef}
                value={draft}
                disabled={isComposerDisabled}
                placeholder={placeholder}
                rows={1}
                className="max-h-[120px] min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1 py-[10px] text-base leading-6 text-foreground placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void handleSubmit()
                  }
                }}
              />
              <AppButton
                type="button"
                variant="unstyled"
                disabled={isEndingSession || !draft.trim()}
                onClick={() => void handleSubmit()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white disabled:bg-slate-200 disabled:text-slate-400"
                aria-label="메시지 전송"
              >
                <SendHorizontal className="h-5 w-5" />
              </AppButton>
            </div>
          </div>
        }
      >
        <section
          ref={messageListRef}
          className="flex h-full w-full flex-col gap-5 overflow-y-auto pb-4 pt-1"
        >
          {messages.map((message) => {
            const isAssistant = message.role === 'assistant'

            return (
              <article
                key={message.id}
                className={`flex w-full items-end gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
              >
                {isAssistant ? (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                ) : null}

                <div
                  className={`flex max-w-[min(78%,20rem)] items-end gap-2 sm:max-w-[min(82%,24rem)] ${
                    isAssistant ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div
                    className={`rounded-[28px] px-5 py-4 text-[15px] leading-7 ${
                      isAssistant
                        ? 'rounded-bl-[10px] border border-blue-100 bg-white text-slate-900'
                        : 'rounded-br-[10px] bg-primary text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  </div>

                  <span className="shrink-0 pb-1 text-xs text-slate-400">
                    {message.createdAt}
                  </span>
                </div>
              </article>
            )
          })}

          {isSending ? (
            <div className="space-y-2">
              <TypingBubble />
              <p className="pl-[60px] text-xs text-slate-400">답변을 준비하고 있어요.</p>
            </div>
          ) : null}

          {!messages.length ? (
            <div className="flex h-full items-center justify-center py-20 text-center text-sm text-slate-500">
              대화를 시작하는 중입니다.
            </div>
          ) : null}

          <div ref={scrollEndRef} />
        </section>
      </MobileLayout>
    </div>
  )
}
