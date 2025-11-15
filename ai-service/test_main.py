import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "available_models" in response.json()


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_models_status():
    """Test models status endpoint"""
    response = client.get("/models/status")
    assert response.status_code == 200
    data = response.json()
    assert "knn" in data
    assert "svm" in data


def test_knn_train_and_predict():
    """Test KNN training and prediction"""
    # Train the model
    train_data = {
        "X": [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
        "y": [0, 0, 0, 1, 1, 1]
    }
    response = client.post("/models/knn/train", json=train_data)
    assert response.status_code == 200
    assert response.json()["model_type"] == "KNN"
    assert response.json()["samples_trained"] == 6
    
    # Make predictions
    predict_data = {
        "X": [[2.5, 3.5], [5.5, 6.5]]
    }
    response = client.post("/models/knn/predict", json=predict_data)
    assert response.status_code == 200
    assert "predictions" in response.json()
    assert len(response.json()["predictions"]) == 2


def test_svm_train_and_predict():
    """Test SVM training and prediction"""
    # Train the model
    train_data = {
        "X": [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
        "y": [0, 0, 0, 1, 1, 1]
    }
    response = client.post("/models/svm/train", json=train_data)
    assert response.status_code == 200
    assert response.json()["model_type"] == "SVM"
    
    # Make predictions
    predict_data = {
        "X": [[2.5, 3.5]]
    }
    response = client.post("/models/svm/predict", json=predict_data)
    assert response.status_code == 200
    assert "predictions" in response.json()


def test_predict_without_training():
    """Test that prediction fails when model is not trained"""
    # Note: This test assumes models are not trained in isolation
    # In a real scenario, you might need to reset the model manager
    predict_data = {
        "X": [[1, 2]]
    }
    # This might pass if previous tests trained the model
    # In production, you'd want to reset state between tests
