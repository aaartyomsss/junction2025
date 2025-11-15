from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert "message" in body
    assert "available_models" in body


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "backend"


def test_ping():
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json()["message"] == "pong"


def test_get_devices():
    response = client.get("/api/v1/devices")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["count"] == len(payload["data"])
    assert payload["count"] >= 1


def test_get_devices_filtered():
    response = client.get("/api/v1/devices", params={"type": "fenix"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert all(device["type"] == "fenix" for device in payload["data"])


def test_get_single_device():
    response = client.get("/api/v1/devices/junction-sauna-1")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["id"] == "junction-sauna-1"


def test_get_device_not_found():
    response = client.get("/api/v1/devices/unknown-device")
    assert response.status_code == 404
    payload = response.json()
    assert payload["success"] is False


def test_get_device_reading_offline():
    response = client.get("/api/v1/devices/junction-sauna-4/reading")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is False
    assert "offline" in payload["error"]


def test_update_device_target():
    # Fetch current target to avoid changing global state
    device = client.get("/api/v1/devices/junction-sauna-1").json()["data"]
    current_target = device["currentReading"]["targetTemp"]

    response = client.put(
        "/api/v1/devices/junction-sauna-1/target",
        json={"targetTemp": current_target},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["currentReading"]["targetTemp"] == current_target


def test_get_device_stats():
    response = client.get("/api/v1/devices/stats")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    stats = payload["data"]
    assert {"totalDevices", "connectedDevices", "averageTemp"} <= stats.keys()


def test_user_crud_flow():
    user_id = "test-user"
    # Ensure clean slate
    client.delete(f"/api/v1/users/{user_id}")

    create_response = client.post(
        "/api/v1/users",
        json={"id": user_id, "name": "Test User", "email": "test@example.com"},
    )
    assert create_response.status_code == 201
    assert create_response.json()["data"]["id"] == user_id

    update_response = client.put(
        f"/api/v1/users/{user_id}",
        json={"name": "Updated User", "email": "updated@example.com"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["name"] == "Updated User"

    delete_response = client.delete(f"/api/v1/users/{user_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "User deleted successfully"

    not_found = client.get(f"/api/v1/users/{user_id}")
    assert not_found.status_code == 404


def test_models_status():
    response = client.get("/models/status")
    assert response.status_code == 200
    data = response.json()
    assert "knn" in data and "svm" in data


def test_knn_train_and_predict():
    train_data = {
        "X": [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
        "y": [0, 0, 0, 1, 1, 1],
    }
    response = client.post("/api/models/knn/train", json=train_data)
    assert response.status_code == 200

    predict_data = {"X": [[2.5, 3.5], [5.5, 6.5]]}
    response = client.post("/api/models/knn/predict", json=predict_data)
    assert response.status_code == 200
    assert "predictions" in response.json()


def test_svm_train_and_predict():
    train_data = {
        "X": [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
        "y": [0, 0, 0, 1, 1, 1],
    }
    response = client.post("/api/models/svm/train", json=train_data)
    assert response.status_code == 200

    predict_data = {"X": [[2.5, 3.5]]}
    response = client.post("/api/models/svm/predict", json=predict_data)
    assert response.status_code == 200
    assert "predictions" in response.json()


def test_predict_without_training():
    response = client.post("/api/models/decision_tree/predict", json={"X": [[1, 2]]})
    assert response.status_code == 400
    assert "not been trained" in response.json()["detail"]
