
const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function promoteAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "skillhub"
        });

        const email = process.argv[2]?.toLowerCase().trim();

        if (!email) {
            throw new Error(
                "Please provide your account email as an argument."
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw new Error(
                "No account found with that email. Register or log in first."
            );
        }

        user.role = "admin";
        await user.save();

        console.log("Admin role assigned successfully.");
        console.log("Account:", user.email);
        console.log("Role:", user.role);

    } catch (error) {
        console.error("Admin promotion failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

promoteAdmin();
