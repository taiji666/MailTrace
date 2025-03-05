import requests
from bs4 import BeautifulSoup
import json


class QueryIP:
    def __init__(self, ip):
        self.ip = ip
        self.url = f"https://apimobile.meituan.com/locate/v2/ip/loc?client_source=yourAppKey&rgeo=true&ip={ip}"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        }

    def query(self):
        response = requests.get(self.url, headers=self.headers)
        soup = BeautifulSoup(response.text, "html.parser")
        result = json.loads(soup.text)
        try:
            ip_info = {
                "ip": result["data"]["ip"],
                "country": result["data"]["rgeo"]["country"],
                "province": result["data"]["rgeo"]["province"],
                "city": result["data"]["rgeo"]["city"],
                "district": result["data"]["rgeo"]["district"],
            }
        except:
            ip_info = False
        if ip_info:
            return ip_info
        else:
            print("IP address not found")
            return False


if __name__ == "__main__":
    ip = "111.18.39.69"
    query_ip = QueryIP(ip)
    result = query_ip.query()
    print(result)
