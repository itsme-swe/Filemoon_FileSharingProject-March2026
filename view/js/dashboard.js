axios.defaults.baseURL = SERVER;

const getToken = () => {
  const options = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  };
  return options;
};

const logout = () => {
  localStorage.clear();
  location.href = "/login";
};

window.onload = () => {
  showUserDetails();
  fetchRecentFiles();
  fetchRecentSharedFiles();
};

//🌟 Third party library used to give notification on UI
const toast = new Notyf({
  position: { x: "center", y: "top" },
});

//🌟 This function automatically displays the username and email on the dashboard of the logged-in user
const showUserDetails = async () => {
  const session = await getSession();
  const fullname = document.getElementById("fullname");
  fullname.innerHTML = session.fullname;

  const email = document.getElementById("email");
  email.innerHTML = session.email;
};

const getSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "Kb", "Mb", "Gb", "Tb"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${sizes[i]}`;
};

const fetchRecentFiles = async () => {
  try {
    const { data } = await axios.get("/api/file?limit=3", getToken());
    const recentFileBox = document.getElementById("recent-files-box");

    for (let item of data) {
      const recentFileUi = `
               <div class="flex justify-between items-start">
                <div>
                  <h1 class="font-medium text-zinc-500 capitalize" >${item.filename}</h1>
                  <small class="text-gray-500 text-sm">${getSize(item.size)}</small>
                </div>
                <p class="text-sm text-gray-600">${moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}</p>
              </div>
      `;
      recentFileBox.innerHTML += recentFileUi;
    }
  } catch (err) {
    toast.error(err.response ? err.response.data.message : err.message);
  }
};

const fetchRecentSharedFiles = async () => {
  try {
    const { data } = await axios.get("/api/share?limit=3", getToken());
    const recentShareFileBox = document.getElementById("recent-shared-box");

    for (let item of data) {
      const recentShareFileUi = `
               <div class="flex justify-between items-start">
                <div>
                  <h1 class="font-medium text-zinc-500 capitalize" >${item.file.filename}</h1>
                  <small class="text-gray-500 text-sm">${item.receiverEmail}</small>
                </div>
                <p class="text-sm text-gray-600">${moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}</p>
              </div>
      `;
      recentShareFileBox.innerHTML += recentShareFileUi;
    }
  } catch (err) {
    toast.error(err.response ? err.response.data.message : err.message);
  }
};
