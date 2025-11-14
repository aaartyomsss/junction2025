package models

import "time"

type Device struct {
	ID              string    `json:"id"`
	Name            string    `json:"name" binding:"required"`
	Type            string    `json:"type"`           // "fenix" or "smart_sensor"
	IsConnected     bool      `json:"isConnected"`
	BatteryLevel    int       `json:"batteryLevel"`   // 0-100
	SignalStrength  int       `json:"signalStrength"` // 0-100
	LastSeen        time.Time `json:"lastSeen"`
	Location        Location  `json:"location"`
	CurrentReading  *Reading  `json:"currentReading,omitempty"`
}

type Location struct {
	Name      string  `json:"name"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Reading struct {
	Temperature float64   `json:"temperature"` // in Celsius
	Humidity    float64   `json:"humidity"`    // in percentage
	Timestamp   time.Time `json:"timestamp"`
	Heating     bool      `json:"heating"`
	TargetTemp  float64   `json:"targetTemp"`
}


