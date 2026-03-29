axios.defaults.baseURL = SERVER;

window.onload = () => {
  fetchHistory();
  fetchImage();
};

const getToken = () => {
  const options = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  };
  return options;
};

//🌟 Third party library used to give notification on UI
const toast = new Notyf({
  position: { x: "center", y: "top" },
});

const logout = () => {
  localStorage.clear();
  location.href = "/login";
};

const fetchHistory = async () => {
  try {
    const { data } = await axios.get("/api/share", getToken());
    const table = document.getElementById("table");
    const notFoundHistoryUi = `
          <div class="p-16 text-center">
            <h1 class="text-gray-500 text-4xl">Oops ! You have not shared any file yet..</h1>
          </div>
    `;

    if (data.length === 0) {
      table.innerHTML = notFoundHistoryUi;
      return;
    }

    for (let item of data) {
      const historyUi = ` 
      <tr class="text-gray-600 border-b border-gray-100">
            <td class="py-4 pl-5 capitalize">${item.file.filename}</td>
            <td>${item.receiverEmail}</td>
            <td>${moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
      </tr>
      `;
      table.innerHTML += historyUi;
    }
  } catch (error) {
    toast.error(error.response ? error.response.data.message : error.message);
  }
};

const uploadProfileImage = () => {
  try {
    const input = document.createElement("input");
    const profileImg = document.getElementById("profile-img");
    input.type = "file";
    input.accept = "image/*"; // This is how we allow any extension image to be uploaded
    input.click();

    // ⭐ This code works when file get selected
    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("picture", file);
      await axios.post("/api/profile-img", formData, getToken());
      const profilePicUrl = URL.createObjectURL(file);
      profileImg.src = profilePicUrl;
    };
  } catch (error) {
    toast.error(err.response ? err.response.data.message : err.message);
  }
};

const fetchImage = async () => {
  try {
    const options = {
      responseType: "blob",
      ...getToken(),
    };
    const { data } = await axios.get("/api/profile-img", options);
    const picURL = URL.createObjectURL(data);
    const profileImg = document.getElementById("profile-img");
    profileImg.src = picURL;
  } catch (err) {
    if (!err.response) {
      return toast.error(err.message);
    }
    const error = await err.response.data.text();
    const { message } = JSON.parse(error);
    toast.error(message);
  }
};
