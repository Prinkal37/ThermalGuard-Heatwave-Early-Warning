"""
ThermalGuard Targeted Alerts & Role-Specific Advisories Module
Supports:
1. Multi-channel dispatch templates (Twilio SMS, WhatsApp Business API, Fast2SMS)
2. NDMA / SACHET Common Alerting Protocol (CAP v1.2) XML compliant output
3. Role-specific actionable advisories (General Public, ASHA Workers, Employers/Outdoor Workers, Hospitals, Power Utilities)
"""

import uuid
import datetime
from typing import Dict, Any, List

def generate_sachet_cap_xml(
    alert_id: str,
    ward_name: str,
    city: str,
    tier: str,
    risk_score: float,
    metrics: Dict[str, Any],
    instructions: List[str]
) -> str:
    """
    Generates standard OASIS Common Alerting Protocol (CAP v1.2) XML
    compatible with NDMA SACHET disaster warning gateway.
    """
    timestamp_utc = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    expires_utc = (datetime.datetime.utcnow() + datetime.timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    severity_map = {
        "SAFE": ("Minor", "Unlikely"),
        "MODERATE": ("Moderate", "Possible"),
        "SEVERE": ("Severe", "Likely"),
        "EXTREME": ("Extreme", "Observed")
    }
    severity, certainty = severity_map.get(tier, ("Moderate", "Possible"))
    
    instruction_text = " ".join(instructions)
    
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>SACHET-TG-{alert_id}</identifier>
  <sender>imd-ndma-thermalguard-system@gov.in</sender>
  <sent>{timestamp_utc}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>IMD_HEATWAVE_SURVEILLANCE_2026</code>
  <info>
    <category>Met</category>
    <category>Health</category>
    <event>Extreme Human Thermal Stress - {tier}</event>
    <urgency>Expected</urgency>
    <severity>{severity}</severity>
    <certainty>{certainty}</certainty>
    <eventCode>
      <valueName>IMD_LEVEL</valueName>
      <value>{metrics.get('imd_color_code', 'ORANGE')}</value>
    </eventCode>
    <expires>{expires_utc}</expires>
    <headline>ThermalGuard Heat Warning for {ward_name}, {city}</headline>
    <description>Universal Thermal Climate Index (UTCI) reached {metrics.get('utci_c')}C and Wet Bulb Globe Temp (WBGT) reached {metrics.get('wbgt_outdoor_c')}C. Health Risk Score: {risk_score}/100.</description>
    <instruction>{instruction_text}</instruction>
    <area>
      <areaDesc>{ward_name}, {city}</areaDesc>
    </area>
  </info>
</alert>"""
    return xml

def get_role_specific_advisories(tier: str, ward_name: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Tailors guidance for 5 key stakeholder roles:
    1. Citizens & Households
    2. ASHA & Community Health Workers
    3. Outdoor Workers & Gig Employers
    4. Hospitals & Primary Health Centers
    5. Municipal Authorities & Power Utilities
    """
    wbgt = metrics.get("wbgt_outdoor_c", 30.0)
    utci = metrics.get("utci_c", 38.0)
    
    if tier == "EXTREME":
        return {
            "citizens": {
                "title": "General Public & Vulnerable Families",
                "badge": "Life Safety Alert",
                "actions": [
                    "STAY INDOORS: Keep windows closed during hottest daylight hours (10 AM - 6 PM); open for cross-ventilation at night.",
                    "Active cooling: Take cool sponge baths or showers; place damp towels on neck and forehead.",
                    "Hydration: Drink ORS, coconut water, or buttermilk every 45 minutes even without thirst.",
                    f"Vulnerable check: Verify health of elderly family members twice daily. Watch for confusion, slurred speech, or cessation of sweating."
                ]
            },
            "asha_workers": {
                "title": "ASHA & Community Healthcare Workers",
                "badge": "Door-to-Door Triage",
                "actions": [
                    f"Immediate home visits for all high-risk pregnant women, bedridden elderly, and infant homes in {ward_name}.",
                    "Replenish and distribute Oral Rehydration Salts (ORS) packets and zinc sachets at Anganwadi centers.",
                    "Symptom triage: If body temperature > 103F with dry hot skin, initiate immediate cold sponge cooling and call 108 emergency ambulance.",
                    "Log high-vulnerability informal households in the mobile surveillance register."
                ]
            },
            "outdoor_workers": {
                "title": "Employers, Gig Delivery & Construction",
                "badge": "Mandatory Work Stop",
                "actions": [
                    f"STRICT HALT of unshaded outdoor manual labor between 11:30 AM and 4:30 PM (WBGT {wbgt}C exceeds ISO 7243 safe work limit).",
                    "For essential shaded shifts: enforce 15 minutes of work followed by 45 minutes of rest under forced shade.",
                    "Provide free potable drinking water with electrolytes (minimum 1 liter per worker per hour).",
                    "Delivery platforms: pause rider non-priority deliveries during peak afternoon spike."
                ]
            },
            "hospitals": {
                "title": "Hospitals & Emergency Medical Facilities",
                "badge": "Surge Response Active",
                "actions": [
                    "Activate Heat Stroke Rapid Cooling Unit (prepare ice-water immersion troughs and cold saline bags).",
                    "Surge staffing: Reassign ER nurses and emergency doctors to thermal triage desk.",
                    "Monitor core temperature via rectal/tympanic probes for patients presenting with altered mental state.",
                    "Ensure backup generator fuel reserves for continuous ward air-conditioning."
                ]
            },
            "municipal_utilities": {
                "title": "Municipal Corporation & Power Discoms",
                "badge": "Emergency Deployment",
                "actions": [
                    f"Open all designated air-conditioned municipal cooling centers in {ward_name} with drinking water kiosks.",
                    "Dispatch emergency pressurized misting water tankers to major traffic junctions and bus terminals.",
                    "Power Discom: Activate cooling demand contingency plan; prioritize feeder lines serving tertiary hospitals.",
                    "Suspend non-essential grid maintenance to avoid power disruptions during peak AC load."
                ]
            }
        }
    elif tier == "SEVERE":
        return {
            "citizens": {
                "title": "General Public & Vulnerable Families",
                "badge": "Severe Advisory",
                "actions": [
                    "Avoid going outside between 12:00 PM and 4:00 PM unless absolutely necessary.",
                    "Wear lightweight, loose-fitting, light-colored cotton garments and wide-brimmed hats.",
                    "Increase fluid intake; avoid caffeinated, alcoholic, and sugary carbonated beverages.",
                    "Check on solitary elderly neighbors and ensure they have adequate fan ventilation."
                ]
            },
            "asha_workers": {
                "title": "ASHA & Community Healthcare Workers",
                "badge": "Surveillance Check",
                "actions": [
                    "Conduct health awareness rounds at local community water taps and ration distribution shops.",
                    "Distribute ORS packets to households with chronic hypertension, diabetes, or kidney patients.",
                    "Coordinate with nearest Primary Health Center (PHC) to verify ice-pack and IV fluid inventory."
                ]
            },
            "outdoor_workers": {
                "title": "Employers, Gig Delivery & Construction",
                "badge": "Work-Rest Regulation",
                "actions": [
                    f"Enforce 30-minute work and 30-minute rest cycles in shaded areas (Current WBGT: {wbgt}C).",
                    "Mandate shift re-scheduling: Begin outdoor shifts earlier (6:00 AM - 11:00 AM) and resume post 4:30 PM.",
                    "Ensure on-site first aid kits are stocked with instant cold packs and electrolyte powder."
                ]
            },
            "hospitals": {
                "title": "Hospitals & Emergency Medical Facilities",
                "badge": "Amber Alert Readiness",
                "actions": [
                    "Set aside 15 dedicated Heat-Related Illness beds in the emergency observation ward.",
                    "Ensure minimum 500 units of normal saline (0.9% NaCl) and Ringer Lactate in pharmacy reserves.",
                    "Log daily heat exhaustion cases in the NCDC surveillance portal."
                ]
            },
            "municipal_utilities": {
                "title": "Municipal Corporation & Power Discoms",
                "badge": "Civic Support",
                "actions": [
                    "Extend opening hours of public libraries and civic community halls as daytime cooling centers.",
                    "Water department: increase municipal supply pressure in high-density informal colonies.",
                    "Electrical utility: Monitor transformer temperatures in commercial and industrial clusters."
                ]
            }
        }
    elif tier == "MODERATE":
        return {
            "citizens": {
                "title": "General Public & Vulnerable Families",
                "badge": "Moderate Caution",
                "actions": [
                    "Carry a water bottle and umbrella or cap when commuting outdoors.",
                    "Plan strenuous physical exercise or sports before 9:00 AM or after 5:30 PM.",
                    "Ensure children stay hydrated during school play hours."
                ]
            },
            "asha_workers": {
                "title": "ASHA & Community Healthcare Workers",
                "badge": "Routine Monitoring",
                "actions": [
                    "Broadcast heat hygiene tips during weekly mother and child health (MCH) clinic sessions.",
                    "Remind pregnant mothers to increase daily fluid intake and rest during midday."
                ]
            },
            "outdoor_workers": {
                "title": "Employers, Gig Delivery & Construction",
                "badge": "Hydration Reminder",
                "actions": [
                    "Provide accessible cool drinking water stations on all job sites.",
                    "Allow short 10-minute shade breaks every 90 minutes of continuous labor."
                ]
            },
            "hospitals": {
                "title": "Hospitals & Emergency Medical Facilities",
                "badge": "Standard Vigilance",
                "actions": [
                    "Ensure normal stock of oral rehydration supplies.",
                    "Review heat exhaustion clinical protocols with ER duty medical officers."
                ]
            },
            "municipal_utilities": {
                "title": "Municipal Corporation & Power Discoms",
                "badge": "Infrastructure Watch",
                "actions": [
                    "Inspect roadside public drinking water fountains (Pyaaus).",
                    "Conduct preventive checks on distribution transformers ahead of projected peak load."
                ]
            }
        }
    else: # SAFE
        return {
            "citizens": {
                "title": "General Public & Vulnerable Families",
                "badge": "Normal Conditions",
                "actions": [
                    "Maintain normal daily hydration (2 to 2.5 liters daily).",
                    "No heat-related movement restrictions in effect.",
                    "Enjoy outdoor recreational activities safely."
                ]
            },
            "asha_workers": {
                "title": "ASHA & Community Healthcare Workers",
                "badge": "Standard Health",
                "actions": [
                    "Routine community health services and immunization drives."
                ]
            },
            "outdoor_workers": {
                "title": "Employers, Gig Delivery & Construction",
                "badge": "Standard Schedule",
                "actions": [
                    "Regular work shifts with standard occupational safety practices."
                ]
            },
            "hospitals": {
                "title": "Hospitals & Emergency Medical Facilities",
                "badge": "Normal Operations",
                "actions": [
                    "Standard triage protocols."
                ]
            },
            "municipal_utilities": {
                "title": "Municipal Corporation & Power Discoms",
                "badge": "Normal Grid",
                "actions": [
                    "Routine operations and power grid dispatch."
                ]
            }
        }

def build_twilio_sms_payload(to_phone: str, ward_name: str, tier: str, risk_score: float, immediate_action: str) -> Dict[str, Any]:
    """
    Simulates Twilio SMS payload.
    """
    message_body = f"[ThermalGuard Alert: {tier}] For {ward_name}: Thermal Stress Risk is {risk_score}/100. Action: {immediate_action} Dial 108 for emergency."
    return {
        "channel": "Twilio SMS",
        "to": to_phone,
        "from": "+1844HEATGRD",
        "body": message_body,
        "char_count": len(message_body),
        "status": "QUEUED_FOR_DISPATCH",
        "timestamp": datetime.datetime.now().isoformat()
    }

def build_whatsapp_business_payload(to_phone: str, ward_name: str, tier: str, metrics: Dict[str, Any], immediate_action: str) -> Dict[str, Any]:
    """
    Simulates Meta WhatsApp Business API interactive template message.
    """
    return {
        "channel": "WhatsApp Business API",
        "to": to_phone,
        "template_name": "thermalguard_heatwave_warning_v2",
        "language": {"code": "en_IN"},
        "components": [
            {
                "type": "header",
                "parameters": [{"type": "text", "text": f"🚨 ThermalGuard Warning: {tier} Level"}]
            },
            {
                "type": "body",
                "parameters": [
                    {"type": "text", "text": ward_name},
                    {"type": "text", "text": f"{metrics.get('wbgt_outdoor_c')}°C"},
                    {"type": "text", "text": f"{metrics.get('utci_c')}°C"},
                    {"type": "text", "text": immediate_action}
                ]
            },
            {
                "type": "button",
                "sub_type": "quick_reply",
                "index": "0",
                "parameters": [{"type": "payload", "payload": "FIND_NEAREST_COOLING_CENTER"}]
            }
        ],
        "status": "DELIVERED",
        "timestamp": datetime.datetime.now().isoformat()
    }

def build_fast2sms_payload(to_phone: str, ward_name: str, tier: str, immediate_action: str) -> Dict[str, Any]:
    """
    Simulates Fast2SMS Indian DLT-compliant SMS payload.
    """
    return {
        "channel": "Fast2SMS India",
        "route": "dlt",
        "sender_id": "THMGRD",
        "message": f"ALERT: Heat level {tier} in {ward_name}. {immediate_action} Stay Safe - ThermalGuard NDMA",
        "numbers": to_phone,
        "flash": 0 if tier != "EXTREME" else 1,
        "status": "SENT_VIA_TRAI_GATEWAY",
        "timestamp": datetime.datetime.now().isoformat()
    }
