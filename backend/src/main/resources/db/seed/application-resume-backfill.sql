INSERT INTO application_resume (
    application_id,
    resume_id,
    created_at,
    updated_at
)
SELECT
    a.application_id,
    a.resume_id,
    COALESCE(a.created_at, CURRENT_TIMESTAMP),
    COALESCE(a.updated_at, CURRENT_TIMESTAMP)
FROM application a
WHERE a.resume_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM application_resume ar
      WHERE ar.application_id = a.application_id
        AND ar.resume_id = a.resume_id
  );
