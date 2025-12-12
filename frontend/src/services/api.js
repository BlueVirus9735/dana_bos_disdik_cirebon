import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    // "Content-Type": "application/json", // Axios sets this automatically for objects, but for FormData we let browser set it
  },
});

export const getIjazahList = async (params = {}) => {
  try {
    const response = await api.get("/list.php", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching ijazah list:", error);
    throw error;
  }
};

export const deleteIjazah = async (id) => {
  try {
    const response = await api.post("/delete.php", { id });
    return response.data;
  } catch (error) {
    console.error("Error deleting ijazah:", error);
    throw error;
  }
};

export const updateIjazah = async (data) => {
  try {
    const response = await api.post("/update.php", data);
    return response.data;
  } catch (error) {
    console.error("Error updating ijazah:", error);
    throw error;
  }
};

export const uploadIjazah = async (formData) => {
  try {
    const response = await api.post("/upload.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading ijazah:", error);
    throw error;
  }
};

export default {
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  getIjazah: getIjazahList, // Mapping for old code compatibility if needed
  deleteIjazah,
  uploadIjazah,
};
