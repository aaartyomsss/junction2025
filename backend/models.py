from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from typing import List, Optional
import numpy as np


class MLModelManager:
    """Manager class for various ML models"""
    
    def __init__(self):
        self.models = {
            "knn": None,
            "svm": None,
            "decision_tree": None,
            "random_forest": None
        }
    
    def train_knn(self, X: List[List[float]], y: List[int], n_neighbors: int = 3) -> None:
        """Train K-Nearest Neighbors model"""
        X_array = np.array(X)
        y_array = np.array(y)
        
        self.models["knn"] = KNeighborsClassifier(n_neighbors=n_neighbors)
        self.models["knn"].fit(X_array, y_array)
    
    def train_svm(self, X: List[List[float]], y: List[int], kernel: str = 'rbf') -> None:
        """Train Support Vector Machine model"""
        X_array = np.array(X)
        y_array = np.array(y)
        
        self.models["svm"] = SVC(kernel=kernel, gamma='auto')
        self.models["svm"].fit(X_array, y_array)
    
    def train_decision_tree(self, X: List[List[float]], y: List[int], max_depth: Optional[int] = None) -> None:
        """Train Decision Tree model"""
        X_array = np.array(X)
        y_array = np.array(y)
        
        self.models["decision_tree"] = DecisionTreeClassifier(max_depth=max_depth)
        self.models["decision_tree"].fit(X_array, y_array)
    
    def train_random_forest(self, X: List[List[float]], y: List[int], n_estimators: int = 100) -> None:
        """Train Random Forest model"""
        X_array = np.array(X)
        y_array = np.array(y)
        
        self.models["random_forest"] = RandomForestClassifier(n_estimators=n_estimators, random_state=42)
        self.models["random_forest"].fit(X_array, y_array)
    
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
