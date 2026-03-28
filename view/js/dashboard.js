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
  fetchFilesReport();
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
                  <h1 class="font-medium text-zinc-500 capitalize" >${item.file?.filename || "File not available"}</h1>
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

const fetchFilesReport = async () => {
  try {
    const { data } = await axios.get("/api/dashboard", getToken());
    const filesSummaryBox = document.getElementById("report-card");
    for (let item of data) {
      const filesSummaryUi = `
              <div
            class="overflow-hidden relative bg-white rounded-lg shadow hover:shadow-lg h-40 flex items-center justify-center flex-col">
                  <h1 class="text-xl font-semibold text-gray-600 capitalize">${item.type.split("/")[0]}</h1>
                  <p class="text-4xl font-bold">${item.total}</p>
                  <div class="flex justify-center items-center w-[100px] h-[100px] rounded-full absolute top-7 -left-4"
                      style="background-image: linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%);">
                      <i class="ri-live-fill text-4xl text-white"></i>
                  </div>
          </div>
      `;
      filesSummaryBox.innerHTML += filesSummaryUi;
    }
  } catch (err) {
    toast.error(err.response ? err.response.data.message : err.message);
  }
};

const uploadProfileImage = () => {
  const input = document.createElement("input");
  const profileImg = document.getElementById("profile-img");
  input.type = "file";
  input.accept = "image/*"; // This is how we allow any extension image to be uploaded
  input.click();

  // ⭐ This code works when file get selected
  input.onchange = () => {
    const file = input.files[0];
    const imgURL = URL.createObjectURL(file); // To create URL of any file
    profileImg.src = imgURL;
  };
};
