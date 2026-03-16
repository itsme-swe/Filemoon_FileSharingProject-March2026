axios.defaults.baseURL = SERVER;

window.onload = () => {
  fetchFiles();
};

//🌟 Third party library used to give notification on UI
const toast = new Notyf({
  position: { x: "center", y: "top" },
});

const logout = () => {
  localStorage.clear();
  location.href = "/login";
};

const toggleDrawer = () => {
  const drawer = document.getElementById("drawer");
  const rightValue = drawer.style.right;

  if (rightValue === "0px") {
    drawer.style.right = "-33.33%";
  } else {
    drawer.style.right = "0px";
  }
};

const uploadFile = async (e) => {
  try {
    e.preventDefault();
    const progress = document.getElementById("progress");
    const uploadBtn = document.getElementById("upload-btn");
    const form = e.target;
    const formData = new FormData(form);

    // 🌟 Checking file size to be allowed for uploading -- Validation on UI
    const file = formData.get("file");
    const fileSize = getSize(file.size);
    if (fileSize > 200) {
      return toast.error("File size too large, max size 200 Mb allowed");
    }

    const options = {
      onUploadProgress: (e) => {
        const loaded = e.loaded;
        const total = e.total;
        const percentValue = Math.floor((loaded * 100) / total);
        progress.style.width = percentValue + "%";
        progress.innerHTML = percentValue + "%";
      },
    };
    uploadBtn.disabled = true;
    const { data } = await axios.post("/api/file", formData, options);
    toast.success(`${data.filename} has been uploaded !`);
    fetchFiles();
    uploadBtn.disabled = false;
    progress.style.width = 0;
    progress.innerHTML = "";
    form.reset();
    toggleDrawer();
  } catch (error) {
    toast.error(error.response ? error.response.data.message : error.message);
  }
};

const getSize = (size) => {
  const mb = size / 1000 / 1000;
  return mb.toFixed(1);
};
const fetchFiles = async () => {
  try {
    const { data } = await axios.get("/api/file");
    const table = document.getElementById("files-table");
    table.innerHTML = "";
    for (let file of data) {
      const ui = `
      <tr class="text-gray-600 border-b border-gray-100">
            <td class="py-4 pl-5 capitalize">${file.filename}</td>
            <td class="capitalize">${file.filetype}</td>
            <td>${getSize(file.size)} MB</td>
            <td>${moment(file.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
            <td>
              <div class="spcae-x-3">
                <button class="bg-rose-400 px-2 py-1 text-white hover:bg-rose-600 rounded" onclick="deleteFile('${file._id}')">
                  <i class="ri-delete-bin-6-line"></i>
                </button>

                <button class="bg-green-400 px-2 py-1 text-white hover:bg-green-700 rounded" onclick="downloadFile('${file._id}', '${file.filename}')">
                  <i class="ri-download-line"></i>
                </button>

                <button class="bg-amber-400 px-2 py-1 text-white hover:bg-amber-700 rounded">
                  <i class="ri-share-line"></i>
                </button>
              </div>
            </td>
          </tr> 
          `;
      table.innerHTML += ui;
    }
  } catch (err) {
    toast.error(error.response ? error.response.data.message : error.message);
  }
};

const deleteFile = async (id) => {
  try {
    await axios.delete(`/api/file/${id}`);
    toast.success("File deleted successfully");
    fetchFiles();
  } catch (error) {
    toast.error(error.response ? error.response.data.message : error.message);
  }
};

const downloadFile = async (id, filename) => {
  try {
    const options = {
      responseType: "blob",
    };
    const { data } = await axios.get(`/api/file/download/${id}`, options);
    const extCode = data.type.split("/").pop();
    const url = URL.createObjectURL(data);
    const anchorTag = document.createElement("a");
    anchorTag.href = url;
    anchorTag.download = `${filename}.${extCode}`;
    anchorTag.click();
    anchorTag.remove();
  } catch (error) {
    if (!error.response) {
      return toast.error(error.message);
    }

    const err = await error.response.data.text();
    const { message } = JSON.parse(err);
    toast.error(message);
    console.log(err);
  }
};
