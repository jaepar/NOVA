import { ReactNode } from 'react'
import { useTranslation } from '../../i18n'

interface CenteredTaskContentProps {
  task: string
  taskKey?: string
  description?: string
  descriptionKey?: string
  children?: ReactNode
}

export function CenteredTaskContent({
  task,
  taskKey,
  description,
  descriptionKey,
  children,
}: CenteredTaskContentProps) {
  const { t } = useTranslation()
  const resolvedTask = taskKey ? t(taskKey, task) : task
  const resolvedDescription = descriptionKey ? t(descriptionKey, description) : description
  const normalizedDescription = resolvedDescription?.replace(/\\n/g, '\n')

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {children}

        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-gray-900">{resolvedTask}</h2>
          {normalizedDescription && (
            <p className="text-sm text-gray-500 whitespace-pre-line">{normalizedDescription}</p>
          )}
        </div>
      </div>
    </div>
  )
}
