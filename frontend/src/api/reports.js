import api from "./api";

export const getDashboardReport = async () => {
  const response = await api.get("/reports/dashboard/");
  return response.data;
};

export const getRiskTrends = async () => {
  const response = await api.get("/reports/trends/");
  return response.data;
};

export const getRiskDistribution = async () => {
  const response = await api.get("/reports/distribution/");
  return response.data;
};