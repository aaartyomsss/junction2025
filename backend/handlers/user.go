package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/savin/junction2025/backend/models"
)

// Mock data store
var users = []models.User{
	{ID: "1", Name: "John Doe", Email: "john@example.com"},
	{ID: "2", Name: "Jane Smith", Email: "jane@example.com"},
}

func GetUsers(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": users,
	})
}

func GetUser(c *gin.Context) {
	id := c.Param("id")

	for _, user := range users {
		if user.ID == id {
			c.JSON(http.StatusOK, gin.H{
				"data": user,
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{
		"error": "User not found",
	})
}

func CreateUser(c *gin.Context) {
	var newUser models.User

	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	users = append(users, newUser)
	c.JSON(http.StatusCreated, gin.H{
		"data": newUser,
	})
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var updatedUser models.User

	if err := c.ShouldBindJSON(&updatedUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	for i, user := range users {
		if user.ID == id {
			updatedUser.ID = id
			users[i] = updatedUser
			c.JSON(http.StatusOK, gin.H{
				"data": updatedUser,
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{
		"error": "User not found",
	})
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	for i, user := range users {
		if user.ID == id {
			users = append(users[:i], users[i+1:]...)
			c.JSON(http.StatusOK, gin.H{
				"message": "User deleted successfully",
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{
		"error": "User not found",
	})
}
