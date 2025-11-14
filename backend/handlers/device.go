package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/savin/junction2025/backend/models"
)

// Mock device data store with Junction venue saunas
var devices = []models.Device{
	{
		ID:             "junction-sauna-1",
		Name:           "Junction Main Sauna",
		Type:           "smart_sensor",
		IsConnected:    true,
		BatteryLevel:   87,
		SignalStrength: 95,
		LastSeen:       time.Now(),
		Location: models.Location{
			Name:      "Junction Venue - Hall A",
			Latitude:  60.1695,
			Longitude: 24.9354,
		},
		CurrentReading: &models.Reading{
			Temperature: 82.5,
			Humidity:    18.3,
			Timestamp:   time.Now(),
			Heating:     true,
			TargetTemp:  85.0,
		},
	},
	{
		ID:             "junction-sauna-2",
		Name:           "Junction Wellness Sauna",
		Type:           "smart_sensor",
		IsConnected:    true,
		BatteryLevel:   92,
		SignalStrength: 88,
		LastSeen:       time.Now().Add(-5 * time.Minute),
		Location: models.Location{
			Name:      "Junction Venue - Hall B",
			Latitude:  60.1699,
			Longitude: 24.9358,
		},
		CurrentReading: &models.Reading{
			Temperature: 78.0,
			Humidity:    16.5,
			Timestamp:   time.Now(),
			Heating:     false,
			TargetTemp:  80.0,
		},
	},
	{
		ID:             "junction-sauna-3",
		Name:           "Junction Relaxation Sauna",
		Type:           "smart_sensor",
		IsConnected:    true,
		BatteryLevel:   78,
		SignalStrength: 91,
		LastSeen:       time.Now().Add(-2 * time.Minute),
		Location: models.Location{
			Name:      "Junction Venue - Hall C",
			Latitude:  60.1693,
			Longitude: 24.9351,
		},
		CurrentReading: &models.Reading{
			Temperature: 85.2,
			Humidity:    20.1,
			Timestamp:   time.Now(),
			Heating:     true,
			TargetTemp:  90.0,
		},
	},
	{
		ID:             "junction-sauna-4",
		Name:           "Junction Recovery Sauna",
		Type:           "smart_sensor",
		IsConnected:    false,
		BatteryLevel:   15,
		SignalStrength: 42,
		LastSeen:       time.Now().Add(-30 * time.Minute),
		Location: models.Location{
			Name:      "Junction Venue - Hall D",
			Latitude:  60.1697,
			Longitude: 24.9356,
		},
		CurrentReading: nil,
	},
	{
		ID:             "harvia-booth-demo-1",
		Name:           "Harvia Booth Demo - Fenix",
		Type:           "fenix",
		IsConnected:    true,
		BatteryLevel:   100,
		SignalStrength: 98,
		LastSeen:       time.Now(),
		Location: models.Location{
			Name:      "Harvia Booth - Demo Area 1",
			Latitude:  60.1700,
			Longitude: 24.9360,
		},
		CurrentReading: &models.Reading{
			Temperature: 75.0,
			Humidity:    15.0,
			Timestamp:   time.Now(),
			Heating:     true,
			TargetTemp:  85.0,
		},
	},
	{
		ID:             "harvia-booth-demo-2",
		Name:           "Harvia Booth Demo - Mini",
		Type:           "fenix",
		IsConnected:    true,
		BatteryLevel:   100,
		SignalStrength: 97,
		LastSeen:       time.Now(),
		Location: models.Location{
			Name:      "Harvia Booth - Demo Area 2",
			Latitude:  60.1702,
			Longitude: 24.9362,
		},
		CurrentReading: &models.Reading{
			Temperature: 88.5,
			Humidity:    22.3,
			Timestamp:   time.Now(),
			Heating:     false,
			TargetTemp:  85.0,
		},
	},
}

// GetDevices returns all devices
func GetDevices(c *gin.Context) {
	// Optional filter by type
	deviceType := c.Query("type")
	
	if deviceType == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"count":   len(devices),
			"data":    devices,
		})
		return
	}

	// Filter by type
	filtered := []models.Device{}
	for _, device := range devices {
		if device.Type == deviceType {
			filtered = append(filtered, device)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(filtered),
		"data":    filtered,
	})
}

// GetDevice returns a specific device by ID
func GetDevice(c *gin.Context) {
	id := c.Param("id")

	for _, device := range devices {
		if device.ID == id {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"data":    device,
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{
		"success": false,
		"error":   "Device not found",
	})
}

// GetDeviceReading returns current sensor reading for a device
func GetDeviceReading(c *gin.Context) {
	id := c.Param("id")

	for _, device := range devices {
		if device.ID == id {
			if device.CurrentReading == nil {
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"error":   "Device is offline or has no readings",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"data":    device.CurrentReading,
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{
		"success": false,
		"error":   "Device not found",
	})
}

// UpdateDeviceTarget updates target temperature for a device
func UpdateDeviceTarget(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		TargetTemp float64 `json:"targetTemp" binding:"required,min=60,max=100"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	for i, device := range devices {
		if device.ID == id {
			if device.CurrentReading != nil {
				devices[i].CurrentReading.TargetTemp = input.TargetTemp
				devices[i].CurrentReading.Heating = devices[i].CurrentReading.Temperature < input.TargetTemp

				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Target temperature updated",
					"data":    devices[i],
				})
				return
			}

			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Device has no readings available",
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{
		"success": false,
		"error":   "Device not found",
	})
}

// GetDeviceStats returns statistics about all devices
func GetDeviceStats(c *gin.Context) {
	connected := 0
	totalTemp := 0.0
	tempCount := 0
	maxTemp := 0.0
	minTemp := 100.0

	for _, device := range devices {
		if device.IsConnected {
			connected++
		}
		if device.CurrentReading != nil {
			totalTemp += device.CurrentReading.Temperature
			tempCount++
			if device.CurrentReading.Temperature > maxTemp {
				maxTemp = device.CurrentReading.Temperature
			}
			if device.CurrentReading.Temperature < minTemp {
				minTemp = device.CurrentReading.Temperature
			}
		}
	}

	avgTemp := 0.0
	if tempCount > 0 {
		avgTemp = totalTemp / float64(tempCount)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalDevices":     len(devices),
			"connectedDevices": connected,
			"averageTemp":      avgTemp,
			"maxTemp":          maxTemp,
			"minTemp":          minTemp,
		},
	})
}


