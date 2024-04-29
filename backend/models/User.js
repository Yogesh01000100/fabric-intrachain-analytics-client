import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  u_id: { type: String, required: true, unique: true },
  role: String,
  first_name: String,
  last_name: String,
  contact_email: String,
  contact_phone: String,
  network_id: String,
  keychain_id: String,
  capabilities: [String],
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
