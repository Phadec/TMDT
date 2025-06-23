import { adminApi } from "./api";

const SETTINGS_ENDPOINTS = {
  GET_SETTINGS: "/settings",
  UPDATE_SETTINGS: "/settings",
  UPDATE_GENERAL: "/settings/general",
  RESET_SETTINGS: "/settings/reset",
};

export const settingsService = {
  // Lấy tất cả cài đặt
  getSettings: () => {
    return adminApi.get(SETTINGS_ENDPOINTS.GET_SETTINGS);
  },

  // Cập nhật tất cả cài đặt
  updateSettings: (settingsData) => {
    return adminApi.put(SETTINGS_ENDPOINTS.UPDATE_SETTINGS, settingsData);
  },

  // Cập nhật cài đặt chung
  updateGeneralSettings: (generalSettings) => {
    return adminApi.put(SETTINGS_ENDPOINTS.UPDATE_GENERAL, generalSettings);
  },

  // Khôi phục cài đặt mặc định
  resetSettings: () => {
    return adminApi.post(SETTINGS_ENDPOINTS.RESET_SETTINGS);
  },
};