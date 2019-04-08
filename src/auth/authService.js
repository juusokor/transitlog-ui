const RequestMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

const Endpoint = {
  LOGIN: "login",
  SESSION: "existingSession",
  LOGOUT: "logout",
};

const BACKEND_API_URL = process.env.REACT_APP_TRANSITLOG_SERVER;

export const authorizeUsingCode = async (code) => {
  const requestBody = {code};
  return await sendRequest(RequestMethod.POST, requestBody);
};

const sendRequest = async (method, requestBody) => {
  try {
    const response = await fetch(BACKEND_API_URL + Endpoint.LOGIN, {
      method,
      credentials: "include",
      body: JSON.stringify(requestBody),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const checkExistingSession = async () => {
  try {
    const response = await fetch(BACKEND_API_URL + Endpoint.SESSION, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const logout = async () => {
  try {
    const response = await fetch(BACKEND_API_URL + Endpoint.LOGOUT, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};
