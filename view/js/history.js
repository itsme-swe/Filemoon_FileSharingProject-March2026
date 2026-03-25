axios.defaults.baseURL = SERVER;

window.onload = () => {
  fetchHistory();
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
    for (let item of data) {
      console.log(item);
      const historyUi = ` 
      <tr class="text-gray-600 border-b border-gray-100">
            <td class="py-4 pl-5 capitalize">${item.file.filename}</td>
            <td>${item.receiverEmail}</td>
            <td>${moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
      </tr>`;
      table.innerHTML += historyUi;
    }
  } catch (error) {
    toast.error(error.response ? error.response.data.message : error.message);
  }
};
