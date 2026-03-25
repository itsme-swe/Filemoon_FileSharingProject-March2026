const ShareModel = require("../model/share.model");
const nodemailer = require("nodemailer"); // 🌟 nodemailer package used to send mails upto 10,000 monthly mails

const connection = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const getEmailTemplate = (link) => {
  return `
      <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>File Access Notification</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
                <tr>
                    <td align="center">

                        <!-- Container -->
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background-color:#2d89ef; color:#ffffff; padding:20px; text-align:center; font-size:22px; font-weight:bold;">
                                    File Shared With You
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:30px; color:#333333; font-size:14px; line-height:1.6;">

                                    <p style="margin:0 0 15px 0;">Hi <strong>{{recipient_name}}</strong>,</p>

                                    <p style="margin:0 0 15px 0;">
                                        A file has been securely shared with you. You can access it using the link below.
                                    </p>

                                    <!-- File Info Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border:1px solid #e0e0e0; border-radius:6px; margin:20px 0;">
                                        <tr>
                                            <td style="padding:15px;">
                                                <p style="margin:0; font-size:14px;"><strong>File Name:</strong> {{file_name}}</p>
                                                <p style="margin:5px 0 0 0; font-size:14px;"><strong>File Size:</strong> {{file_size}}</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- CTA Button -->
                                    <p style="text-align:center; margin:25px 0;">
                                        <a href="${link}" download="" 
                                          style="background-color:#2d89ef; color:#ffffff; padding:12px 25px; text-decoration:none; border-radius:5px; font-size:14px; display:inline-block;">
                                          Download File
                                        </a>
                                    </p>

                                    <!-- Expiration Notice -->
                                    <p style="margin:20px 0 0 0; font-size:13px; color:#d9534f;">
                                        ⚠ This link will expire on <strong>{{expiry_date}}</strong>. Please download the file before it becomes unavailable.
                                    </p>

                                    <p style="margin:20px 0 0 0;">
                                        If you did not expect this file, please ignore this email or contact support.
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color:#f4f6f8; padding:20px; text-align:center; font-size:12px; color:#777777;">
                                    © {{year}} Your Company Name<br>
                                    Need help? Contact us at 
                                    <a href="mailto:support@yourcompany.com" style="color:#2d89ef; text-decoration:none;">
                                        support@yourcompany.com
                                    </a>
                                </td>
                            </tr>

                        </table>
                        <!-- End Container -->

                    </td>
                </tr>
            </table>

        </body>
        </html>
`;
};

const shareFile = async (req, res) => {
  try {
    const { email, fileId } = req.body;
    const link = `${process.env.DOMAIN}/api/file/download/${fileId}`;
    const options = {
      from: process.env.EMAIL,
      to: email,
      subject: "Filemoon - New file received",
      html: getEmailTemplate(link),
    };

    const payload = {
      senderId: req.user.id,
      receiverEmail: email,
      file: fileId,
    };

    //⭐ To avoid writing await multiple times, we are using Promise.all([])
    await Promise.all([
      connection.sendMail(options),
      ShareModel.create(payload),
    ]);

    res.status(201).json({ message: "Email sent successfully!!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const fetchShareFile = async (req, res) => {
  try {
    const history = await ShareModel.find({ user: req.user.senderId })
      //   .populate("senderId", "fullname email mobile -_id")
      .populate("file");
    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  shareFile,
  fetchShareFile,
};
