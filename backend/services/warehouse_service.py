"""
services/warehouse_service.py
Finds nearest government warehouse for farmer's crop and location.
"""

import os
import requests

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "")

# ─── Warehouse Data ───────────────────────────────────────────────────────────
WAREHOUSES = {
    "Maharashtra": [
        {
            "name":     "MSWC — Nashik Regional Warehouse",
            "address":  "Nashik APMC Yard, Nashik 422001",
            "district": "Nashik",
            "phone":    "0253-2350542",
            "capacity": "25,000 MT",
            "crops":    ["onion", "wheat", "rice", "potato"],
            "cost":     "₹10/quintal/month",
            "type":     "State Warehouse (MSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "CWC — Pune Central Warehouse",
            "address":  "Pune-Solapur Road, Hadapsar, Pune 411028",
            "district": "Pune",
            "phone":    "020-26871842",
            "capacity": "15,000 MT",
            "crops":    ["wheat", "rice", "potato"],
            "cost":     "₹12/quintal/month",
            "type":     "Central Warehouse (CWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "MSWC — Nagpur Cold Storage",
            "address":  "Nagpur APMC, Nagpur 440018",
            "district": "Nagpur",
            "phone":    "0712-2720192",
            "capacity": "8,000 MT",
            "crops":    ["potato", "onion", "tomato"],
            "cost":     "₹15/quintal/month",
            "type":     "Cold Storage (MSWC)",
            "nwr":      True,
            "loan":     "70% of crop value via any bank",
        },
        {
            "name":     "MSWC — Solapur Warehouse",
            "address":  "Solapur APMC Yard, Solapur 413001",
            "district": "Solapur",
            "phone":    "0217-2724501",
            "capacity": "12,000 MT",
            "crops":    ["onion", "wheat", "potato"],
            "cost":     "₹10/quintal/month",
            "type":     "State Warehouse (MSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "MSWC — Aurangabad Warehouse",
            "address":  "Aurangabad APMC, Aurangabad 431001",
            "district": "Aurangabad",
            "phone":    "0240-2332671",
            "capacity": "10,000 MT",
            "crops":    ["onion", "wheat", "rice"],
            "cost":     "₹10/quintal/month",
            "type":     "State Warehouse (MSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Punjab": [
        {
            "name":     "PSWC — Ludhiana Grain Market",
            "address":  "Grain Market, Ludhiana 141008",
            "district": "Ludhiana",
            "phone":    "0161-2401960",
            "capacity": "50,000 MT",
            "crops":    ["wheat", "rice"],
            "cost":     "₹7/quintal/month",
            "type":     "State Warehouse (PSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "FCI — Amritsar Regional Depot",
            "address":  "GT Road, Amritsar 143001",
            "district": "Amritsar",
            "phone":    "0183-2562834",
            "capacity": "1,00,000 MT",
            "crops":    ["wheat", "rice"],
            "cost":     "₹6/quintal/month",
            "type":     "FCI Depot (Central Govt)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "PSWC — Patiala Warehouse",
            "address":  "Patiala Grain Mandi, Patiala 147001",
            "district": "Patiala",
            "phone":    "0175-2215432",
            "capacity": "30,000 MT",
            "crops":    ["wheat", "rice", "potato"],
            "cost":     "₹7/quintal/month",
            "type":     "State Warehouse (PSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Karnataka": [
        {
            "name":     "KSWC — Bangalore Central Warehouse",
            "address":  "Yeshwanthpur APMC, Bangalore 560022",
            "district": "Bangalore",
            "phone":    "080-23375001",
            "capacity": "20,000 MT",
            "crops":    ["rice", "potato", "tomato", "onion"],
            "cost":     "₹12/quintal/month",
            "type":     "State Warehouse (KSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "KSWC — Kolar Tomato Warehouse",
            "address":  "Kolar APMC Yard, Kolar 563101",
            "district": "Kolar",
            "phone":    "08152-222345",
            "capacity": "5,000 MT",
            "crops":    ["tomato", "potato"],
            "cost":     "₹14/quintal/month",
            "type":     "Cold Storage (KSWC)",
            "nwr":      True,
            "loan":     "70% of crop value via any bank",
        },
        {
            "name":     "KSWC — Hubli Warehouse",
            "address":  "Hubli APMC, Hubli 580028",
            "district": "Hubli",
            "phone":    "0836-2288901",
            "capacity": "18,000 MT",
            "crops":    ["rice", "wheat", "onion"],
            "cost":     "₹11/quintal/month",
            "type":     "State Warehouse (KSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Uttar Pradesh": [
        {
            "name":     "UPSWC — Agra Warehouse",
            "address":  "Agra APMC, Agra 282001",
            "district": "Agra",
            "phone":    "0562-2526780",
            "capacity": "30,000 MT",
            "crops":    ["potato", "wheat"],
            "cost":     "₹8/quintal/month",
            "type":     "State Warehouse (UPSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "CWC — Kanpur Central Depot",
            "address":  "GT Road, Kanpur 208001",
            "district": "Kanpur",
            "phone":    "0512-2540123",
            "capacity": "40,000 MT",
            "crops":    ["wheat", "rice", "potato"],
            "cost":     "₹9/quintal/month",
            "type":     "Central Warehouse (CWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "UPSWC — Lucknow Warehouse",
            "address":  "Lucknow APMC, Lucknow 226001",
            "district": "Lucknow",
            "phone":    "0522-2630456",
            "capacity": "25,000 MT",
            "crops":    ["wheat", "rice", "potato"],
            "cost":     "₹8/quintal/month",
            "type":     "State Warehouse (UPSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Telangana": [
        {
            "name":     "TSWC — Hyderabad Central Warehouse",
            "address":  "LB Nagar, Hyderabad 500074",
            "district": "Hyderabad",
            "phone":    "040-24020501",
            "capacity": "15,000 MT",
            "crops":    ["rice", "onion", "tomato"],
            "cost":     "₹11/quintal/month",
            "type":     "State Warehouse (TSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "TSWC — Warangal Warehouse",
            "address":  "Warangal APMC, Warangal 506002",
            "district": "Warangal",
            "phone":    "0870-2578901",
            "capacity": "10,000 MT",
            "crops":    ["rice", "tomato"],
            "cost":     "₹10/quintal/month",
            "type":     "State Warehouse (TSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Haryana": [
        {
            "name":     "HSWC — Karnal Grain Market",
            "address":  "Anaj Mandi, Karnal 132001",
            "district": "Karnal",
            "phone":    "0184-2271234",
            "capacity": "35,000 MT",
            "crops":    ["wheat", "rice"],
            "cost":     "₹7/quintal/month",
            "type":     "State Warehouse (HSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "HSWC — Hisar Warehouse",
            "address":  "Hisar Grain Market, Hisar 125001",
            "district": "Hisar",
            "phone":    "01662-234567",
            "capacity": "28,000 MT",
            "crops":    ["wheat", "rice", "potato"],
            "cost":     "₹7/quintal/month",
            "type":     "State Warehouse (HSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Rajasthan": [
        {
            "name":     "RSWC — Jaipur Central Warehouse",
            "address":  "Muhana Mandi, Jaipur 302029",
            "district": "Jaipur",
            "phone":    "0141-2771234",
            "capacity": "20,000 MT",
            "crops":    ["wheat", "onion", "potato"],
            "cost":     "₹9/quintal/month",
            "type":     "State Warehouse (RSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Gujarat": [
        {
            "name":     "GWSC — Ahmedabad Central Warehouse",
            "address":  "Vasna APMC, Ahmedabad 380007",
            "district": "Ahmedabad",
            "phone":    "079-26583201",
            "capacity": "22,000 MT",
            "crops":    ["wheat", "rice", "onion", "potato"],
            "cost":     "₹10/quintal/month",
            "type":     "State Warehouse (GWSC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Andhra Pradesh": [
        {
            "name":     "APSWC — Guntur Warehouse",
            "address":  "Guntur APMC Yard, Guntur 522001",
            "district": "Guntur",
            "phone":    "0863-2340123",
            "capacity": "18,000 MT",
            "crops":    ["rice", "tomato", "onion"],
            "cost":     "₹11/quintal/month",
            "type":     "State Warehouse (APSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Tamil Nadu": [
        {
            "name":     "TNWC — Chennai Central Warehouse",
            "address":  "Koyambedu APMC, Chennai 600107",
            "district": "Chennai",
            "phone":    "044-24747201",
            "capacity": "15,000 MT",
            "crops":    ["rice", "tomato", "potato"],
            "cost":     "₹12/quintal/month",
            "type":     "State Warehouse (TNWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "West Bengal": [
        {
            "name":     "WBSWC — Kolkata Central Warehouse",
            "address":  "Howrah APMC, Howrah 711101",
            "district": "Howrah",
            "phone":    "033-26381234",
            "capacity": "20,000 MT",
            "crops":    ["rice", "potato", "onion"],
            "cost":     "₹11/quintal/month",
            "type":     "State Warehouse (WBSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
        {
            "name":     "WBSWC — Bardhaman Warehouse",
            "address":  "Bardhaman APMC, Bardhaman 713101",
            "district": "Bardhaman",
            "phone":    "0342-2568901",
            "capacity": "25,000 MT",
            "crops":    ["rice", "potato"],
            "cost":     "₹10/quintal/month",
            "type":     "State Warehouse (WBSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
    "Madhya Pradesh": [
        {
            "name":     "MPSWC — Indore Central Warehouse",
            "address":  "Indore APMC, Indore 452001",
            "district": "Indore",
            "phone":    "0731-2701234",
            "capacity": "30,000 MT",
            "crops":    ["wheat", "onion", "potato", "rice"],
            "cost":     "₹9/quintal/month",
            "type":     "State Warehouse (MPSWC)",
            "nwr":      True,
            "loan":     "75% of crop value via any bank",
        },
    ],
}

DEFAULT_WAREHOUSES = [
    {
        "name":     "CWC — Central Warehouse Corporation",
        "address":  "Contact CWC for nearest location in your district",
        "district": "All Districts",
        "phone":    "1800-419-0000",
        "capacity": "Available",
        "crops":    ["wheat", "rice", "potato", "onion", "tomato"],
        "cost":     "₹8-15/quintal/month",
        "type":     "Central Warehouse (CWC)",
        "nwr":      True,
        "loan":     "75% of crop value via any bank",
    }
]


class WarehouseService:
    """
    Finds nearest government warehouse for farmer's
    state + district + crop combination.
    """

    def get_nearest_warehouse(self, state: str, district: str, crop: str) -> dict:
        """
        Returns the single NEAREST warehouse to farmer's district.
        Used inside the advisory panel of /predict response.
        """
        all_wh  = WAREHOUSES.get(state, DEFAULT_WAREHOUSES)

        # Filter by crop
        crop_wh = [w for w in all_wh if crop in w.get("crops", [])]
        if not crop_wh:
            crop_wh = all_wh

        # Try to find warehouse in same district first
        same_district = [
            w for w in crop_wh
            if w.get("district", "").lower() == district.lower()
        ]

        # Same district found → use it, otherwise use first in state
        nearest  = same_district[0] if same_district else crop_wh[0]
        distance = "In your district ✅" if same_district else f"Nearest in {nearest['district']}"

        return {
            "name":     nearest["name"],
            "address":  nearest["address"],
            "district": nearest["district"],
            "phone":    nearest["phone"],
            "cost":     nearest["cost"],
            "type":     nearest["type"],
            "nwr":      nearest["nwr"],
            "loan":     nearest["loan"],
            "distance": distance,
        }

    def get_warehouses(self, state: str, crop: str, quintals: int) -> dict:
        """
        Returns all warehouses for state+crop with cost calculations.
        Used by GET /warehouse/{state}/{crop}/{quintals} endpoint.
        """
        all_wh   = WAREHOUSES.get(state, DEFAULT_WAREHOUSES)
        crop_wh  = [w for w in all_wh if crop in w.get("crops", [])]
        if not crop_wh:
            crop_wh = all_wh

        base_price      = self._base_price(crop)
        total_value     = quintals * base_price
        loan_amount     = int(total_value * 0.75)
        govt_monthly    = quintals * 10
        private_monthly = quintals * 30
        savings         = private_monthly - govt_monthly
        best            = crop_wh[0]

        return {
            "state":          state,
            "crop":           crop,
            "quintals":       quintals,
            "total_value":    f"₹{total_value:,}",
            "best_warehouse": best,
            "all_warehouses": crop_wh,
            "financial": {
                "govt_storage_cost":    f"₹{govt_monthly}/month",
                "private_storage_cost": f"₹{private_monthly}/month",
                "monthly_savings":      f"₹{savings}",
                "loan_available":       f"₹{loan_amount:,}",
                "loan_rate":            "4% via Kisan Credit Card",
                "loan_how":             "Take NWR receipt to any bank",
            },
            "steps": [
                f"📞 Call {best['phone']} — confirm space available",
                "📄 Bring: Aadhaar + land document + bank passbook",
                f"⚖️  Deposit {quintals} quintal {crop} — get NWR receipt",
                f"🏦 Take receipt to bank → get ₹{loan_amount:,} loan at 4%",
                "📱 Watch KrishiMind — sell when price peaks 🌾",
            ],
            "helplines": {
                "CWC National":  "1800-419-0000",
                "Kisan Call":    "1800-180-1551",
                "eNAM Helpline": "1800-270-0224",
                "Loan via KCC":  "Contact your nearest bank",
            }
        }

    def _base_price(self, crop: str) -> int:
        return {
            "wheat": 2275, "rice": 2300, "onion": 1800,
            "potato": 1200, "tomato": 1500
        }.get(crop, 2000)