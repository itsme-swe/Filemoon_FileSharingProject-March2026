axios.defaults.baseURL = SERVER;

window.onload = () => {
  fetchFiles();
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
  e.preventDefault();
  const uploadBtn = document.getElementById("upload-btn");
  try {
    const progress = document.getElementById("progress");
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
      ...getToken(),
    };
    uploadBtn.disabled = true;
    const { data } = await axios.post("/api/file", formData, options);
    toast.success(`${data.filename} has been uploaded !`);
    fetchFiles();
    progress.style.width = 0;
    progress.innerHTML = "";
    form.reset();
    toggleDrawer();
  } catch (error) {
    toast.error(error.response ? error.response.data.message : error.message);
  } finally {
    uploadBtn.disabled = false;
  }
};

const getSize = (size) => {
  const mb = size / 1000 / 1000;
  return mb.toFixed(1);
};
const fetchFiles = async () => {
  try {
    const { data } = await axios.get("/api/file", getToken());
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
                <button class="bg-rose-400 px-2 py-1 text-white hover:bg-rose-600 rounded" onclick="deleteFile('${file._id}', this)">
                  <i class="ri-delete-bin-6-line"></i>
                </button>

                <button class="bg-green-400 px-2 py-1 text-white hover:bg-green-700 rounded" onclick="downloadFile('${file._id}', '${file.filename}', this)">
                  <i class="ri-download-line"></i>
                </button>

                <button class="bg-amber-400 px-2 py-1 text-white hover:bg-amber-700 rounded" onclick="openModelForShare('${file._id}', '${file.filename}')">
                  <i class="ri-share-line"></i>
                </button>
              </div>
            </td>
          </tr> 
          `;
      table.innerHTML += ui;
    }
  } catch (error) {
    toast.error(error.response ? error.response.data.message : error.message);
  }
};

const deleteFile = async (id, button) => {
  try {
    button.innerHTML = '<i class="ri-loader-fill"></i>';
    button.disabled = true;
    await axios.delete(`/api/file/${id}`, getToken());
    toast.success("File deleted successfully");
    fetchFiles();
  } catch (error) {
    toast.error(error.response ? error.response.data.message : error.message);
  } finally {
    button.innerHTML = '<i class="ri-delete-bin-6-line"></i>';
    button.disabled = false;
  }
};

const downloadFile = async (id, filename, button) => {
  try {
    button.innerHTML = '<i class="ri-loader-fill"></i>';
    button.disabled = true;
    const options = {
      responseType: "blob",
      ...getToken(),
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
  } finally {
    button.innerHTML = '<i class="ri-download-line"></i>';
    button.disabled = false;
  }
};

const openModelForShare = (id, filename) => {
  new Swal({
    showConfirmButton: false,
    html: `
        <form class="text-left flex flex-col gap-6" onsubmit="shareFile('${id}', event)">
            <h1 class="font-medium text-black text-2xl">Email id</h1>
            <input type="email" required class="border border-gray-300 w-full p-3 rounded" placeholder="mai@gmail.com" name="email"/>
            <button id="send-btn" class="bg-indigo-400 hover:bg-indigo-500 text-white rounded py-3 px-8 w-fit font-medium">Send</button>

            <div class="flex items-center gap-2">
                <p class="text-gray-500">You are sharing - </p>
                <p class="text-green-400 font-medium">${filename}</p>
            </div>
        </form>
    `,
  });
};

const shareFile = async (id, e) => {
  const sendButton = document.getElementById("send-btn");
  const form = e.target;
  try {
    e.preventDefault();
    sendButton.disabled = true;

    const email = form.elements.email.value.trim();
    const payload = {
      email: email,
      fileId: id,
    };
    await axios.post("/api/share", payload, getToken());
    toast.success("File sent successfully");
  } catch (error) {
    toast.error(error.message ? error.response.data.message : error.message);
  } finally {
    Swal.close();
  }
};
