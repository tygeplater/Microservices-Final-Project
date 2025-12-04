FROM python:3.11-slim

WORKDIR /app

# Install Dependencies
RUN apt-get update && apt-get install -y \
    gcc \ 
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python Libraries
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ ./api/

# Expose Port 8000
EXPOSE 8001

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

CMD ["uvicorn", "api.api:app", "--host", "0.0.0.0", "--port", "8001"]