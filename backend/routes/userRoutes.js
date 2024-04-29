import express from "express";
import { cacheMiddleware } from "../middlewares/cacheMiddleware.js";
//import {verifyToken} from "../middlewares/authMiddleware.js";
import { login } from "../controllers/authController.js";
import { getHospitalData10, getHospitalData20, getHospitalData30, getHospitalData40, getHospitalData50, uploadEHR } from "../controllers/userController.js";

const router = express.Router();

router.post("/login", login);
router.get("/getHospitalRole10",cacheMiddleware(10),getHospitalData10);
router.get("/getHospitalRole20",cacheMiddleware(10),getHospitalData20);
router.get("/getHospitalRole30",cacheMiddleware(10),getHospitalData30);
router.get("/getHospitalRole40",cacheMiddleware(10),getHospitalData40);
router.get("/getHospitalRole50",cacheMiddleware(10),getHospitalData50);
router.post("/uploadEHR",uploadEHR);

export default router;
