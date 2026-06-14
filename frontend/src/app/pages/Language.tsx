import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppButton } from '../components/design-system/AppButton'
import { Btn_1Col } from '../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../components/design-system/CommonInputGroup'
import { languages } from '../data/languages'
import { useTranslation } from '../i18n'
import { getOnboardingLanguage, saveOnboardingLanguage } from '../utils/onboardingStorage'

export function Language() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    () => getOnboardingLanguage() ?? languages[0].id
  )
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleConfirm = () => {
    saveOnboardingLanguage(selectedLanguage)
    navigate('/login', { state: { fromLanguage: true } })
  }

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return languages
    }

    const query = searchQuery.toLowerCase()
    return languages.filter(
      (language) =>
        language.name.toLowerCase().includes(query) || language.id.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <MobileLayout
      title="Language"
      titleKey="language.title"
      backPath="/landing"
      bottomContent={<Btn_1Col onClick={handleConfirm}>{t('common.confirm')}</Btn_1Col>}
    >
      <div className="space-y-4">
        <CommonInputGroup
          label={t('language.searchLabel')}
          placeholder={t('language.searchPlaceholder')}
          value={searchQuery}
          onChange={setSearchQuery}
          showSearchIcon={true}
        />

        <div className="space-y-2">
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('language.empty')}</div>
          ) : (
            filteredLanguages.map((language) => (
              <AppButton
                variant="unstyled"
                key={language.id}
                onClick={() => setSelectedLanguage(language.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  selectedLanguage === language.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30 bg-background'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{language.flag}</span>
                  <span className="font-normal">{language.name}</span>
                </div>
                {selectedLanguage === language.id && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </AppButton>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
