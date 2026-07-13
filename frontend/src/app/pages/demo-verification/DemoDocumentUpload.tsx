import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert, FileText, Upload, X } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'

type DocumentId = 'registration-application' | 'residence-proof'

type DemoDocument = {
  id: DocumentId
  titleKey: string
  file: File | null
  error: string | null
}

const initialDocuments: DemoDocument[] = [
  {
    id: 'registration-application',
    titleKey: 'certificate.step03RegistrationApplication',
    file: null,
    error: null,
  },
  {
    id: 'residence-proof',
    titleKey: 'certificate.step03ResidenceProof',
    file: null,
    error: null,
  },
]

export function DemoDocumentUpload() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [documents, setDocuments] = useState(initialDocuments)
  const fileInputRefs = useRef<Record<DocumentId, HTMLInputElement | null>>({
    'registration-application': null,
    'residence-proof': null,
  })

  const isAllAttached = documents.every((document) => Boolean(document.file))

  const formatFileSize = (size: number) => {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}MB`
    if (size >= 1024) return `${(size / 1024).toFixed(1)}KB`
    return `${size}B`
  }

  const updateDocument = (id: DocumentId, file: File | null, error: string | null) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id ? { ...document, file, error } : document,
      ),
    )
  }

  const handleFile = (id: DocumentId, file: File | null) => {
    if (!file) return

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      updateDocument(id, null, t('certificate.pdfOnlyError'))
      return
    }

    updateDocument(id, file, null)
  }

  return (
    <MobileLayout
      title={t('certificate.title')}
      headerType="close"
      closePath="/"
      bottomContent={
        <Btn_1Col
          disabled={!isAllAttached}
          onClick={() => navigate('/demo/verification/passport-guide')}
        >
          {t('certificate.nextButton')}
        </Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
        <DemoVerificationProgress currentStep={1} />
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('certificate.step03Heading')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('certificate.step03Description')}
          </p>
        </section>

        <section className="space-y-4">
          {documents.map((document, index) => (
            <div
              key={document.id}
              className="space-y-4 rounded-2xl border border-border bg-secondary/40 p-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <p className="font-medium">{t(document.titleKey)}</p>
              </div>

              <input
                ref={(element) => {
                  fileInputRefs.current[document.id] = element
                }}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  handleFile(document.id, event.target.files?.[0] ?? null)
                  event.target.value = ''
                }}
              />

              <AppButton
                variant="unstyled"
                onClick={() => fileInputRefs.current[document.id]?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background py-5 text-primary transition-colors hover:bg-primary-soft"
              >
                <Upload className="h-4 w-4" />
                {t('certificate.attachFile')}
              </AppButton>

              {document.file && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm">{document.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(document.file.size)}
                      </p>
                    </div>
                  </div>
                  <AppButton
                    variant="unstyled"
                    aria-label={t('demoVerification.removeFile')}
                    onClick={() => updateDocument(document.id, null, null)}
                    className="rounded-md p-1 hover:bg-secondary"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </AppButton>
                </div>
              )}

              {document.error && <p className="text-xs text-red-600">{document.error}</p>}
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-2xl bg-secondary p-4">
          <div className="flex items-center gap-2 text-primary">
            <CircleAlert className="h-5 w-5" />
            <p className="font-medium">{t('certificate.cautionTitle')}</p>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/90">
            <li>{t('certificate.docCaution2')}</li>
            <li>{t('certificate.docCaution3')}</li>
            <li>{t('certificate.docCaution4')}</li>
          </ul>
        </section>
      </div>
    </MobileLayout>
  )
}
