FROM --platform=linux/arm64 python:3.13-slim

WORKDIR /app
COPY src/ /app/
EXPOSE  7000
# 如果有 requirements.txt 文件，需要先安装依赖
RUN pip install -i https://mirrors.aliyun.com/pypi/simple/ --no-cache-dir -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7000"]
