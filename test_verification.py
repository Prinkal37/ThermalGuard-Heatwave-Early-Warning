import requests

def test_system():
    print("--- 1. Testing Status ---")
    r = requests.get('http://127.0.0.1:8000/api/status')
    assert r.status_code == 200, f"Status code {r.status_code}"
    status = r.json()
    print("System:", status['system'])
    print("Scenario:", status['active_scenario'])

    print("\n--- 2. Testing Pan-India Wards & Municipal Coverage ---")
    r = requests.get('http://127.0.0.1:8000/api/wards')
    assert r.status_code == 200
    wards = r.json()
    cities = sorted(list(set(w['city'] for w in wards)))
    print(f"Total Indian Wards Loaded: {len(wards)}")
    print(f"Total Municipal Cities Covered ({len(cities)}): {', '.join(cities)}")
    for w in wards[:5]:
        print(f"  • {w['name']} ({w['city']}): Tier={w['risk']['tier']}, WBGT={w['risk']['metrics']['wbgt_outdoor_c']}C, UTCI={w['risk']['metrics']['utci_c']}C, ER Surge=+{w['risk']['expected_hospital_surge_pct']}%")

    first_ward = wards[0]
    print(f"\n--- 3. Testing 5-Day Lead Time & Role Advisories for {first_ward['name']} ---")
    r = requests.get(f"http://127.0.0.1:8000/api/ward/{first_ward['id']}")
    assert r.status_code == 200
    detail = r.json()
    print(f"Forecast Days Count: {len(detail['forecast_5days'])}")

    print("\n--- 4. Testing Settings & API Keys Management ---")
    r = requests.get("http://127.0.0.1:8000/api/settings")
    assert r.status_code == 200
    settings = r.json()
    print(f"Dispatch Mode: {settings['dispatch_mode']}")
    print(f"Twilio Status: {settings['twilio']['status']}")
    print(f"WhatsApp Status: {settings['whatsapp']['status']}")
    print(f"Fast2SMS Status: {settings['fast2sms']['status']}")

    print("\n--- 5. Testing Municipal Heat Action Plan (HAP) Generator ---")
    r = requests.get(f"http://127.0.0.1:8000/api/reports/hap/{first_ward['id']}")
    assert r.status_code == 200
    hap = r.json()
    print(f"HAP Document: {hap['document_type']} ({hap['standard']})")
    print(f"Helplines: {hap['emergency_helplines']}")

    print("\n--- 6. Testing SACHET CAP v1.2 XML Generation ---")
    r = requests.get(f"http://127.0.0.1:8000/api/alerts/sachet-xml/{first_ward['id']}")
    assert r.status_code == 200
    xml = r.json()['xml']
    print(f"CAP XML length: {len(xml)} characters (urn:oasis:names:tc:emergency:cap:1.2 present: {'urn:oasis:names:tc:emergency:cap:1.2' in xml})")

    print("\n--- 7. Testing Frontend Build Serving ---")
    r = requests.get("http://localhost:5173")
    assert r.status_code == 200
    print("Frontend Dev Server Serving OK (HTTP 200)")

    print("\nALL EXPANDED PAN-INDIA TESTS PASSED PERFECTLY!")

if __name__ == '__main__':
    test_system()
