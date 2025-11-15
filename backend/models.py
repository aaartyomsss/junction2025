from sklearn.neighbors import KNeighborsClassifier
from typing import List
import numpy as np


class MLModelManager:
    """Manager class for KNN model"""
    
    def __init__(self):
        self.models = {
            "knn": None
        }
    
    def train_knn(self, X: List[List[float]], y: List[int], n_neighbors: int = 3) -> None:
        """Train K-Nearest Neighbors model"""
        X_array = np.array(X)
        y_array = np.array(y)
        
        self.models["knn"] = KNeighborsClassifier(n_neighbors=n_neighbors)
        self.models["knn"].fit(X_array, y_array)
    
    def predict(self, model_name: str, X: List[List[float]]) -> List[int]:
        """Make predictions using specified model"""
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not recognized")
        
        model = self.models[model_name]
        if model is None:
            raise ValueError(f"Model '{model_name}' has not been trained yet")
        
        X_array = np.array(X)
        predictions = model.predict(X_array)
        return predictions.tolist()
    
    def is_trained(self, model_name: str) -> bool:
        """Check if a model has been trained"""
        return self.models.get(model_name) is not None


# Global model manager instance
model_manager = MLModelManager()
