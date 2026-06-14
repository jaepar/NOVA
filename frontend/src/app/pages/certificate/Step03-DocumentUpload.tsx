import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert, FileText, Upload, X } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { AppButton } from '../../components/design-system/AppButton'
import { useTranslation } from '../../i18n'
import { useStep3PageStore } from '../../stores/pageStores'

export function Step03DocumentUpload() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const documents = useStep3PageStore((state) => state.documents)
  const setDocumentFile = useStep3PageStore((state) => state.setDocumentFile)
  const setDocumentError = useStep3PageStore((state) => state.setDocumentError)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const isAllAttached = documents.every((doc) => Boolean(doc.file))

  const openPicker = (id: string) => {
    fileInputRefs.current[id]?.click()
  }

  const formatFileSize = (size: number) => {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}MB`
    if (size >= 1024) return `${(size / 1024).toFixed(1)}KB`
    return `${size}B`
  }

  const isPdfFile = (file: File) => {
    const lowerName = file.name.toLowerCase()
    return file.type === 'application/pdf' || lowerName.endsWith('.pdf')
  }

  const handleNext = () => {
    if (!isAllAttached) {
      return
    }

    navigate('/certificate/step-04')
  }

  // [TEST ONLY START] 서류 업로드 여부와 무관하게 다음 단계로 이동하는 임시 버튼
  const handleSkipDocumentUploadForTest = () => {
    navigate('/certificate/step-04')
  }
  // [TEST ONLY END]

  return (
    <MobileLayout
      title={t('certificate.title')}
      backPath="/certificate/step-02"
      bottomContent={
        <div className="space-y-2">
          <Btn_1Col disabled={!isAllAttached} onClick={handleNext}>
            {t('certificate.nextButton')}
          </Btn_1Col>
          <Btn_1Col variant="outline" onClick={handleSkipDocumentUploadForTest}>
            {t('certificate.skipUploadTest')}
          </Btn_1Col>
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">{t('certificate.step03Heading')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('certificate.step03Description')}
          </p>
        </section>

        <section className="space-y-4">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <p className="font-medium">{t(doc.titleKey)}</p>
              </div>

              <input
                ref={(el) => {
                  fileInputRefs.current[doc.id] = el
                }}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  if (!file) return
                  if (!isPdfFile(file)) {
                    setDocumentFile(doc.id, null)
                    setDocumentError(doc.id, t('certificate.pdfOnlyError'))
                    event.target.value = ''
                    return
                  }
                  setDocumentFile(doc.id, file)
                }}
              />

              <AppButton
                variant="unstyled"
                onClick={() => openPicker(doc.id)}
                className="w-full rounded-xl border border-dashed border-border bg-background py-5 flex items-center justify-center gap-2 text-primary hover:bg-primary-soft transition-colors"
              >
                <Upload className="w-4 h-4" />
                {t('certificate.attachFile')}
              </AppButton>

              {doc.file && (
                <div className="rounded-xl border border-border bg-background p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{doc.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file.size)}
                      </p>
                    </div>
                  </div>
                  <AppButton
                    variant="unstyled"
                    onClick={() => setDocumentFile(doc.id, null)}
                    className="p-1 rounded-md hover:bg-secondary"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </AppButton>
                </div>
              )}

              {doc.error && <p className="text-xs text-red-600">{doc.error}</p>}
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-secondary p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <CircleAlert className="w-5 h-5" />
            <p className="font-medium">{t('certificate.cautionTitle')}</p>
          </div>
          <ul className="text-sm text-foreground/90 space-y-2 list-disc pl-5">
            <li>{t('certificate.docCaution1')}</li>
            <li>{t('certificate.docCaution2')}</li>
            <li>{t('certificate.docCaution3')}</li>
            <li>{t('certificate.docCaution4')}</li>
            <li>{t('certificate.docCaution5')}</li>
          </ul>
        </section>
      </div>
    </MobileLayout>
  )
}
