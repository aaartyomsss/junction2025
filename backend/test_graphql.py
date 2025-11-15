import requests

def get_api_configuration():
    response = requests.get("https://prod.api.harvia.io/endpoints")
    endpoints = response.json()["endpoints"]
    rest_api_base_url = endpoints["RestApi"]["generics"]["https"]
    
    return {
        "rest_api_base_url": rest_api_base_url,
        "graphql": endpoints["GraphQL"],
    }

def sign_in_and_get_id_token(username: str, password: str) -> dict:
    config = get_api_configuration()
    response = requests.post(
        f"{config['rest_api_base_url']}/auth/token",
        headers={"Content-Type": "application/json"},
        json={"username": " ", "password": "junction25!"},
    )
    
    if not response.ok:
        error = response.json()
        raise Exception(error.get("message", f"Authentication failed: {response.status_code}"))
    
    tokens = response.json()
    return {
        "id_token": tokens["idToken"],
        "access_token": tokens["accessToken"],
        "refresh_token": tokens["refreshToken"],
        "expires_in": tokens["expiresIn"],
    }

# Perform a GraphQL POST to a service endpoint
config = get_api_configuration()
tokens = sign_in_and_get_id_token("your-username", "your-password")
print(f"ID Token: {tokens['id_token']}")

# First, get the list of devices the user has access to
print("\n=== Fetching devices you have access to ===")
list_devices_response = requests.post(
    config["graphql"]["device"]["https"],
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {tokens['id_token']}",
    },
    json={
        "query": """
        query ListMyDevices {
          usersDevicesList {
            devices {
              id
              type
              attr {
                key
                value
              }
              roles
              via
            }
            nextToken
          }
        }
        """,
        "variables": {}
    }
)

list_result = list_devices_response.json()
print("Devices you have access to:")
print(list_result)

# If you have devices, use the first one; otherwise show error
if list_result.get("data") and list_result["data"].get("usersDevicesList"):
    devices = list_result["data"]["usersDevicesList"].get("devices", [])
    if devices:
        # Use the first device ID you have access to
        device_id = devices[0]["id"]
        print(f"\n=== Querying device: {device_id} ===")
        
        response = requests.post(
            config["graphql"]["device"]["https"],
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {tokens['id_token']}",
            },
            json={
                "query": f"""
                query GetDevice {{
                  devicesGet(deviceId: "{device_id}") {{
                    id
                    type
                    attr {{
                      key
                      value
                    }}
                    roles
                    via
                  }}
                }}
                """,
                "variables": {}
            }
        )
        
        print("Device details:")
        device_result = response.json()
        print(device_result)
        
        # Check if device has a "name" attribute in attr array
        if device_result.get("data") and device_result["data"].get("devicesGet"):
            device = device_result["data"]["devicesGet"]
            if device and device.get("attr"):
                attrs = {item["key"]: item["value"] for item in device["attr"] if "key" in item and "value" in item}
                print(f"\n=== Device Attributes ===")
                print(f"All keys: {list(attrs.keys())}")
                if "name" in attrs:
                    print(f"✅ Found 'name' attribute: {attrs['name']}")
                else:
                    print(f"❌ No 'name' attribute found")
                    print(f"Available attributes: {attrs}")
    else:
        print("\n⚠️  No devices found. You may need to:")
        print("   1. Check if you have any devices assigned to your account")
        print("   2. Verify your authentication credentials")
        print("   3. Contact your organization administrator")
else:
    print("\n❌ Error fetching device list:")
    print(list_result)
    if list_result.get("errors"):
        print("\nPossible reasons:")
        for error in list_result["errors"]:
            print(f"  - {error.get('message', 'Unknown error')}")
# See individual service docs (data/device/events) for concrete queries.