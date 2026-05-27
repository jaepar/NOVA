import { ReactNode } from 'react'

interface CenteredTaskContentProps {
  task: string
  description?: string
  children?: ReactNode
}

export function CenteredTaskContent({ task, description, children }: CenteredTaskContentProps) {
  const normalizedDescription = description?.replace(/\\n/g, '\n')

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {children}

        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-gray-900">{task}</h2>
          {normalizedDescription && (
            <p className="text-sm text-gray-500 whitespace-pre-line">{normalizedDescription}</p>
          )}
        </div>
      </div>
    </div>
  )
}
