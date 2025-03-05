import fastapi
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    JSONResponse,
    ORJSONResponse,
    PlainTextResponse,
    RedirectResponse,
    Response,
    StreamingResponse,
    UJSONResponse,
)
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from query_ip import QueryIP
import json
from datetime import datetime
from pathlib import Path

# 设定时区"Asia/Shanghai"
from zoneinfo import ZoneInfo

# 创建北京时区对象
beijing_tz = ZoneInfo("Asia/Shanghai")
router = APIRouter()
app = FastAPI()
templates = Jinja2Templates(directory="templates")
# 挂载静态文件目录
app.mount("/static", StaticFiles(directory="static"), name="static")

# 图片配置
image_dict = {
    "1": {"path": "./static/taiji.svg", "name": "太极图", "description": "太极图案追踪图片"},
    "2": {
        "path": "./static/webmail.gif",
        "name": "Webmail图",
        "description": "Webmail追踪图片",
    },
}

defult_guid_json = {
    "client_id": {
        "guid": {
            "guid": "guid",
            "ip": "ip",
            "country": "country",
            "province": "province",
            "city": "city",
            "district": "district",
            "time": "time",
            "image_id": "image_id",
            "user_agent": "user_agent",
        }
    }
}

# 确保数据文件存在
data_file = Path("guid.json")
if not data_file.exists():
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump({}, f, indent=4, ensure_ascii=False)

# 读取现有数据
try:
    with open(data_file, "r", encoding="utf-8") as f:
        guid_json = json.load(f)
except json.JSONDecodeError:
    print("Error decoding JSON, initializing with empty dict")
    guid_json = {}


def save_guid_json():
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump(guid_json, f, indent=4, ensure_ascii=False)


def _get_image_path(image_id: str) -> str | None:
    if image_id in image_dict:
        return image_dict[image_id]["path"]
    return None


@router.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/api/query/{client_id}")
async def query_client_data(client_id: str):
    if client_id in guid_json:
        return guid_json[client_id]
    return {}


@router.get("/api/images")
async def get_images():
    return image_dict


@router.get("/image/{image_id}/")
async def get_image(
    image_id: str, request: Request, guid: str = None, client_id: str = None
):
    image_path = _get_image_path(image_id)
    client_ip = request.client.host
    real_ip = request.headers.get("x-forwarded-for", "").split(",")[0]
    queried_ip = QueryIP(client_ip)
    ip_info = queried_ip.query()
    user_agent = request.headers.get("user-agent")

    if client_id not in guid_json:
        guid_json[client_id] = {}

    if guid and client_id and ip_info:
        guid_json[client_id][guid] = {
            "guid": guid,
            "ip": client_ip,
            "country": ip_info["country"],
            "province": ip_info["province"],
            "city": ip_info["city"],
            "district": ip_info["district"],
            "time": datetime.now(beijing_tz).strftime("%Y-%m-%d %H:%M:%S"),
            "image_id": image_id,
            "user_agent": user_agent,
        }
    else:
        guid_json[client_id][guid] = {
            "guid": guid,
            "ip": client_ip,
            "country": "",
            "province": "",
            "city": "",
            "district": "",
            "time": datetime.now(beijing_tz).strftime("%Y-%m-%d %H:%M:%S"),
            "image_id": image_id,
            "user_agent": user_agent,
        }

    save_guid_json()
    print(f"Client IP: {client_ip}, Real_ip: {real_ip}, User-Agent: {user_agent}")
    print(f"guid: {guid}, client_id: {client_id}")

    if image_path:
        return FileResponse(image_path)
    return {"error": "Image not found"}


app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
