# Use Ubuntu base
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        wget curl gnupg2 software-properties-common \
        xvfb python3 python3-pip wine64 wine32 cabextract git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt
COPY . .

ENV DISPLAY=:99
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
