FROM python:3.9-slim

WORKDIR /app

# Define build arguments
ARG CLIENT_ID
ARG CLIENT_SECRET
ARG REDIRECT_URI
ARG AWS_ACCOUNT_ID
ARG AWS_DEFAULT_REGION
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG PUPLIC_KEY_ID
ARG CONNECTION_STRING
ARG DATABASE_NAME
ARG JWT_ALGORITHM
ARG JWT_SECRET_KEY
ARG EXPIRATION_TIME
ARG DIR_BASE

# Set environment variables from build arguments
ENV CLIENT_ID=${CLIENT_ID}
ENV CLIENT_SECRET=${CLIENT_SECRET}
ENV REDIRECT_URI=${REDIRECT_URI}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
ENV AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV CONNECTION_STRING=${CONNECTION_STRING}
ENV DATABASE_NAME=${DATABASE_NAME}
ENV JWT_ALGORITHM=${JWT_ALGORITHM}
ENV DIR_BASE=${DIR_BASE}

ENV JWT_SECRET_KEY=${JWT_SECRET_KEY}
ENV EXPIRATION_TIME=${EXPIRATION_TIME}

COPY requirements.txt .

# Install system 
RUN pip3 install --no-cache-dir -r requirements.txt

# Install Git and other required packages
RUN apt-get update && \
    apt-get install -y git gnupg software-properties-common curl && \
    apt-get clean
# Install required packages for adding repositories
RUN apt-get update && \
    apt-get install -y \
    wget \
    lsb-release \
    software-properties-common \
    gnupg

# Install Terraform
RUN wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list && \
    apt-get update && \
    apt-get install -y terraform && \
    apt-get clean

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    apt-get install -y unzip && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf aws awscliv2.zip && \
    apt-get remove -y unzip && \
    apt-get clean

# Configure AWS CLI with credentials and default region
RUN aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID} && \
    aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY} && \
    aws configure set default.region us-east-1 && \
    aws configure set output json


COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]