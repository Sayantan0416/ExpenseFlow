import axios from "axios";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
  "https://expenseflow-api-7alh.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// TRANSACTIONS
// ============================================================

export const getTransactions = async () => {
  const response = await api.get("/transactions/");
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post(
    "/transactions/",
    transactionData
  );
  return response.data;
};

export const updateTransaction = async (
  id,
  transactionData
) => {
  const response = await api.put(
    `/transactions/${id}/`,
    transactionData
  );
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(
    `/transactions/${id}/`
  );
  return response.data;
};

// ============================================================
// CATEGORIES
// ============================================================

export const getCategories = async () => {
  const response = await api.get("/categories/");
  return response.data;
};

// CREATE CATEGORY
export const createCategory = async (categoryData) => {
  const data = {
    user_id: Number(categoryData.user_id || 1),
    name: categoryData.name.trim(),
    type: categoryData.type || "expense",
  };

  const response = await api.post(
    "/categories/",
    data
  );

  return response.data;
};

// UPDATE CATEGORY
export const updateCategory = async (
  id,
  categoryData
) => {
  const data = {
    user_id: Number(categoryData.user_id || 1),
    name: categoryData.name.trim(),
    type: categoryData.type || "expense",
  };

  const response = await api.put(
    `/categories/${id}/`,
    data
  );

  return response.data;
};

// DELETE CATEGORY
export const deleteCategory = async (id) => {
  const response = await api.delete(
    `/categories/${id}/`
  );

  return response.data;
};

// ============================================================
// REPORTS
// ============================================================

export const getReports = async () => {
  const response = await api.get("/reports/");
  return response.data;
};

// ============================================================
// SETTINGS
// ============================================================

export const getSettings = async (userId = 1) => {
  const response = await api.get(
    `/settings/${userId}/`
  );

  return response.data;
};

export const updateSettings = async (
  userId = 1,
  settingsData
) => {
  const response = await api.put(
    `/settings/${userId}/`,
    settingsData
  );

  return response.data;
};

// ============================================================
// HEALTH CHECK
// ============================================================

export const checkBackend = async () => {
  const response = await api.get("/");
  return response.data;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;