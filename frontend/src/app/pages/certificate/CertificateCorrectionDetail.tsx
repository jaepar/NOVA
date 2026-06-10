import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn_1Col, InlineBanner } from '../../components/design-system'
import { MobileLayout } from '../../components/layout/MobileLayout'
import {
  CorrectionDocumentCard,
  CorrectionEmptyState,
  CorrectionExpectedTimeCard,
  CorrectionReviewProgress,
  CorrectionSkeleton,
} from './CertificateCorrectionDetailParts'
import { useCertificateCorrection } from './hooks/useCertificateCorrection'

export function CertificateCorrectionDetail() {
  const navigate = useNavigate()
  const {
    rejectedDocuments,
    files,
    fileErrors,
    openDocumentType,
    isLoading,
    isSubmitting,
    errorMessage,
    isAllAttached,
    setOpenDocumentType,
    setFileInputRef,
    loadCorrectionDocuments,
    openPicker,
    handleFileChange,
    clearFile,
    handleSubmit,
  } = useCertificateCorrection(() => navigate('/certificate/corrections/complete'))

  useEffect(() => {
    loadCorrectionDocuments()
  }, [loadCorrectionDocuments])

  const bottomAction =
    errorMessage && rejectedDocuments.length === 0 ? (
      <Btn_1Col variant="outline" onClick={loadCorrectionDocuments}>
        다시 불러오기
      </Btn_1Col>
    ) : rejectedDocuments.length > 0 ? (
      <div className="[&>button]:border-0">
        <Btn_1Col disabled={!isAllAttached || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? '제출 중...' : '제출하기'}
        </Btn_1Col>
      </div>
    ) : undefined

  return (
    <MobileLayout
      title="보완 서류 제출"
      backPath="/main"
      bottomContent={bottomAction}
    >
      <div className="space-y-6 pb-2">
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          아래 서류를 확인하고 누락된 항목을 보완해 주세요.
        </p>

        <CorrectionReviewProgress />

        <section className="rounded-2xl border border-border bg-background p-4">
          <h3 className="text-[17px] font-semibold text-foreground">
            보완 필요 서류 ({rejectedDocuments.length})
          </h3>

          <div className="mt-4">
            {isLoading ? (
              <CorrectionSkeleton />
            ) : errorMessage && rejectedDocuments.length === 0 ? (
              <InlineBanner message={errorMessage} variant="error" />
            ) : rejectedDocuments.length === 0 ? (
              <CorrectionEmptyState />
            ) : (
              <div className="space-y-3">
                {errorMessage ? <InlineBanner message={errorMessage} variant="error" /> : null}

                {rejectedDocuments.map((document) => {
                  const documentType = document.documentType
                  const isOpen = openDocumentType === documentType

                  return (
                    <CorrectionDocumentCard
                      key={documentType}
                      document={document}
                      selectedFile={files[documentType]}
                      fileError={fileErrors[documentType]}
                      isOpen={isOpen}
                      inputRef={(element) => setFileInputRef(documentType, element)}
                      onToggle={() => setOpenDocumentType(isOpen ? null : documentType)}
                      onPick={() => openPicker(documentType)}
                      onFileChange={(file) => handleFileChange(documentType, file)}
                      onRemove={() => clearFile(documentType)}
                    />
                  )
                })}

                <CorrectionExpectedTimeCard />
              </div>
            )}
          </div>
        </section>
      </div>
    </MobileLayout>
  )
}
