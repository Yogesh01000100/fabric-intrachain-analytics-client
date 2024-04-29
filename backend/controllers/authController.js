import jwt from "jsonwebtoken";
import {userExists} from "../services/userServices.js";
export async function login(req, res) {
  try {
    const { u_id } = req.query
    if (!u_id) {
      return res.status(400).json({ error: "user id not provided!" });
    }
    const user = await userExists(u_id);
    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    // Implement password check also in future
    const { role } = user;

    const token = jwt.sign({ role: role }, "secret_phrase");

    return res.status(201).json({ token: token });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}