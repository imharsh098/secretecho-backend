// db.js
import mongoose from "mongoose";
import "dotenv/config";

const dbStrings = [
  process.env.dbString1, // Database 1 connection string
];

const createConnection = (connectionString) => {
  const connection = mongoose.createConnection(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connection.once("connected", () => {
    console.log(`Database connected: ${connectionString}`);
  });

  connection.on("error", (err) => {
    console.error(`Connection error: ${err}`);
    process.exit(1); // Optional: Exit process on DB connection error
  });

  return connection;
};

const [connection1] = dbStrings.map(createConnection);

export { connection1 };
