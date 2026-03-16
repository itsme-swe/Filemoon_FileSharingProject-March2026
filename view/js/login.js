axios.defaults.baseURL = SERVER;

//🌟 Third party library used to give notification on UI
const toast = new Notyf({
  position: { x: "center", y: "top" },
});

const checkSession = async () => {
  const session = await getSession();

  if (session) {
    location.href = "/dashboard";
  }
};
checkSession();

const login = async (e) => {
  try {
    e.preventDefault();
    const form = e.target;
    const payload = {
      email: form.elements.email.value,
      password: form.elements.password.value,
    };

    const { data } = await axios.post("/api/login", payload);
    toast.success(data.message);
    localStorage.setItem("authToken", data.token);
    setTimeout(() => {
      location.href = "/dashboard";
    }, 2000);
  } catch (err) {
    toast.error(err.response ? err.response.data.message : err.message);
  }
};
