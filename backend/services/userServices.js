import User from "../models/User.js";

export async function userExists(u_id) {
  try {
    const user = await User.findOne({ u_id });
    return !!user;
  } catch (error) {
    throw error;
  }
}
