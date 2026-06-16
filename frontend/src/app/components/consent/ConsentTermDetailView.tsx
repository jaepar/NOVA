import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloseButtonTemplate } from '../../pages/common/CloseButtonTemplate'
import { ConsentDefinition, findTerm } from '../../domains/spec'
import { getAgreedTermIds, markTermAgreed } from '../../domains/storage'
import { useTranslation } from '../../i18n'

interface ConsentTermDetailViewProps {
  definition: ConsentDefinition
  termId?: string
  basePath?: string
  preserveStateKey?: string
  showSelectionControls?: boolean
  translationNamespace?: string
}

export function ConsentTermDetailView({
  definition,
  termId,
  basePath = '/consent-template',
  preserveStateKey = 'preserveConsentState',
  showSelectionControls = true,
  translationNamespace,
}: ConsentTermDetailViewProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const namespace = translationNamespace ?? `consent.${definition.domain}`
  const term = useMemo(() => (termId ? findTerm(definition, termId) : null), [definition, termId])
  const isAgreed = termId ? getAgreedTermIds().has(termId) : false

  if (!term) {
    return (
      <CloseButtonTemplate
        headerTitle={t('account.terms.detailTitle')}
        headerTitleKey="account.terms.detailTitle"
        onClose={() => navigate(basePath, { state: { [preserveStateKey]: true } })}
      >
        <div className="pt-10 text-center">
          {t('account.terms.termNotFound')}
        </div>
      </CloseButtonTemplate>
    )
  }

  return (
    <CloseButtonTemplate
      headerTitle={t('account.terms.detailTitle')}
      headerTitleKey="account.terms.detailTitle"
      onClose={() => navigate(basePath, { state: { [preserveStateKey]: true } })}
      showBottomButton={showSelectionControls}
      buttonText={t('account.terms.agree')}
      buttonTextKey="account.terms.agree"
      onButtonClick={() => {
        if (termId && !isAgreed) markTermAgreed(termId)
        navigate(basePath, { state: { [preserveStateKey]: true } })
      }}
    >
      <div className="space-y-4 pt-5">
        <h2 className="text-xl font-semibold">
          {t(`${namespace}.terms.${term.id}.title`, term.title)}
        </h2>
        {term.content.map((p, i) => (
          <p key={`${term.id}-${i}`} className="text-sm text-foreground/90 leading-relaxed">
            {t(`${namespace}.terms.${term.id}.content.${i}`, p)}
          </p>
        ))}
      </div>
    </CloseButtonTemplate>
  )
}

