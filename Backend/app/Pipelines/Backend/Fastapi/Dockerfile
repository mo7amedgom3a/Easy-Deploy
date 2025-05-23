FROM python:3.10-slim

WORKDIR /app

# Define build arguments
ARG PORT=8000
ARG ENTRY_POINT=main.py

# Set environment variables from the arguments
ENV PORT=${PORT}
ENV ENTRY_POINT=${ENTRY_POINT}

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port from the arguments
EXPOSE ${PORT}

# Use uvicorn to run the FastAPI application
CMD ["sh", "-c", "uvicorn ${ENTRY_POINT%.py}:app --host 0.0.0.0 --port ${PORT}"] 