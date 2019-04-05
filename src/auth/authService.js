import filterActions from "../stores/filterActions";

const RequestMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

const BACKEND_AUTH_API_URL = "http://localhost:4000/auth";

export const authorizeUsingCode = async (code) => {
  const requestBody = {code};
  return await sendRequest(RequestMethod.POST, requestBody);
};

const sendRequest = async (method, requestBody) => {
  console.log(requestBody);
  try {
    const response = await fetch(BACKEND_AUTH_API_URL, {
      method,
      body: JSON.stringify(requestBody),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    response.json().then((response) => {
      console.log(response);
      if (response.isOk && response.email) {
        // do something with username
        window.history.replaceState({}, document.title, "/");
      }
    });
  } catch (e) {
    console.log(e);
  }
};
