Device Service
🚀 Built for: Remote device management, configuration, and over-the-air updates
🔧 Tech Stack: GraphQL, AWS Lambda, AWS IAM, Amazon Cognito
📊 Data Sources: AWS IoT Core, Amazon S3, Amazon SNS

🏷️ Enums
🔧 Commands
Device control commands:

Value	Description	Use Case
ADJUST_DURATION	⏱️ Adjust session duration	Session control
REMAINING_TIME	⏰ Get remaining time	Status queries
AFTER_HEATER	🔥 Control after-heater	Temperature management
EXT_SWITCH	🔌 External switch control	Hardware control
FAN	💨 Fan control	Air circulation
HEATER	🔥 Main heater control	Temperature control
IR_HEATER	🌡️ Infrared heater control	Advanced heating
LIGHTS	💡 Light control	Ambient lighting
RESTART	🔄 Device restart	System control
SAUNA	🧖 Sauna mode control	Main functionality
STEAMER	💨 Steamer control	Steam generation
TRACE_LOG	📝 Enable trace logging	Debugging
UPDATE	🔄 Trigger update	System updates
VAPORIZER	💧 Vaporizer control	Humidity control
🔄 OtaState
OTA update execution states:

Value	Description	Status
IDLE	📋 No update in progress	Ready
IN_PROGRESS	⚡ Update running	Active
DONE	✅ Update completed	Success
CANCELLED	❌ Update cancelled	Failed
☁️ CloudLoggingState
Remote logging configuration states:

Value	Description	Usage
DISABLED	🚫 No remote logging	Default
MANUAL	📝 Manual log collection	On-demand
CONTINUOUS	📊 Continuous logging	Real-time monitoring
🏢 OrganizationUpdate
Device organization membership changes:

Value	Description	Action
ADD	➕ Add device to organization	Join
REMOVE	➖ Remove device from organization	Leave
👁️ VisibleReason
Device access visibility levels:

Value	Description	Access Level
Organization	🏢 Organization member	Org access
Contract	📋 Contract access	Contract access
CanSee	👀 Direct visibility	Direct access
Unknown	❓ Unknown reason	Limited access
🌐 REST API
Note: All REST API endpoints require a Cognito ID token in the Authorization: Bearer <idToken> header. See the API Overview section for authentication setup.

Base URL: Get the REST API base URL from the endpoints configuration: endpoints.RestApi.device.https

📋 GET /devices
Retrieves a paginated list of devices owned by the authenticated user.

Query Parameters:

Parameter	Type	Required	Description
maxResults	number	⚪	Maximum number of results to return
nextToken	string	⚪	Pagination token for continuing from a previous response
Success Response (200):

{
  "devices": [
    {
      "deviceId": "DEVICE-ABC123-XYZ789",
      "type": "sauna",
      "attr": [
        { "key": "name", "value": "Main Sauna" },
        { "key": "location", "value": "Building A" }
      ],
      "roles": ["owner"],
      "via": "Organization"
    }
  ],
  "nextToken": "eyJwYWdlIjoiMiJ9"
}
Error Response:

{
  "error": "string",
  "message": "string"
}
Notes:

Pagination: When nextToken is returned, pass it back to fetch the next page.
Authorization is based on the caller's ID token and service authorization rules.
📤 POST /devices/command
Sends a command to a device and waits for acknowledgement.

Request Body:

Parameter	Type	Required	Description
deviceId	string	✅	The device identifier (AWS IoT Thing Name)
cabin	object	⚪	Cabin selector for the command
cabin.id	string	⚪	Cabin identifier such as C1. Mutually exclusive with cabin.name
cabin.name	string	⚪	Cabin display name as advertised by the device. Mutually exclusive with cabin.id
command	object	✅	Command details
command.type	enum	✅	One of: SAUNA, LIGHTS, FAN
command.state	string|boolean|number	✅	Toggle value; accepts on/off, true/false, or 1/0
Success Response (200):

{
  "handled": true
}
Error Response:

{
  "error": "string",
  "message": "string",
  "handled": false,
  "failureReason": "Device unavailable"
}
Notes:

Persists the command, publishes it to the device, and waits for an acknowledgement.
If the device doesn't respond in time, returns 504 Gateway Timeout with { handled: false, failureReason: "Device unavailable" }.
If neither cabin.id nor cabin.name is provided, cabin.id defaults to C1.
📊 GET /devices/state
Retrieves the current state of a device shadow (named shadow, default depends on device type).

Query Parameters:

Parameter	Type	Required	Description
deviceId	string	✅	Device identifier (AWS IoT Thing Name)
subId	string	⚪	Cabin sub-shadow identifier (e.g., C1, classic). Mutually exclusive with cabinName
cabinName	string	⚪	Friendly cabin name. Mutually exclusive with subId
Success Response (200):

{
  "deviceId": "DEVICE-ABC123-XYZ789",
  "shadowName": "C1",
  "state": {
    "temp": 78,
    "targetHum": 38
  },
  "version": 123,
  "timestamp": 1735689600000,
  "metadata": {
    "state": {}
  },
  "connectionState": {
    "connected": true,
    "updatedTimestamp": 1735689600000
  }
}
Error Response:

{
  "error": "string",
  "message": "string"
}
Notes:

Returns the selected named shadow state (not classic shadow, except for Sauna sensor). The state field contains reported data from the device.
If neither subId nor cabinName is provided:
For most devices (e.g., Fenix), subId defaults to C1
For Sauna sensor devices, defaults to classic shadow
🌡️ PATCH /devices/target
Updates the target temperature and/or humidity for a device cabin.

Request Body:

Parameter	Type	Required	Description
deviceId	string	✅	Device identifier (AWS IoT Thing Name)
temperature	number	⚪	Target temperature to set
humidity	number	⚪	Target humidity to set
cabin	object	⚪	Cabin selector identifying the sub-shadow to update
cabin.id	string	⚪	Cabin identifier such as C1. Mutually exclusive with cabin.name
cabin.name	string	⚪	Cabin display name. Mutually exclusive with cabin.id
Success Response (200):

{
  "deviceId": "DEVICE-ABC123-XYZ789",
  "shadowName": "C1",
  "updated": {
    "temperature": 22,
    "humidity": 50
  }
}
Error Response:

{
  "error": "string",
  "message": "string"
}
Notes:

Supply at least one of temperature or humidity; both can be provided to update together.
If neither cabin.id nor cabin.name is provided, cabin.id defaults to C1.
👤 PATCH /devices/profile
Updates the active profile for a device cabin.

Request Body:

Parameter	Type	Required	Description
deviceId	string	✅	Device identifier (AWS IoT Thing Name)
profile	string	✅	Profile name or identifier as stored in the shadow
cabin	object	⚪	Cabin selector identifying the sub-shadow to update
cabin.id	string	⚪	Cabin identifier such as C1. Mutually exclusive with cabin.name
cabin.name	string	⚪	Cabin display name. Mutually exclusive with cabin.id
Success Response (200):

{
  "deviceId": "DEVICE-ABC123-XYZ789",
  "shadowName": "C1",
  "activeProfile": 2,
  "profile": "eco"
}
Error Response:

{
  "error": "string",
  "message": "string"
}
Notes:

If neither cabin.id nor cabin.name is provided, cabin.id defaults to C1.
💡 REST API Examples
Each example below shows the complete authentication flow. For detailed authentication setup, token refresh, and error handling, see the API Overview section.

🟨 Using JavaScript/fetch
// Get endpoints and authenticate 
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiBase = endpoints.RestApi.device.https;
const restApiGenerics = endpoints.RestApi.generics.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

async function call(method, path, body) {
  const res = await fetch(`${restApiBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

// List user's devices
const devices = await call("GET", `/devices?maxResults=50`);
console.log(devices);

// Send a device command
const commandResult = await call("POST", `/devices/command`, {
  deviceId: "DEVICE-ABC123-XYZ789",
  cabin: { id: "C1" },
  command: { type: "SAUNA", state: "on" },
});
console.log(commandResult);

// Get device state (cabin shadow via subId)
const cabinStateById = await call(
  "GET",
  `/devices/state?deviceId=${encodeURIComponent("DEVICE-ABC123-XYZ789")}&subId=${encodeURIComponent("C1")}`
);
console.log(cabinStateById);

// Update device target values
const updatedTarget = await call("PATCH", `/devices/target`, {
  deviceId: "DEVICE-ABC123-XYZ789",
  cabin: { id: "C1" },
  temperature: 22,
  humidity: 50,
});
console.log(updatedTarget);

// Update active profile
const updatedProfile = await call("PATCH", `/devices/profile`, {
  deviceId: "DEVICE-ABC123-XYZ789",
  cabin: { id: "C1" },
  profile: "eco",
});
console.log(updatedProfile);
🐍 Using Python/requests
import requests

# Get endpoints and authenticate 
response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_base = endpoints["RestApi"]["device"]["https"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]

tokens = requests.post(
    f"{rest_api_generics}/auth/token",
    headers={"Content-Type": "application/json"},
    json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

def call(method, path, body=None):
    res = requests.request(
        method,
        f"{rest_api_base}{path}",
        headers={"Authorization": f"Bearer {id_token}", "Content-Type": "application/json"},
        json=body if body else None
    )
    if not res.ok:
        raise Exception(f"{res.status_code} {res.text}")
    return res.json()

# List user's devices
devices = call("GET", "/devices?maxResults=50")
print(devices)

# Send a device command
command_result = call("POST", "/devices/command", {
    "deviceId": "DEVICE-ABC123-XYZ789",
    "cabin": {"id": "C1"},
    "command": {"type": "SAUNA", "state": "on"}
})
print(command_result)

# Get device state
cabin_state = call("GET", "/devices/state?deviceId=DEVICE-ABC123-XYZ789&subId=C1")
print(cabin_state)

# Update device target values
updated_target = call("PATCH", "/devices/target", {
    "deviceId": "DEVICE-ABC123-XYZ789",
    "cabin": {"id": "C1"},
    "temperature": 22,
    "humidity": 50
})
print(updated_target)

# Update active profile
updated_profile = call("PATCH", "/devices/profile", {
    "deviceId": "DEVICE-ABC123-XYZ789",
    "cabin": {"id": "C1"},
    "profile": "eco"
})
print(updated_profile)
🔧 Using cURL
# Get endpoints and authenticate 
ENDPOINTS=$(curl -sS "https://prod.api.harvia.io/endpoints")
REST_API_BASE=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.device.https')
REST_API_GENERICS=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.generics.https')

TOKEN_RESPONSE=$(curl -sS -H "Content-Type: application/json" \
  -X POST "$REST_API_GENERICS/auth/token" \
  --data '{"username":"your-username","password":"your-password"}')

ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.idToken')

# List user's devices
curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     "$REST_API_BASE/devices?maxResults=50" | jq '.'

# Send a device command
curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     -H "Content-Type: application/json" \
     -X POST \
     --data '{"deviceId":"DEVICE-ABC123-XYZ789","cabin":{"id":"C1"},"command":{"type":"SAUNA","state":"on"}}' \
     "$REST_API_BASE/devices/command" | jq '.'

# Get device state
curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     "$REST_API_BASE/devices/state?deviceId=DEVICE-ABC123-XYZ789&subId=C1" | jq '.'

# Update device target values
curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     -H "Content-Type: application/json" \
     -X PATCH \
     --data '{"deviceId":"DEVICE-ABC123-XYZ789","cabin":{"id":"C1"},"temperature":22,"humidity":50}' \
     "$REST_API_BASE/devices/target" | jq '.'

# Update active profile
curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     -H "Content-Type: application/json" \
     -X PATCH \
     --data '{"deviceId":"DEVICE-ABC123-XYZ789","cabin":{"id":"C1"},"profile":"eco"}' \
     "$REST_API_BASE/devices/profile" | jq '.'
🔵 GraphQL
The Device Service provides GraphQL queries, mutations, and subscriptions for device management and control.

Note: All GraphQL requests require a Cognito ID token in the Authorization: Bearer <idToken> header. See the API Overview section for authentication setup.

Base URL: Get the GraphQL endpoint from the endpoints configuration: endpoints.GraphQL.device.https

🔍 Queries
🔍 devicesGet
Retrieves a specific device by ID.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
Returns: Device - Device information with attributes and roles

Example:

query GetDevice {
  devicesGet(deviceId: "DEVICE-ABC123-XYZ789") {
    id
    type
    attr {
      key
      value
    }
    roles
    via
  }
}
🔍 devicesSearch
Searches for devices using a query string.

Arguments:

Parameter	Type	Required	Description
query	String!	✅	Search query string
nextToken	String	⚪	Pagination token
maxResults	Int	⚪	Maximum results to return
Returns: Devices - List of matching devices with pagination

Example:

query SearchDevices {
  devicesSearch(query: "type:sauna", maxResults: 50) {
    devices {
      id
      type
      attr {
        key
        value
      }
    }
    nextToken
  }
}
📊 devicesStatesGet
Gets the current state of a device shadow.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
shadowName	String	⚪	Shadow name (default: device)
Returns: DeviceState - Device shadow state with desired/reported values

Example:

query GetDeviceState {
  devicesStatesGet(deviceId: "DEVICE-ABC123-XYZ789") {
    deviceId
    shadowName
    desired
    reported
    timestamp
    version
    connectionState {
      connected
      updatedTimestamp
    }
  }
}
🏷️ devicesTagsList
Lists all tags for a device.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
Returns: [String!]! - Array of tag strings

Example:

query GetDeviceTags {
  devicesTagsList(deviceId: "DEVICE-ABC123-XYZ789")
}
🔐 devicesTokenExists
Checks if a device token exists in secrets manager.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
Returns: Boolean - True if token exists

Example:

query CheckDeviceToken {
  devicesTokenExists(deviceId: "DEVICE-ABC123-XYZ789")
}
🔒 devicesEncrypt
Encrypts a message for a specific device.

Arguments:

Parameter	Type	Required	Description
deviceId	ID	⚪	The ID of the device
certificateArn	String	⚪	Certificate ARN for encryption
message	String!	✅	Message to encrypt
Returns: String - Encrypted message

Example:

query EncryptMessage {
  devicesEncrypt(
    deviceId: "DEVICE-ABC123-XYZ789"
    message: "Hello, device!"
  )
}
🏢 organizationsDevicesList
Lists all devices in an organization.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
nextToken	String	⚪	Pagination token
maxResults	Int	⚪	Maximum results to return
recursive	Boolean	⚪	Include sub-organizations
Returns: Devices - List of organization devices with pagination

Example:

query ListOrgDevices {
  organizationsDevicesList(
    organizationId: "ORG-PROD-001"
    maxResults: 50
  ) {
    devices {
      id
      type
      attr {
        key
        value
      }
    }
    nextToken
  }
}
📋 organizationsContractsDevicesList
Lists devices accessible through contracts.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
Returns: Devices - List of contract-accessible devices

Example:

query ListContractDevices {
  organizationsContractsDevicesList(organizationId: "ORG-PROD-001") {
    devices {
      id
      type
      attr {
        key
        value
      }
    }
    nextToken
  }
}
👤 usersDevicesList
Lists devices owned by the calling user.

Arguments:

Parameter	Type	Required	Description
nextToken	String	⚪	Pagination token
Returns: Devices - List of user's devices with pagination

Example:

query ListMyDevices {
  usersDevicesList {
    devices {
      id
      type
      attr {
        key
        value
      }
    }
    nextToken
  }
}
🔧 operatorsDevicesList
Lists devices with direct contract access.

Arguments:

Parameter	Type	Required	Description
nextToken	String	⚪	Pagination token
Returns: Devices - List of operator-accessible devices

Example:

query ListOperatorDevices {
  operatorsDevicesList {
    devices {
      id
      type
      attr {
        key
        value
      }
    }
    nextToken
  }
}
📱 devicesMetadataGet
Gets device metadata including owner and roles.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
Returns: DeviceMetadata - Device metadata with owner and contact info

Example:

query GetDeviceMetadata {
  devicesMetadataGet(deviceId: "DEVICE-ABC123-XYZ789") {
    deviceId
    owner
    roles
    contactName
    phoneCountryCode
    phoneNumber
  }
}
🔄 otaUpdatesList
Lists available OTA updates.

Arguments:

Parameter	Type	Required	Description
nextToken	String	⚪	Pagination token
deviceType	String	⚪	Filter by device type
hwVersion	String	⚪	Filter by hardware version
Returns: OtaUpdates - List of available OTA updates

Example:

query ListOtaUpdates {
  otaUpdatesList(deviceType: "sauna") {
    otaUpdates {
      otaId
      firmwareVersion
      size
      description
      enabled
      deviceType
      hwVersion
    }
    nextToken
  }
}
📊 otaUpdatesStatesList
Lists OTA update states for devices.

Arguments:

Parameter	Type	Required	Description
onlyActive	Boolean	⚪	Show only active updates
nextToken	String	⚪	Pagination token
Returns: OtaUpdateStates - List of OTA update states

Example:

query ListOtaUpdateStates {
  otaUpdatesStatesList(onlyActive: true) {
    otaUpdateStates {
      deviceId
      updateState
      progressPercent
      timestamp
    }
    nextToken
  }
}
🏢 devicesFleetStatusGet
Gets fleet status for an organization.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
Returns: DeviceFleetStatus - Fleet status with device counts

Example:

query GetFleetStatus {
  devicesFleetStatusGet(organizationId: "ORG-PROD-001") {
    fleetStatus {
      key
      value
    }
  }
}
📦 otaUpdatesBatchList
Lists OTA update batch executions for an organization.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
nextToken	String	⚪	Pagination token
Returns: OtaUpdateBatchExecutions - List of batch executions with pagination

Example:

query ListOtaBatches {
  otaUpdatesBatchList(organizationId: "ORG-PROD-001") {
    otaBatchExecutions {
      id
      startDate
      currentCount
      maxCount
      executionStatus
      idle
      updating
      done
      failed
    }
    nextToken
  }
}
✏️ Mutations
📤 devicesCommandsSend
Sends a command to a device.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
command	Command!	✅	The command to send
subId	String	⚪	Subsystem ID
params	AWSJSON	⚪	Command parameters
Returns: CommandResponse - Command execution result

Example:

mutation SendCommand {
  devicesCommandsSend(
    deviceId: "DEVICE-ABC123-XYZ789"
    command: { type: SAUNA }
    params: "{\"temperature\": 80}"
  ) {
    response
    failureReason
  }
}
🗑️ devicesDelete
Deletes a device.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
Returns: String - Deletion confirmation

Example:

mutation DeleteDevice {
  devicesDelete(deviceId: "DEVICE-ABC123-XYZ789")
}
📊 devicesStatesUpdate
Updates device shadow state.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
state	AWSJSON!	✅	New state data
shadowName	String	⚪	Shadow name (default: device)
clientToken	String	⚪	Client token for idempotency
Returns: AWSJSON - Updated state

Example:

mutation UpdateDeviceState {
  devicesStatesUpdate(
    deviceId: "DEVICE-ABC123-XYZ789"
    state: "{\"desired\": {\"temp\": 80}}"
    shadowName: "C1"
  )
}
✏️ devicesUpdate
Updates device attributes.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
attributes	[AttributeInput!]!	✅	Attributes to update
Returns: Device - Updated device

Example:

mutation UpdateDevice {
  devicesUpdate(
    deviceId: "DEVICE-ABC123-XYZ789"
    attributes: [
      { key: "name", value: "Main Sauna" }
      { key: "location", value: "Building A" }
    ]
  ) {
    id
    type
    attr {
      key
      value
    }
  }
}
🏷️ devicesTagsUpdate
Updates device tags.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
tags	[String!]!	✅	New tags list
Returns: [String!]! - Updated tags

Example:

mutation UpdateDeviceTags {
  devicesTagsUpdate(
    deviceId: "DEVICE-ABC123-XYZ789"
    tags: ["production", "sauna", "building-a"]
  )
}
🔄 devicesOtaUpdatesStart
Starts OTA update for a device.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
otaId	ID!	✅	The OTA update ID
Returns: Boolean - Success status

Example:

mutation StartOtaUpdate {
  devicesOtaUpdatesStart(
    deviceId: "DEVICE-ABC123-XYZ789"
    otaId: "ota-456"
  )
}
❌ devicesOtaUpdatesCancel
Cancels OTA update for a device.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
Returns: Boolean - Success status

Example:

mutation CancelOtaUpdate {
  devicesOtaUpdatesCancel(deviceId: "DEVICE-ABC123-XYZ789")
}
🏢 organizationsDevicesMove
Moves a device between organizations.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
organizationId	ID	⚪	Target organization ID
subId	String	⚪	Subsystem ID
Returns: Device - Updated device (null if unmanaged)

Example:

mutation MoveDevice {
  organizationsDevicesMove(
    deviceId: "DEVICE-ABC123-XYZ789"
    organizationId: "ORG-NEW-001"
  ) {
    id
    type
    attr {
      key
      value
    }
  }
}
📝 devicesRemoteLoggingSet
Sets remote logging state for a device.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
cloudLogging	CloudLoggingState!	✅	Logging state
Returns: Boolean - Success status

Example:

mutation SetRemoteLogging {
  devicesRemoteLoggingSet(
    deviceId: "DEVICE-ABC123-XYZ789"
    cloudLogging: CONTINUOUS
  )
}
🔐 devicesTokenSet
Saves device token to secrets manager.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
token	String!	✅	Device token
mac	String	⚪	Device MAC address
Returns: Boolean - Success status

Example:

mutation SetDeviceToken {
  devicesTokenSet(
    deviceId: "DEVICE-ABC123-XYZ789"
    token: "device-token-string"
    mac: "AA:BB:CC:DD:EE:FF"
  )
}
🔗 devicesPair
Pairs a device with Home2Net cloud.

Arguments:

Parameter	Type	Required	Description
mac	String!	✅	Device MAC address
Returns: String - Pairing result

Example:

mutation PairDevice {
  devicesPair(mac: "AA:BB:CC:DD:EE:FF")
}
🚀 otaUpdatesBatchStart
Starts OTA update batch for devices in an organization.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
query	String!	✅	Search query for target devices
otaId	ID!	✅	The OTA update ID
maxCount	Int!	✅	Maximum number of devices to update
dailyMaxCount	Int	⚪	Daily maximum update count
Returns: ID - Batch execution ID

Example:

mutation StartOtaBatch {
  otaUpdatesBatchStart(
    organizationId: "ORG-PROD-001"
    query: "type:sauna"
    otaId: "ota-456"
    maxCount: 100
    dailyMaxCount: 10
  )
}
⏹️ otaUpdatesBatchStop
Stops OTA update batch execution.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
id	ID!	✅	Batch execution ID
Returns: Boolean - Success status

Example:

mutation StopOtaBatch {
  otaUpdatesBatchStop(
    organizationId: "ORG-PROD-001"
    id: "batch-execution-123"
  )
}
🏢 organizationsOtaUpdatesStart
Starts OTA updates for all devices in an organization.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
otaId	ID!	✅	The OTA update ID
Returns: Boolean - Success status

Example:

mutation StartOrgOtaUpdates {
  organizationsOtaUpdatesStart(
    organizationId: "ORG-PROD-001"
    otaId: "ota-456"
  )
}
❌ organizationsOtaUpdatesCancel
Cancels OTA updates for all devices in an organization.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
Returns: Boolean - Success status

Example:

mutation CancelOrgOtaUpdates {
  organizationsOtaUpdatesCancel(organizationId: "ORG-PROD-001")
}
📋 organizationsContractsAddDevice
Creates a new contract for a device between organizations.

Arguments:

Parameter	Type	Required	Description
organizationId	ID!	✅	The ID of the organization
deviceSerialNumber	String!	✅	Device serial number
userEmail	String!	✅	User email for the contract
Returns: DeviceContractResult - Contract creation result

Example:

mutation CreateDeviceContract {
  organizationsContractsAddDevice(
    organizationId: "ORG-PROD-001"
    deviceSerialNumber: "SN123456789"
    userEmail: "user@example.com"
  ) {
    contractId
    contractName
    deviceId
  }
}
📍 devicesLocationStore
Stores device GPS coordinates and location information as device attributes.

Arguments:

Parameter	Type	Required	Description
deviceId	ID!	✅	The ID of the device
latitude	Float!	✅	GPS latitude
longitude	Float!	✅	GPS longitude
accuracy	Float!	✅	Location accuracy in meters
Returns: Boolean - Success status

Example:

mutation StoreDeviceLocation {
  devicesLocationStore(
    deviceId: "DEVICE-ABC123-XYZ789"
    latitude: 60.1699
    longitude: 24.9384
    accuracy: 10.5
  )
}
💻 HTTP Request Examples
The following examples show how to make GraphQL queries and mutations using HTTP. Each example includes the complete authentication flow. For detailed authentication setup, token refresh, and error handling, see the API Overview section.

🟨 Using JavaScript/fetch
// Get endpoints and authenticate 
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiGenerics = endpoints.RestApi.generics.https;
const graphqlEndpoint = endpoints.GraphQL.device.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

// Example query
const query = `
  query GetDevice {
    devicesGet(deviceId: "DEVICE-ABC123-XYZ789") {
      id
      type
      attr {
        key
        value
      }
      roles
      via
    }
  }
`;

const graphqlResponse = await fetch(graphqlEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({ query })
});

const data = await graphqlResponse.json();
console.log(data);
🐍 Using Python/requests
import requests

# Get endpoints and authenticate 
response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]
graphql_endpoint = endpoints["GraphQL"]["device"]["https"]

tokens = requests.post(
    f"{rest_api_generics}/auth/token",
    headers={"Content-Type": "application/json"},
    json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

# Example query
query = """
query GetDevice {
  devicesGet(deviceId: "DEVICE-ABC123-XYZ789") {
    id
    type
    attr {
      key
      value
    }
    roles
    via
  }
}
"""

response = requests.post(
    graphql_endpoint,
    headers={
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {id_token}"
    },
    json={'query': query}
)

data = response.json()
print(data)
🔧 Using cURL
# Get endpoints and authenticate 
ENDPOINTS=$(curl -sS "https://prod.api.harvia.io/endpoints")
REST_API_GENERICS=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.generics.https')
GRAPHQL=$(echo "$ENDPOINTS" | jq -r '.endpoints.GraphQL.device.https')

TOKEN_RESPONSE=$(curl -sS -H "Content-Type: application/json" \
  -X POST "$REST_API_GENERICS/auth/token" \
  --data '{"username":"your-username","password":"your-password"}')

ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.idToken')

QUERY='{"query":"query GetDevice {\\n  devicesGet(deviceId: \"DEVICE-ABC123-XYZ789\") {\\n    id\\n    type\\n    attr {\\n      key\\n      value\\n    }\\n    roles\\n    via\\n  }\\n}"}'

curl -sS -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -X POST "$GRAPHQL" \
  --data "$QUERY" | jq '.'
📡 Subscriptions
⚠️ Important: Subscriptions are more complex than queries/mutations as they require WebSocket connections.

🔧 Setup Requirements
JavaScript/Node.js:

npm install aws-appsync aws-appsync-auth-link graphql graphql-tag
Note: aws-appsync requires graphql version 14.x or 15.0.0–15.3.0 (not 16+). If you encounter compatibility issues, install with: npm install aws-appsync aws-appsync-auth-link graphql@14 graphql-tag

Python:

pip install requests websocket-client
Note: Use the Cognito IdToken obtained via the REST API (see API Overview). Get endpoints from the Endpoints API; the client URL comes from endpoints.GraphQL.device.https. The receiver must be the JWT claim cognito:username from your IdToken.

📊 devicesStatesUpdateFeed
Real-time feed of device state updates.

Arguments:

Parameter	Type	Required	Description
receiver	ID!	✅	The ID of the receiver
Returns: DeviceStateUpdateNotice - Real-time device state updates

Example:

subscription DeviceStateUpdates {
  devicesStatesUpdateFeed(receiver: "user-abc-123-def-456") {
    receiver
    item {
      deviceId
      desired
      reported
      timestamp
      connectionState {
        connected
        updatedTimestamp
      }
    }
  }
}
🔄 otaUpdatesStatesUpdateFeed
Real-time feed of OTA update state changes.

Arguments:

Parameter	Type	Required	Description
receiver	ID!	✅	The ID of the receiver
Returns: OtaUpdateStateNotice - Real-time OTA update notifications

Example:

subscription OtaUpdateStates {
  otaUpdatesStatesUpdateFeed(receiver: "user-abc-123-def-456") {
    receiver
    item {
      deviceId
      updateState
      progressPercent
      timestamp
    }
  }
}
🏢 devicesOrganizationsUpdateFeed
Real-time feed of device organization changes.

Arguments:

Parameter	Type	Required	Description
receiver	ID!	✅	The ID of the receiver
Returns: DeviceOrganizationUpdateNotice - Real-time organization updates

Example:

subscription DeviceOrganizationUpdates {
  devicesOrganizationsUpdateFeed(receiver: "user-abc-123-def-456") {
    receiver
    deviceId
    organizationId
    updateType
    timestamp
  }
}
✏️ devicesAttributesUpdateFeed
Real-time feed of device attribute changes.

Arguments:

Parameter	Type	Required	Description
receiver	ID!	✅	The ID of the receiver
Returns: DeviceAttributesUpdateNotice - Real-time attribute updates

Example:

subscription DeviceAttributesUpdates {
  devicesAttributesUpdateFeed(receiver: "user-abc-123-def-456") {
    receiver
    deviceId
    attributes {
      key
      value
    }
    timestamp
  }
}
📦 otaUpdatesBatchFeed
Real-time feed of OTA batch update notifications.

Arguments:

Parameter	Type	Required	Description
receiver	ID!	✅	The ID of the receiver
Returns: OtaUpdatesBatchNotice - Real-time batch update notifications

Example:

subscription OtaBatchUpdates {
  otaUpdatesBatchFeed(receiver: "user-abc-123-def-456") {
    item {
      organizationId
      id
      currentCount
      executionStatus
      idle
      updating
      done
      failed
    }
  }
}
📊 Subscription Examples
The following examples show complete subscription setup including authentication. For detailed authentication setup and token management, see the API Overview section.

🟨 Using JavaScript/Node.js
import { AWSAppSyncClient } from "aws-appsync";
import { AUTH_TYPE } from "aws-appsync-auth-link";
import gql from "graphql-tag";

// Get endpoints and authenticate 
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiGenerics = endpoints.RestApi.generics.https;
const graphqlEndpoint = endpoints.GraphQL.device.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

// Extract user ID from JWT token (required for receiver argument)
const tokenPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf-8'));
const userId = tokenPayload['cognito:username'];

// Create AppSync client
const client = new AWSAppSyncClient({
  url: graphqlEndpoint,
  region: "eu-central-1",
  auth: {
    type: AUTH_TYPE.AWS_LAMBDA,
    token: async () => `Bearer ${idToken}`,
  },
  disableOffline: true,
});

// Subscribe to device state updates
const subscription = client.subscribe({
  query: gql`
    subscription DeviceStateUpdates {
      devicesStatesUpdateFeed(receiver: "${userId}") {
        receiver
        item {
          deviceId
          desired
          reported
          timestamp
          connectionState {
            connected
            updatedTimestamp
          }
        }
      }
    }
  `
});

subscription.subscribe({
  next: (data) => console.log("Received:", data),
  error: (error) => console.error("Error:", error)
});
🐍 Using Python/requests
import json
import base64
import websocket
import requests
from uuid import uuid4

# Get endpoints and authenticate 
response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]
graphql_endpoint = endpoints["GraphQL"]["device"]["https"]

tokens = requests.post(
    f"{rest_api_generics}/auth/token",
    headers={"Content-Type": "application/json"},
    json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

def header_encode(header_obj):
    """Encode header using Base 64"""
    return base64.b64encode(json.dumps(header_obj).encode('utf-8')).decode('utf-8')

# Extract user ID from JWT token
token_payload = json.loads(base64.b64decode(id_token.split('.')[1] + '==').decode('utf-8'))
user_id = token_payload['cognito:username']

# Build WebSocket URL and host
wss_url = graphql_endpoint.replace('https', 'wss').replace('appsync-api', 'appsync-realtime-api')
host = graphql_endpoint.replace('https://', '').replace('/graphql', '')

# Generate subscription ID
sub_id = str(uuid4())

# Create JWT authentication header
auth_header = {
    'host': host,
    'Authorization': f"Bearer {id_token}"
}

# GraphQL subscription
gql_subscription = json.dumps({
    'query': f'subscription DeviceStateUpdates {{ devicesStatesUpdateFeed(receiver: "{user_id}") {{ receiver item {{ deviceId desired reported timestamp connectionState {{ connected updatedTimestamp }} }} }} }}',
    'variables': {}
})

# WebSocket event callbacks
def on_message(ws, message):
    message_object = json.loads(message)
    message_type = message_object['type']

    if message_type == 'connection_ack':
        # Register subscription
        register = {
            'id': sub_id,
            'payload': {
                'data': gql_subscription,
                'extensions': {'authorization': auth_header}
            },
            'type': 'start'
        }
        ws.send(json.dumps(register))

    elif message_type == 'start_ack':
        print("✅ Subscription registered successfully")

    elif message_type == 'data':
        print("✅ Received subscription data:", message_object['payload'])
        # Stop subscription
        ws.send(json.dumps({'type': 'stop', 'id': sub_id}))

def on_open(ws):
    ws.send(json.dumps({'type': 'connection_init'}))

# Create WebSocket connection
connection_url = wss_url + '?header=' + header_encode(auth_header) + '&payload=e30='
ws = websocket.WebSocketApp(
    connection_url,
    subprotocols=['graphql-ws'],
    on_open=on_open,
    on_message=on_message
)

# Run WebSocket (use proper threading/timeout handling)
ws.run_forever()
📋 Types
🔧 Device
Device representation

Field	Type	Required	Description
id	String!	✅	Device identifier
type	String!	✅	Device type
attr	[Attribute!]!	✅	Device attributes
roles	[String!]!	✅	User roles for the device
via	VisibleReason!	✅	Visibility reason
📋 Devices
Paginated device list

Field	Type	Required	Description
devices	[Device!]!	✅	List of devices
nextToken	String	⚪	Pagination token
📊 DeviceState
Device shadow state

Field	Type	Required	Description
deviceId	ID!	✅	Device identifier
shadowName	String	⚪	Shadow name
desired	AWSJSON	⚪	Desired state
reported	AWSJSON	⚪	Reported state
timestamp	Float	⚪	State timestamp
version	Int	⚪	Shadow version
clientToken	String	⚪	Client token for idempotency
connectionState	DeviceConnectionState	⚪	Connection status
metadata	AWSJSON	⚪	State metadata
📱 DeviceMetadata
Device metadata

Field	Type	Required	Description
deviceId	ID!	✅	Device identifier
owner	String	⚪	Device owner
roles	[String]	⚪	User roles
contactName	String	⚪	Contact name
phoneCountryCode	String	⚪	Phone country code
phoneNumber	String	⚪	Phone number
📤 CommandResponse
Command execution result

Field	Type	Required	Description
response	Boolean!	✅	Command handled status
failureReason	String	⚪	Failure reason if not handled
🔄 OtaUpdate
OTA update information

Field	Type	Required	Description
otaId	String!	✅	OTA update ID
firmwareVersion	String!	✅	Firmware version
size	Int	⚪	Update size
description	String	⚪	Update description
filename	String	⚪	Update filename
enabled	Boolean	⚪	Update enabled status
urlExpirationSeconds	Int	⚪	URL expiration time in seconds
deviceType	String	⚪	Target device type
hwVersion	String	⚪	Hardware version
betaTesting	Boolean	⚪	Beta testing flag
📦 OtaUpdates
Paginated OTA updates list

Field	Type	Required	Description
otaUpdates	[OtaUpdate!]!	✅	List of OTA updates
nextToken	String	⚪	Pagination token
📊 OtaUpdateState
OTA update state

Field	Type	Required	Description
batchKey	String	⚪	Batch update key
deviceId	ID!	✅	Device identifier
updateFirmwareVersion	String	⚪	Firmware version being updated
updateState	OtaState	⚪	Update state
resultCode	Int	⚪	Result code
progressPercent	Int	⚪	Progress percentage
timestamp	String	⚪	State timestamp
🏢 DeviceFleetStatus
Fleet status

Field	Type	Required	Description
fleetStatus	[DeviceFleetStatusAttribute!]!	✅	Fleet status attributes
🔗 Attribute
Device attribute

Field	Type	Required	Description
key	String!	✅	Attribute key
value	String	⚪	Attribute value
🔌 DeviceConnectionState
Device connection state

Field	Type	Required	Description
connected	Boolean!	✅	Connection status
updatedTimestamp	String!	✅	Last update timestamp
📦 OtaUpdateStates
Paginated OTA update states list

Field	Type	Required	Description
otaUpdateStates	[OtaUpdateState!]!	✅	List of OTA update states
nextToken	String	⚪	Pagination token
🚀 OtaBatchExecution
OTA batch execution

Field	Type	Required	Description
organizationId	ID!	✅	Organization identifier
id	ID!	✅	Batch execution ID
startDate	String	⚪	Start date
stopDate	String	⚪	Stop date
currentCount	Int	⚪	Current update count
maxCount	Int	⚪	Maximum update count
dailyMaxCount	Int	⚪	Daily maximum count
executionStatus	String	⚪	Execution status
searchQuery	String	⚪	Device search query
userId	String	⚪	User identifier
idle	Int	⚪	Idle device count
updating	Int	⚪	Updating device count
done	Int	⚪	Completed device count
failed	Int	⚪	Failed device count
📋 OtaUpdateBatchExecutions
Paginated OTA batch executions list

Field	Type	Required	Description
otaBatchExecutions	[OtaBatchExecution!]!	✅	List of batch executions
nextToken	String	⚪	Pagination token
🔑 DeviceFleetStatusAttribute
Fleet status attribute

Field	Type	Required	Description
key	String!	✅	Attribute key
value	Int!	✅	Attribute value
📄 DeviceContractResult
Device contract creation result

Field	Type	Required	Description
contractId	ID!	✅	Contract identifier
contractName	String!	✅	Contract name
deviceId	ID!	✅	Device identifier
📋 Sample Responses
✅ Successful Query Response
{
  "data": {
    "devicesGet": {
      "id": "DEVICE-ABC123-XYZ789",
      "type": "sauna",
      "attr": [
        { "key": "name", "value": "Main Sauna" },
        { "key": "location", "value": "Building A" }
      ],
      "roles": ["owner"],
      "via": "Organization"
    }
  }
}
❌ Error Response
{
  "errors": [
    {
      "message": "Device not found",
      "locations": [{"line": 3, "column": 5}],
      "path": ["devicesGet"],
      "extensions": {
        "code": "DEVICE_NOT_FOUND",
        "exception": {
          "stacktrace": ["Error: Device not found", "    at ..."]
        }
      }
    }
  ],
  "data": null
}
📄 Pagination
For paginated results, use the nextToken from the response in subsequent requests:

query GetMoreDevices {
  devicesSearch(
    query: "type:sauna"
    maxResults: 50
    nextToken: "eyJsYXN0RXZhbHVhdGVkS2V5Ijp7InBhcnRpdGlvbl9rZXkiOnsic..."
  ) {
    devices {
      id
      type
      attr {
        key
        value
      }
    }
    nextToken
  }
}
🌍 Configuration Reference: Harvia Endpoints API

📝 Note: Always fetch the latest configuration to ensure you're using the current endpoints, regions, and client IDs. The configuration may change over time.