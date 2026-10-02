import requests

def test_fast2sms():
    key = "5b0K9UZaq86exHrNPOyWDkfwt2scg7MSoFiXRm3vB1znYGld4JQJv2Uj3rdsb7GDAF4I1ia0V5BoEWnk"
    url = "https://www.fast2sms.com/dev/bulkV2"
    payload = {
        "route": "otp",
        "variables_values": "5921",
        "numbers": "9999999999"
    }
    try:
        r = requests.post(url, json=payload, headers={"authorization": key, "Content-Type": "application/json"}, timeout=10)
        print("Fast2SMS POST Response:", r.status_code, r.text)
    except Exception as e:
        print("Fast2SMS POST Error:", e)

def test_esri_tile():
    url = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/4/7/11"
    url_ref = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/4/7/11"
    try:
        r = requests.get(url, timeout=10)
        print("Esri Base Tile Response:", r.status_code, len(r.content))
        r2 = requests.get(url_ref, timeout=10)
        print("Esri Ref Tile Response:", r2.status_code, len(r2.content))
    except Exception as e:
        print("Esri Request Error:", e)

def test_osm_tile():
    url = "https://tile.openstreetmap.org/4/7/11.png"
    try:
        r = requests.get(url, headers={"User-Agent": "ThermalGuard/1.0"}, timeout=10)
        print("OSM Tile Response:", r.status_code, len(r.content), r.headers.get("Content-Type"))
    except Exception as e:
        print("OSM Request Error:", e)

if __name__ == "__main__":
    test_fast2sms()
    test_esri_tile()
    test_osm_tile()
