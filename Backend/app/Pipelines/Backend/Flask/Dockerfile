FROM python:3.10-slim

WORKDIR /app

# Define build arguments
ARG PORT=5000
ARG ENTRY_POINT=app.py

# Set environment variables from the arguments
ENV PORT=${PORT}
ENV ENTRY_POINT=${ENTRY_POINT}

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port from the arguments
EXPOSE ${PORT}

# Use the application name from the arguments
CMD ["sh", "-c", "python ${ENTRY_POINT}"]
