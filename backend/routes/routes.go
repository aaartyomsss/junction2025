package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/savin/junction2025/backend/handlers"
)

func SetupRoutes(router *gin.Engine) {
	// Enable CORS for React Native development
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// Health check endpoint
	router.GET("/health", handlers.HealthCheck)

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Example endpoints
		v1.GET("/ping", handlers.Ping)
		
		// User endpoints
		v1.GET("/users", handlers.GetUsers)
		v1.GET("/users/:id", handlers.GetUser)
		v1.POST("/users", handlers.CreateUser)
		v1.PUT("/users/:id", handlers.UpdateUser)
		v1.DELETE("/users/:id", handlers.DeleteUser)
		
		// Device endpoints (Sauna sensors)
		v1.GET("/devices", handlers.GetDevices)
		v1.GET("/devices/stats", handlers.GetDeviceStats)
		v1.GET("/devices/:id", handlers.GetDevice)
		v1.GET("/devices/:id/reading", handlers.GetDeviceReading)
		v1.PUT("/devices/:id/target", handlers.UpdateDeviceTarget)
	}
}
