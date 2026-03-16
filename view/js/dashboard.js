const logout = () => {
  localStorage.clear();
  location.href = "/login";
};

window.onload = () => {
  showUserDetails();
};

//🌟 This function automatically displays the username and email on the dashboard of the logged-in user
const showUserDetails = async () => {
  const session = await getSession();
  const fullname = document.getElementById("fullname");
  fullname.innerHTML = session.fullname;

  const email = document.getElementById("email");
  email.innerHTML = session.email;
};
