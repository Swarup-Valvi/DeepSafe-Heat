import api from "./api";


export const getUsers = async () => {
  const response = await api.get(
    "/auth/users/"
  );

  return Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
};


export const createUser = async (data) => {
  const response = await api.post(
    "/auth/users/",
    data
  );

  return response.data;
};


export const updateUser = async (
  id,
  data
) => {
  const response = await api.patch(
    `/auth/users/${id}/`,
    data
  );

  return response.data;
};


export const deleteUser = async (id) => {
  await api.delete(
    `/auth/users/${id}/`
  );
};


export const getWeatherRecords =
  async () => {
    const response = await api.get(
      "/weather/records/"
    );

    return Array.isArray(response.data)
      ? response.data
      : response.data.results || [];
  };


export const getRiskRules =
  async () => {
    const response = await api.get(
      "/risk/rules/"
    );

    return Array.isArray(response.data)
      ? response.data
      : response.data.results || [];
  };


export const updateRiskRule = async (
  id,
  data
) => {
  const response = await api.patch(
    `/risk/rules/${id}/`,
    data
  );

  return response.data;
};


export const createRiskRule = async (
  data
) => {
  const response = await api.post(
    "/risk/rules/",
    data
  );

  return response.data;
};