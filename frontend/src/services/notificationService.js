// services/notificationService.js
import axios from "./api";

/**
 * Fetch all notifications for the seller
 */
export const getSellerNotifications = async () => {
  try {
    const response = await axios.get("/seller/notifications");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch seller notifications:", error);
    return [];
  }
};

/**
 * Update the read/unread status of a notification
 * @param {number} id - Notification ID
 * @param {boolean} isRead - true for read, false for unread
 */
export const updateNotificationStatus = async (id, isRead) => {
  try {
    const response = await axios.patch(
      `/seller/notifications/${id}/read`,
      { is_read: Boolean(isRead) } // ensure boolean
    );
    return response.data || [];
  } catch (error) {
    console.error(`Failed to update notification ${id}:`, error);
    return [];
  }
};