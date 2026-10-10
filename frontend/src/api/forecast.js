import api from "./api";

export const getForecast = async (lat = 19.07, lon = 72.87) => {
  const res = await api.get("/forecast/", { params: { lat, lon } });
  return res.data;
};
