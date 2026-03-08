{
  "organization": {
    "name": "Fremantle Rebels",
    "global_email": "<CLUB_EMAIL>"
  },
  "venues": [
    {
      "id": "strickland_d1",
      "name": "Shirley Strickland Reserve - Diamond 1",
      "type": "Home Ground",
      "description": "Main diamond usually top division game. Viewable from clubrooms.",
      "backnet_type": "Large 3 panel temporary portable backnet",
      "home_run_fence": true,
      "has_240v_power": false,
      "recommended_setup": "3_camera_cf",
      "alternate_setup": "2_camera"
    },
    {
      "id": "strickland_d2",
      "name": "Shirley Strickland Reserve - Diamond 2",
      "type": "Home Ground",
      "description": "Secondary diamond used for lower divisions and juniors.",
      "backnet_type": "Medium 3 panel temporary portable backnet",
      "home_run_fence": true,
      "has_240v_power": false,
      "recommended_setup": "2_camera",
      "alternate_setup": "3_camera_nocf"
    },
    {
      "id": "softball_wa_1_2",
      "name": "Softball WA - Diamond 1 & 2",
      "type": "Away Ground",
      "description": "Main prime diamond always used for grand finals.",
      "backnet_type": "Permanent large backnet- rope style netting",
      "home_run_fence": true,
      "has_240v_power": true,
      "recommended_setup": "3_camera_cf"
    },
    {
      "id": "softball_wa_3_4",
      "name": "Softball WA - Diamond 3 & 4",
      "type": "Away Ground",
      "description": "Lowest graded diamonds. Grass infield and gravel cutouts.",
      "backnet_type": "Permanent large backnet-chain link netting",
      "home_run_fence": true,
      "has_240v_power": false,
      "recommended_setup": "2_camera"
    },
    {
      "id": "semsa_1",
      "name": "SEMSA - Diamond 1",
      "type": "Away Ground",
      "description": "Main diamond used for high graded teams and finals.",
      "backnet_type": "Permanent large backnet-chain link netting",
      "home_run_fence": false,
      "has_240v_power": false,
      "recommended_setup": "2_camera"
    }
  ],
  "setups": [
    {
      "id": "1_camera",
      "name": "1 Camera System",
      "camera_placement": "Either side of the backnet facing towards the pitcher and also showing the batter",
      "staffing": {
        "setup": 2,
        "operating": 1,
        "score": 1
      },
      "equipment_counts": {
        "vm46_camera": 1,
        "vm33_camera": 0,
        "be3600_wifi": 1,
        "axt1800_wifi": 0,
        "modem": 1,
        "tablet": 1,
        "phone": 1,
        "tripod": 1,
        "powerbank": 2,
        "solar_panel": 0,
        "usb_leads": 1,
        "microphone": 0
      }
    },
    {
      "id": "2_camera",
      "name": "2 Camera System",
      "camera_placement": "1 cam on the side of the backnet facing pitcher. The other cam on the other side with a wider shot of the outfield and 1st base.",
      "staffing": {
        "setup": 2,
        "operating": 1,
        "score": 1
      },
      "equipment_counts": {
        "vm46_camera": 2,
        "vm33_camera": 0,
        "be3600_wifi": 1,
        "axt1800_wifi": 0,
        "modem": 1,
        "tablet": 1,
        "phone": 1,
        "tripod": 2,
        "powerbank": 3,
        "solar_panel": 0,
        "usb_leads": 1,
        "microphone": 1
      }
    },
    {
      "id": "3_camera_nocf",
      "name": "3 Camera (No Centerfield)",
      "camera_placement": "1 cam facing pitcher. 1 cam on 1st base line. 1 cam on 3rd base line showing infield and wider out to right field.",
      "staffing": {
        "setup": 3,
        "operating": 2,
        "score": 1
      },
      "equipment_counts": {
        "vm46_camera": 2,
        "vm33_camera": 1,
        "be3600_wifi": 1,
        "axt1800_wifi": 1,
        "modem": 1,
        "tablet": 1,
        "phone": 1,
        "tripod": 3,
        "powerbank": 3,
        "solar_panel": 1,
        "usb_leads": 2,
        "microphone": 2
      }
    },
    {
      "id": "3_camera_cf",
      "name": "3 Camera PRO (With Centerfield)",
      "camera_placement": "1 cam facing pitcher. 1 cam on first base line. 1 cam at centerfield with pitcher and catcher in same shot.",
      "staffing": {
        "setup": 3,
        "operating": 2,
        "score": 1
      },
      "equipment_counts": {
        "vm46_camera": 2,
        "vm33_camera": 1,
        "be3600_wifi": 1,
        "axt1800_wifi": 1,
        "modem": 1,
        "tablet": 1,
        "phone": 1,
        "tripod": 3,
        "powerbank": 3,
        "solar_panel": 1,
        "usb_leads": 2,
        "microphone": 2
      }
    }
  ],
  "equipment_inventory": [
    {
      "brand": "GL-INET",
      "model": "<ROUTER1_MODEL>",
      "description": "Slate AX Wi-Fi 6 Router",
      "mac_address": "<ROUTER1_MAC>",
      "serial_number": "<ROUTER1_SN>",
      "device_id": "<ROUTER1_ID>"
    },
    {
      "brand": "GL-INET",
      "model": "<ROUTER2_MODEL>",
      "description": "Slate 7 Dual-band Wi-Fi 7 Router",
      "mac_address": "<ROUTER2_MAC>",
      "serial_number": "<ROUTER2_SN>",
      "device_id": "<ROUTER2_ID>"
    },
    {
      "brand": "NEARSTREAM",
      "model": "<CAM1_MODEL>",
      "description": "2k camera",
      "mac_address": "<CAM1_MAC>",
      "serial_number": "<CAM1_SN>"
    },
    {
      "brand": "NEARSTREAM",
      "model": "<CAM2_MODEL>",
      "description": "4k camera",
      "mac_address": "<CAM2_MAC>",
      "serial_number": "<CAM2_SN>"
    },
    {
      "brand": "NEARSTREAM",
      "model": "<CAM3_MODEL>",
      "description": "4k camera",
      "mac_address": "<CAM3_MAC>",
      "serial_number": "<CAM3_SN>"
    },
    {
      "brand": "NETGEAR",
      "model": "<MODEM_MODEL>",
      "description": "Nighthawk 5g Modem",
      "mac_address": "<MODEM_MAC>",
      "imei": "<MODEM_IMEI>"
    },
    {
      "brand": "NETGEAR",
      "model": "6000451",
      "description": "Mimo Antenna"
    },
    {
      "brand": "NEEWER",
      "model": "N284+GO",
      "description": "Tripod 79 inch Aluminum"
    },
    {
      "brand": "NEEWER",
      "model": "N284L+GO",
      "description": "Tripod 79 inch Aluminum"
    },
    {
      "brand": "NEEWER",
      "model": "SAB264",
      "description": "Tripod 70 inch Aluminum"
    },
    {
      "brand": "UGREEN",
      "description": "USB Cables TWIN PACK 2MT"
    },
    {
      "brand": "UGREEN",
      "description": "USB Cables TWIN PACK 2MT"
    },
    {
      "brand": "MISC",
      "description": "USB Cables AND CHARGERS"
    },
    {
      "brand": "NOVOO",
      "model": "B0BWDSHWPS",
      "description": "USB C Hub 8-in-1"
    },
    {
      "brand": "SAMSUNG",
      "model": "S10 Ultra",
      "description": "Tablet"
    },
    {
      "brand": "SMALLRIG",
      "model": "3468",
      "description": "Shotgun Microphone with Shock Mount"
    },
    {
      "brand": "SMALLRIG",
      "model": "3468",
      "description": "Shotgun Microphone with Shock Mount"
    },
    {
      "brand": "UGREEN",
      "model": "20000mAh",
      "description": "100W Power Bank USB C 3-Port PD3.0"
    },
    {
      "brand": "INIU",
      "model": "10000mAh",
      "description": "22.5W Power Bank Slim USB C"
    },
    {
      "brand": "INIU",
      "model": "10000mAh",
      "description": "22.5W Power Bank Slim USB C"
    },
    {
      "brand": "PROJECTA",
      "model": "PP15",
      "description": "Powerbank/SOLAR"
    },
    {
      "brand": "TOOLPRO",
      "model": "326045",
      "description": "Safe Case Large Black 460x360x175mm"
    },
    {
      "brand": "NEEWER",
      "description": "CAMERA CLAMP"
    }
  ]
}