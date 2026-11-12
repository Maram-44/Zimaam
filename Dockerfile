# Public demo image. UNTESTED here (no Docker in the build sandbox): build it once locally before relying on it.
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 SIAAJ_PUBLIC=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY web ./web
# One worker only: demo sessions live in memory.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --proxy-headers"]
