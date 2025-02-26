const app = require("./app");
const connectDB = require("./config/db");

require("dotenv").config();






// Export app for Vercel
module.exports = app;


app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`server is connect with port ${process.env.PORT}`);
  connectDB();
});
