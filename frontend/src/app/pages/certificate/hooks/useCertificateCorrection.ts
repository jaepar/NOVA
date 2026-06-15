import { useCallback, useMemo, useRef, useState } from 'react'
import {
  certificateApi,
  getCertificateApiError,
  type CorrectionDocumentResponse,
  type CorrectionDocumentType,
} from '../../../../api'
import { novaToast } from '../../../components/design-system'
import { translateError, useTranslation } from '../../../i18n'
import {
  correctionUploadFieldMap,
  type RejectedCorrectionDocument,
} from '../CertificateCorrectionDetailParts'

const MAX_FILE_SIZE = 10 * 1024 * 1024

function isRejectedCorrectionDocument(
  document: CorrectionDocumentResponse
): document is RejectedCorrectionDocument {
  return document.status === 'REJECTED'
}

function isPdfFile(file: File) {
  const lowerName = file.name.toLowerCase()
  return file.type === 'application/pdf' || lowerName.endsWith('.pdf')
}

export function useCertificateCorrection(onSubmitSuccess: () => void) {
  const { t } = useTranslation()
  const tRef = useRef(t)
  tRef.current = t

  const fileInputRefs = useRef<Record<CorrectionDocumentType, HTMLInputElement | null>>({
    RESIDENCE_VERIFICATION_DOCUMENT: null,
    ALIEN_REGISTRATION_SUPPORTING_DOCUMENT: null,
  })
  const [documents, setDocuments] = useState<CorrectionDocumentResponse[]>([])
  const [files, setFiles] = useState<Partial<Record<CorrectionDocumentType, File>>>({})
  const [fileErrors, setFileErrors] = useState<Partial<Record<CorrectionDocumentType, string>>>({})
  const [openDocumentType, setOpenDocumentType] = useState<CorrectionDocumentType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const rejectedDocuments = useMemo(
    () => documents.filter(isRejectedCorrectionDocument),
    [documents]
  )

  const isAllAttached =
    rejectedDocuments.length > 0 &&
    rejectedDocuments.every((document) => Boolean(files[document.documentType]))

  const loadCorrectionDocuments = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const nextDocuments = await certificateApi.getCorrectionDocuments()
      const nextRejectedDocuments = nextDocuments.filter(isRejectedCorrectionDocument)

      setDocuments(nextDocuments)
      setFiles({})
      setFileErrors({})
      setOpenDocumentType(nextRejectedDocuments[0]?.documentType ?? null)
    } catch {
      setDocuments([])
      setOpenDocumentType(null)
      setErrorMessage(tRef.current('certificate.correctionLoadFailed'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setFileInputRef = (
    documentType: CorrectionDocumentType,
    element: HTMLInputElement | null
  ) => {
    fileInputRefs.current[documentType] = element
  }

  const openPicker = (documentType: CorrectionDocumentType) => {
    fileInputRefs.current[documentType]?.click()
  }

  const clearFile = (documentType: CorrectionDocumentType) => {
    const input = fileInputRefs.current[documentType]
    if (input) {
      input.value = ''
    }

    setFiles((prevFiles) => {
      const nextFiles = { ...prevFiles }
      delete nextFiles[documentType]
      return nextFiles
    })
  }

  const rejectFile = (documentType: CorrectionDocumentType, message: string) => {
    clearFile(documentType)
    setFileErrors((prevErrors) => ({ ...prevErrors, [documentType]: message }))
  }

  const handleFileChange = (documentType: CorrectionDocumentType, file: File | null) => {
    if (!file) return

    if (!isPdfFile(file)) {
      rejectFile(documentType, t('certificate.correctionPdfOnlyError'))
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      rejectFile(documentType, t('certificate.correctionFileTooLarge'))
      return
    }

    setFiles((prevFiles) => ({
      ...prevFiles,
      [documentType]: file,
    }))
    setFileErrors((prevErrors) => {
      const nextErrors = { ...prevErrors }
      delete nextErrors[documentType]
      return nextErrors
    })
  }

  const handleSubmit = async () => {
    if (!isAllAttached || isSubmitting) return

    const payload: Parameters<typeof certificateApi.uploadCorrectionDocuments>[0] = {}

    rejectedDocuments.forEach((document) => {
      const file = files[document.documentType]

      if (file) {
        payload[correctionUploadFieldMap[document.documentType]] = file
      }
    })

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      await certificateApi.uploadCorrectionDocuments(payload)
      onSubmitSuccess()
    } catch (error) {
      const apiError = getCertificateApiError(error)
      novaToast.error(translateError(apiError?.code, apiError?.message || t('certificate.correctionSubmitFailed')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
