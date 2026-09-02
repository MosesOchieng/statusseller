import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import businessRouter from "./business";
import productsRouter from "./products";
import ordersRouter from "./orders";
import statsRouter from "./stats";
import notificationsRouter from "./notifications";
import publicRouter from "./public";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/business", businessRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/stats", statsRouter);
router.use("/notifications", notificationsRouter);
router.use("/public", publicRouter);
router.use("/ai", aiRouter);

export default router;
