import { MobileLayout } from '../../components/layout/MobileLayout'
import { Spinner } from '../../components/design-system/Spinner'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'

interface LoadingProps {
  headerTitle: string
  task: string
  description?: string
  spinnerSize?: 'sm' | 'md' | 'lg'
}

export function Loading({ headerTitle, task, description, spinnerSize = 'lg' }: LoadingProps) {
  return (
    <MobileLayout title={headerTitle}>
      <CenteredTaskContent task={task} description={description}>
        <Spinner size={spinnerSize} />
      </CenteredTaskContent>
    </MobileLayout>
  )
}
