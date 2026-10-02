"""
ThermalGuard Risk Analyst Review & System Feedback Store
Manages:
1. AI Risk Engine 'Output for Review' queue
2. Human-in-the-loop Risk Analyst reviews, threshold calibration & approvals
3. Dispatched alert broadcast logs
4. System Feedback & Improvement loop (ground truth hospital admissions validation)
"""

import uuid
import datetime
from typing import Dict, Any, List, Optional

class AnalystStore:
    def __init__(self):
        self.pending_reviews: List[Dict[str, Any]] = []
        self.approved_broadcasts: List[Dict[str, Any]] = []
        self.feedback_logs: List[Dict[str, Any]] = []
        self._initialize_seed_data()
        
    def _initialize_seed_data(self):
        # Seed an active pending review for the risk analyst to interact with immediately
        review_id = "REV-2026-10-02-001"
        self.pending_reviews.append({
            "id": review_id,
            "city": "Delhi NCR",
            "ward_id": "DEL_03",
            "ward_name": "Okhla Industrial Area",
            "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "ai_tier": "EXTREME",
            "ai_risk_score": 86.4,
            "predicted_surge_pct": 102.5,
            "metrics": {
                "temp_max_c": 46.5,
                "rel_humidity_pct": 34.0,
                "wbgt_outdoor_c": 33.2,
                "utci_c": 44.8,
                "heat_index_c": 49.2,
                "imd_color_code": "RED",
                "imd_category": "SEVERE HEATWAVE"
            },
            "status": "AWAITING_ANALYST_APPROVAL",
            "analyst_notes": "Surrogate model flags high outdoor workforce vulnerability (52%) and extreme tin-roof heat traps. Verification recommended.",
            "recommended_channels": ["WhatsApp Business API", "Fast2SMS India", "SACHET NDMA CAP XML", "IVR Call Broadcast"]
        })
        
        # Seed an approved broadcast
        self.approved_broadcasts.append({
            "id": "BC-DEL-01-APPROVED",
            "city": "Delhi NCR",
            "ward_name": "Chandni Chowk / Old Delhi",
            "tier": "SEVERE",
            "risk_score": 78.5,
            "approved_by": "Dr. R. K. Sharma (Senior Agromet & Public Health Analyst)",
            "approved_at": (datetime.datetime.now() - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
            "dispatched_recipients": 18450,
            "channels_used": ["SMS", "WhatsApp", "Municipal Kiosks"]
        })
        
        # Seed system feedback loop
        self.feedback_logs.append({
            "event_date": "2026-05-18",
            "ward_name": "Danilimda / Ahmedabad",
            "predicted_surge_pct": 75.0,
            "actual_hospital_surge_pct": 78.2,
            "accuracy_pct": 95.9,
            "model_loss": 0.041,
            "calibrated_status": "CONVERGED"
        })

    def get_pending_queue(self) -> List[Dict[str, Any]]:
        return self.pending_reviews

    def get_approved_broadcasts(self) -> List[Dict[str, Any]]:
        return self.approved_broadcasts

    def get_feedback_logs(self) -> List[Dict[str, Any]]:
        return self.feedback_logs

    def add_pending_forecast(self, review_data: Dict[str, Any]) -> str:
        review_id = f"REV-{str(uuid.uuid4())[:8].upper()}"
        review_data["id"] = review_id
        review_data["created_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        review_data["status"] = "AWAITING_ANALYST_APPROVAL"
        self.pending_reviews.insert(0, review_data)
        return review_id

    def approve_forecast(self, review_id: str, analyst_name: str, calibrated_tier: Optional[str] = None, notes: str = "") -> Optional[Dict[str, Any]]:
        target = None
        for item in self.pending_reviews:
            if item["id"] == review_id:
                target = item
                break
                
        if not target:
            return None
            
        self.pending_reviews.remove(target)
        tier = calibrated_tier if calibrated_tier else target.get("ai_tier", "MODERATE")
        
        approved_record = {
            "id": f"BC-{str(uuid.uuid4())[:8].upper()}",
            "review_id": review_id,
            "city": target.get("city", "National"),
            "ward_name": target.get("ward_name", "All Wards"),
            "tier": tier,
            "risk_score": target.get("ai_risk_score", 65.0),
            "approved_by": analyst_name or "Certified Agrometeorologist Analyst",
            "approved_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "analyst_notes": notes,
            "status": "DISPATCHED_TO_END_USERS",
            "channels_used": ["Fast2SMS", "WhatsApp Business", "NDMA SACHET", "ASHA Mobile Network"]
        }
        self.approved_broadcasts.insert(0, approved_record)
        return approved_record

    def log_feedback(self, ward_name: str, predicted_surge: float, actual_surge: float, notes: str = "") -> Dict[str, Any]:
        """
        System Feedback & Improvement loop.
        Calculates error residual and records learning data to fine-tune AI model.
        """
        error = abs(predicted_surge - actual_surge)
        accuracy = max(0.0, 100.0 - (error / max(1.0, actual_surge) * 100.0))
        entry = {
            "event_date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "ward_name": ward_name,
            "predicted_surge_pct": round(predicted_surge, 1),
            "actual_hospital_surge_pct": round(actual_surge, 1),
            "accuracy_pct": round(accuracy, 1),
            "model_loss": round(error / 100.0, 4),
            "calibrated_status": "CALIBRATED_INTO_PIPELINE",
            "notes": notes
        }
        self.feedback_logs.insert(0, entry)
        return entry

# Global singleton
analyst_store = AnalystStore()
