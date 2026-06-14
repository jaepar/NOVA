import { MobileLayout } from '../../components/layout/MobileLayout'
import { Spinner } from '../../components/design-system/Spinner'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'

interface LoadingProps {
  headerTitle: string
  headerTitleKey?: string
  task: string
  taskKey?: string
  description?: string
  descriptionKey?: string
  spinnerSize?: 'sm' | 'md' | 'lg'
}

export function Loading({
  headerTitle,
  headerTitleKey,
  task,
  taskKey,
  description,
  descriptionKey,
  spinnerSize = 'lg',
}: LoadingProps) {
  return (
    <MobileLayout title={headerTitle} titleKey={headerTitleKey}>
      <CenteredTaskContent
        task={task}
        taskKey={taskKey}
        description={description}
        descriptionKey={descriptionKey}
      >
        <Spinner size={spinnerSize} />
      </CenteredTaskContent>
    </MobileLayout>
  )
}
