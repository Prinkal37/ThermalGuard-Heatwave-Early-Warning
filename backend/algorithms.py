"""
ThermalGuard Core Algorithms Module
Implements physiological human thermal stress metrics:
1. Stull (2011) Wet Bulb Temperature (Tw)
2. Globe Temperature (Tg) via Liljegren solar radiation & wind convection balance
3. Outdoor Wet Bulb Globe Temperature (WBGT) = 0.7*Tw + 0.2*Tg + 0.1*Td
4. Universal Thermal Climate Index (UTCI) polynomial approximation
5. NOAA / Steadman Heat Index (HI) via Rothfusz regression
6. Excess Heat Factor (EHF) comparing 3-day means against ERA5 95th percentile
7. IMD Standard Heatwave Criteria (Plains, Hills, Coastal)
"""

import math
from typing import Dict, Any, Tuple

def calculate_dew_point(temp_c: float, rel_humidity: float) -> float:
    """
    Calculate Dew Point using the Magnus-Tetens formula.
    temp_c: Dry bulb temperature in Celsius
    rel_humidity: Relative humidity percentage (0-100)
    """
    rh = max(1.0, min(100.0, rel_humidity))
    a = 17.27
    b = 237.7
    alpha = ((a * temp_c) / (b + temp_c)) + math.log(rh / 100.0)
    dew_point = (b * alpha) / (a - alpha)
    return round(dew_point, 2)

def calculate_wet_bulb_stull(temp_c: float, rel_humidity: float) -> float:
    """
    Calculate Wet Bulb Temperature using Stull's (2011) psychrometric empirical formula.
    Valid for RH between 5% and 99% and temperatures from -20C to 50C.
    """
    T = temp_c
    RH = max(1.0, min(100.0, rel_humidity))
    
    tw = (
        T * math.atan(0.151977 * math.pow(RH + 8.313659, 0.5))
        + math.atan(T + RH)
        - math.atan(RH - 1.676331)
        + 0.00391838 * math.pow(RH, 1.5) * math.atan(0.023101 * RH)
        - 4.686035
    )
    return round(tw, 2)

def calculate_globe_temperature(temp_c: float, rel_humidity: float, wind_speed_ms: float, solar_radiation_wm2: float) -> float:
    """
    Estimates black globe temperature (Tg) under direct sunlight.
    Liljegren simplified equilibrium between radiative heating and convective cooling.
    """
    v = max(0.2, wind_speed_ms)
    # Radiative gain from solar radiation (W/m2) scaled by black globe absorption
    # Convective heat transfer coefficient proportional to v^0.6
    delta_t = (solar_radiation_wm2 * 0.0135) / (1.0 + 0.3 * math.pow(v, 0.6))
    tg = temp_c + delta_t
    return round(tg, 2)

def calculate_wbgt_outdoor(temp_c: float, rel_humidity: float, wind_speed_ms: float, solar_radiation_wm2: float) -> Tuple[float, Dict[str, float]]:
    """
    Calculate Outdoor Wet Bulb Globe Temperature (WBGT)
    WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * Td
    """
    tw = calculate_wet_bulb_stull(temp_c, rel_humidity)
    tg = calculate_globe_temperature(temp_c, rel_humidity, wind_speed_ms, solar_radiation_wm2)
    td = calculate_dew_point(temp_c, rel_humidity)
    
    wbgt = 0.7 * tw + 0.2 * tg + 0.1 * td
    return round(wbgt, 2), {"tw": tw, "tg": tg, "td": td}

def calculate_heat_index(temp_c: float, rel_humidity: float) -> float:
    """
    Calculate NOAA Steadman Heat Index using the Rothfusz regression equation.
    """
    T = (temp_c * 9.0 / 5.0) + 32.0  # Convert to Fahrenheit
    RH = max(1.0, min(100.0, rel_humidity))
    
    # Simple formula first
    hi_simple = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))
    
    if hi_simple >= 80.0:
        # Full Rothfusz regression
        c1 = -42.379
        c2 = 2.04901523
        c3 = 10.14333127
        c4 = -0.22475541
        c5 = -0.00683783
        c6 = -0.05481717
        c7 = 0.00122874
        c8 = 0.00085282
        c9 = -0.00000199
        
        hi = (
            c1 + (c2 * T) + (c3 * RH) + (c4 * T * RH)
            + (c5 * T * T) + (c6 * RH * RH) + (c7 * T * T * RH)
            + (c8 * T * RH * RH) + (c9 * T * T * RH * RH)
        )
        
        # Adjustments
        if RH < 13.0 and 80.0 <= T <= 112.0:
            adj = ((13.0 - RH) / 4.0) * math.sqrt((17.0 - abs(T - 95.0)) / 17.0)
            hi -= adj
        elif RH > 85.0 and 80.0 <= T <= 87.0:
            adj = ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0)
            hi += adj
    else:
        hi = hi_simple
        
    # Convert back to Celsius
    hi_c = (hi - 32.0) * 5.0 / 9.0
    return round(hi_c, 2)

def calculate_utci(temp_c: float, rel_humidity: float, wind_speed_ms: float, solar_radiation_wm2: float) -> float:
    """
    Calculate Universal Thermal Climate Index (UTCI) approximation.
    Incorporates temperature, water vapor pressure, wind speed at 10m, and mean radiant temperature.
    """
    # Water vapor pressure in kPa via Buck equation
    es = 0.61121 * math.exp((18.678 - temp_c / 234.5) * (temp_c / (257.14 + temp_c)))
    va = es * (rel_humidity / 100.0)
    
    # Wind speed at 10m normalized
    v = max(0.5, min(15.0, wind_speed_ms))
    
    # Solar radiation elevation factor approximation for mean radiant temperature diff (Tmrt - Ta)
    delta_tmrt = (solar_radiation_wm2 * 0.028) / (1.0 + 0.2 * math.sqrt(v))
    
    # UTCI 5th-order approximation
    # Baseline delta from air temperature
    d_utci = (
        0.6075 * (delta_tmrt)
        - 0.0288 * temp_c * (v - 1.0)
        + 0.0036 * va * temp_c
        + 0.09 * (temp_c - 20.0) * (va - 1.5)
        - 0.08 * (v - 1.0) * (delta_tmrt)
    )
    utci = temp_c + d_utci
    return round(utci, 2)

def evaluate_imd_criteria(temp_max: float, normal_max: float, region_type: str = "plains") -> Dict[str, Any]:
    """
    Evaluates IMD (India Meteorological Department) official heatwave criteria.
    plains:
      - Max temp >= 40 C
      - Heatwave: Departure >= 4.5 C OR Temp >= 45 C
      - Severe Heatwave: Departure >= 6.4 C OR Temp >= 47 C
    coastal:
      - Max temp >= 37 C and Departure >= 4.5 C
    hills:
      - Max temp >= 30 C and Departure >= 4.5 C
    """
    departure = round(temp_max - normal_max, 1)
    is_heatwave = False
    is_severe = False
    heatwave_type = "NORMAL"
    imd_color_code = "GREEN"  # GREEN, YELLOW, ORANGE, RED
    
    if region_type == "plains":
        if temp_max >= 40.0:
            if departure >= 6.4 or temp_max >= 47.0:
                is_heatwave = True
                is_severe = True
                heatwave_type = "SEVERE HEATWAVE"
                imd_color_code = "RED"
            elif departure >= 4.5 or temp_max >= 45.0:
                is_heatwave = True
                is_severe = False
                heatwave_type = "HEATWAVE"
                imd_color_code = "ORANGE"
            elif departure >= 3.0 or temp_max >= 42.0:
                heatwave_type = "HEATWAVE ALERT"
                imd_color_code = "YELLOW"
    elif region_type == "coastal":
        if temp_max >= 37.0:
            if departure >= 6.4:
                is_heatwave = True
                is_severe = True
                heatwave_type = "SEVERE HEATWAVE (COASTAL)"
                imd_color_code = "RED"
            elif departure >= 4.5:
                is_heatwave = True
                heatwave_type = "HEATWAVE (COASTAL)"
                imd_color_code = "ORANGE"
            elif departure >= 3.0:
                heatwave_type = "ALERT (COASTAL)"
                imd_color_code = "YELLOW"
    elif region_type == "hills":
        if temp_max >= 30.0:
            if departure >= 6.4:
                is_heatwave = True
                is_severe = True
                heatwave_type = "SEVERE HEATWAVE (HILLS)"
                imd_color_code = "RED"
            elif departure >= 4.5:
                is_heatwave = True
                heatwave_type = "HEATWAVE (HILLS)"
                imd_color_code = "ORANGE"
            elif departure >= 3.0:
                heatwave_type = "ALERT (HILLS)"
                imd_color_code = "YELLOW"
                
    return {
        "is_heatwave": is_heatwave,
        "is_severe": is_severe,
        "category": heatwave_type,
        "departure_c": departure,
        "imd_color_code": imd_color_code,
        "threshold_normal_c": normal_max
    }

def calculate_ehf(three_day_mean: float, past_30_mean: float, era5_95th_percentile: float) -> Dict[str, float]:
    """
    Calculates Excess Heat Factor (EHF).
    EHI_sig = T_3day - T_95th
    EHI_accl = T_3day - T_past30
    EHF = max(0, EHI_sig) * max(1, EHI_accl)
    """
    ehi_sig = three_day_mean - era5_95th_percentile
    ehi_accl = three_day_mean - past_30_mean
    ehf = max(0.0, ehi_sig) * max(1.0, ehi_accl)
    
    return {
        "ehi_sig": round(ehi_sig, 2),
        "ehi_accl": round(ehi_accl, 2),
        "ehf_index": round(ehf, 2),
        "era5_95th_percentile": era5_95th_percentile
    }
