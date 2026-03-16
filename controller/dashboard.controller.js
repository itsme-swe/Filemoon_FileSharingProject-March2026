const FileModel = require("../model/file.model");

const fetchDashboard = async (req, res) => {
  try {
    const reports = await FileModel.aggregate([
      { $group: { _id: "$filetype", total: { $sum: 1 } } },
      {
        $project: {
          type: "$_id",
          total: 1,
          _id: 0,
        },
      },
    ]);
    res.status(201).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchDashboard,
};
