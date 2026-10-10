import api from "./api";


export const getActivityTypes = async () => {
  const response = await api.get(
    "/activity-types/"
  );

  return Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
};


export const createActivityType = async (
  payload
) => {
  const response = await api.post(
    "/activity-types/",
    payload
  );

  return response.data;
};


export const updateActivityType = async (
  id,
  payload
) => {
  const response = await api.patch(
    `/activity-types/${id}/`,
    payload
  );

  return response.data;
};


export const deleteActivityType = async (
  id
) => {
  await api.delete(
    `/activity-types/${id}/`
  );
};


export const getActivities = async () => {
  const response = await api.get(
    "/activities/"
  );

  return Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
};


export const getActivity = async (
  id
) => {
  const response = await api.get(
    `/activities/${id}/`
  );

  return response.data;
};


export const createActivity = async (
  payload
) => {
  const response = await api.post(
    "/activities/",
    payload
  );

  return response.data;
};


export const assessActivity = async (
  id
) => {
  const response = await api.post(
    `/activities/${id}/assess/`,
    {}
  );

  return response.data;
};


export const assessActivityDL = async (id) => {
  const response = await api.post(
    `/activities/${id}/assess-dl/`,
    {}
  );

  return response.data;
};


export const getSaferTimes = async (
  id
) => {
  const response = await api.get(
    `/activities/${id}/safer-times/`
  );

  return response.data;
};


export const rescheduleActivity = async (
  id,
  startTime
) => {
  const response = await api.post(
    `/activities/${id}/reschedule/`,
    {
      start_time: startTime,
    }
  );

  return response.data;
};


export const geocodeLocation = async (
  location
) => {
  const query = location?.trim();

  if (!query) {
    throw new Error(
      "Please enter a location."
    );
  }

  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(query)}` +
    "&count=1" +
    "&language=en" +
    "&format=json";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Unable to look up this location."
    );
  }

  const data = await response.json();

  if (!data.results?.length) {
    throw new Error(
      "Location not found. Try a city name such as Pune."
    );
  }

  const result = data.results[0];

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country,
    admin1: result.admin1,
  };
};