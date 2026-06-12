FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8004
EXPOSE 9004

CMD uvicorn app.main:app --host 0.0.0.0 --port "${SERVER_PORT:-8004}"
