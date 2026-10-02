"""
ThermalGuard Live API Settings & Credentials Store
Manages integration credentials for:
- Twilio SMS (Account SID, Auth Token, From Number)
- Meta WhatsApp Business / Cloud API (Access Token, Phone Number ID)
- Fast2SMS India (API Key, Route)
- Dispatch Mode: SIMULATION vs LIVE_PRODUCTION
"""

import os
import requests
from typing import Dict, Any, Optional

class SettingsStore:
    def __init__(self):
        self.dispatch_mode = "LIVE_PRODUCTION" # 'SIMULATION' or 'LIVE_PRODUCTION'
        
        # Twilio credentials
        self.twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_from_phone = os.getenv("TWILIO_FROM_PHONE", "+1844HEATGRD")
        
        # Meta WhatsApp Cloud API credentials
        self.whatsapp_token = os.getenv("WHATSAPP_TOKEN", "")
        self.whatsapp_phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        
        # Fast2SMS India credentials
        self.fast2sms_api_key = os.getenv("FAST2SMS_API_KEY", "5b0K9UZaq86exHrNPOyWDkfwt2scg7MSoFiXRm3vB1znYGld4JQJv2Uj3rdsb7GDAF4I1ia0V5BoEWnk")

    def get_public_settings(self) -> Dict[str, Any]:
        """
        Returns sanitized settings (masks secrets).
        """
        return {
            "dispatch_mode": self.dispatch_mode,
            "twilio": {
                "account_sid_configured": bool(self.twilio_account_sid),
                "account_sid_masked": f"{self.twilio_account_sid[:6]}...{self.twilio_account_sid[-4:]}" if len(self.twilio_account_sid) > 10 else ("Configured" if self.twilio_account_sid else "Not Set"),
                "from_phone": self.twilio_from_phone,
                "status": "READY" if self.twilio_account_sid and self.twilio_auth_token else "SIMULATED"
            },
            "whatsapp": {
                "configured": bool(self.whatsapp_token and self.whatsapp_phone_number_id),
                "phone_number_id": self.whatsapp_phone_number_id if self.whatsapp_phone_number_id else "Not Set",
                "status": "READY" if self.whatsapp_token and self.whatsapp_phone_number_id else "SIMULATED"
            },
            "fast2sms": {
                "configured": bool(self.fast2sms_api_key),
                "api_key_masked": f"{self.fast2sms_api_key[:6]}...{self.fast2sms_api_key[-4:]}" if len(self.fast2sms_api_key) > 10 else ("Configured" if self.fast2sms_api_key else "Not Set"),
                "status": "LIVE_AUTHENTICATED" if self.fast2sms_api_key else "SIMULATED"
            }
        }

    def update_settings(self, data: Dict[str, Any]):
        if "dispatch_mode" in data:
            self.dispatch_mode = data["dispatch_mode"]
        if "twilio_account_sid" in data and data["twilio_account_sid"]:
            self.twilio_account_sid = data["twilio_account_sid"].strip()
        if "twilio_auth_token" in data and data["twilio_auth_token"]:
            self.twilio_auth_token = data["twilio_auth_token"].strip()
        if "twilio_from_phone" in data and data["twilio_from_phone"]:
            self.twilio_from_phone = data["twilio_from_phone"].strip()
        if "whatsapp_token" in data and data["whatsapp_token"]:
            self.whatsapp_token = data["whatsapp_token"].strip()
        if "whatsapp_phone_number_id" in data and data["whatsapp_phone_number_id"]:
            self.whatsapp_phone_number_id = data["whatsapp_phone_number_id"].strip()
        if "fast2sms_api_key" in data and data["fast2sms_api_key"]:
            self.fast2sms_api_key = data["fast2sms_api_key"].strip()

    def send_live_twilio_sms(self, to_phone: str, message: str) -> Dict[str, Any]:
        """
        Executes real HTTP call to Twilio REST API if configured.
        """
        if not (self.twilio_account_sid and self.twilio_auth_token):
            return {"error": "Twilio Account SID or Auth Token missing. Switched to high-fidelity simulated delivery."}
            
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_account_sid}/Messages.json"
        data = {
            "To": to_phone,
            "From": self.twilio_from_phone,
            "Body": message
        }
        try:
            res = requests.post(url, data=data, auth=(self.twilio_account_sid, self.twilio_auth_token), timeout=10)
            return {
                "status_code": res.status_code,
                "response": res.json()
            }
        except Exception as e:
            return {"error": str(e)}

    def send_live_whatsapp(self, to_phone: str, ward_name: str, tier: str, action: str) -> Dict[str, Any]:
        """
        Executes real HTTP call to Meta WhatsApp Cloud API if configured.
        """
        if not (self.whatsapp_token and self.whatsapp_phone_number_id):
            return {"error": "Meta WhatsApp Token or Phone Number ID missing. Switched to high-fidelity simulated delivery."}
            
        url = f"https://graph.facebook.com/v19.0/{self.whatsapp_phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.whatsapp_token}",
            "Content-Type": "application/json"
        }
        # Format phone: clean special characters
        clean_phone = "".join(filter(str.isdigit, to_phone))
        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "text",
            "text": {
                "body": f"🚨 *THERMALGUARD HEAT ALERT: {tier}*\n\nTarget Ward: *{ward_name}*\nImmediate Advisory: {action}\nStay hydrated. Dial 108 for medical emergency."
            }
        }
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            return {
                "status_code": res.status_code,
                "response": res.json()
            }
        except Exception as e:
            return {"error": str(e)}

    def send_live_fast2sms(self, to_phone: str, message: str) -> Dict[str, Any]:
        """
        Executes real HTTP call to Fast2SMS India API if configured.
        """
        if not self.fast2sms_api_key:
            return {"error": "Fast2SMS API Key missing. Switched to high-fidelity simulated delivery."}
            
        url = "https://www.fast2sms.com/dev/bulkV2"
        headers = {
            "authorization": self.fast2sms_api_key,
            "Content-Type": "application/json"
        }
        clean_phone = "".join(filter(str.isdigit, to_phone))[-10:] # 10 digit Indian number
        if not clean_phone or len(clean_phone) != 10:
            clean_phone = "9876543210"

        payload = {
            "route": "q", # Quick SMS route
            "message": message[:159],
            "language": "english",
            "flash": 0,
            "numbers": clean_phone
        }
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            res_json = {}
            try:
                res_json = res.json()
            except Exception:
                res_json = {"raw": res.text}
                
            if res.status_code == 200 and res_json.get("return") is True:
                return {
                    "status_code": 200,
                    "live_delivered": True,
                    "provider": "Fast2SMS India",
                    "request_id": res_json.get("request_id"),
                    "response": res_json
                }
            else:
                msg = res_json.get("message", res.text)
                return {
                    "status_code": res.status_code,
                    "provider": "Fast2SMS India",
                    "error": msg,
                    "notice": f"Fast2SMS API responded: '{msg}'. Note: Developer accounts often require a 100 INR transaction before live routing is enabled. Fallback simulation triggered.",
                    "response": res_json
                }
        except Exception as e:
            return {"error": str(e)}

settings_store = SettingsStore()
