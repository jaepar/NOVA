import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppButton } from '../components/design-system/AppButton'
import { Btn_1Col } from '../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../components/design-system/CommonInputGroup'
import { languages } from '../data/languages'
import { Check } from 'lucide-react'

export function Language() {
  const navigate = useNavigate()
  const [selectedLanguage, setSelectedLanguage] = useState<string>(languages[0].id)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleConfirm = () => {
    // 선택된 언어를 저장하고 랜딩 페이지로 이동
    navigate('/main')
  }

  // 검색어로 언어 목록 필터링
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
      bottomContent={<Btn_1Col onClick={handleConfirm}>확인</Btn_1Col>}
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <CommonInputGroup
          label="언어 검색"
          placeholder="언어 이름을 입력하세요"
          value={searchQuery}
          onChange={setSearchQuery}
          showSearchIcon={true}
        />

        {/* Language List */}
        <div className="space-y-2">
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">검색 결과가 없습니다</div>
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
