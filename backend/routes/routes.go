package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/savin/junction2025/backend/handlers"
)

func SetupRoutes(router *gin.Engine) {
	// Health check endpoint
	router.GET("/health", handlers.HealthCheck)

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Example endpoints
		v1.GET("/ping", handlers.Ping)
		v1.GET("/users", handlers.GetUsers)
		v1.GET("/users/:id", handlers.GetUser)
		v1.POST("/users", handlers.CreateUser)
		v1.PUT("/users/:id", handlers.UpdateUser)
		v1.DELETE("/users/:id", handlers.DeleteUser)
	}
}
