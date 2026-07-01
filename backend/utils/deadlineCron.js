import cron from "node-cron";
import taskModel from "../models/task.js";
import Notification from "../models/notification.js";
import ActivityService from "../services/activityService.js";

// Runs once a day at 8:00 AM server time
export const startDeadlineCron = () => {
    cron.schedule("0 8 * * *", async () => {
        try {
            const now = new Date();
            const in24Hours = new Date(now.getTime() + 24 * 60 * 60000);

            // 1. Tasks due within 24 hours — send reminder once
            const dueSoon = await taskModel.find({
                deadline: { $gte: now, $lte: in24Hours },
                status: { $nin: ["completed"] },
                reminderSentAt: null,
                assignedTo: { $ne: null }
            });

            for (const task of dueSoon) {
                await Notification.create({
                    userId: task.assignedTo,
                    title: "Task Deadline Approaching",
                    message: `Task '${task.title}' is due within 24 hours.`,
                    type: "alert",
                    link: "/tasks"
                });
                task.reminderSentAt = new Date();
                await task.save();
            }

            // 2. Already overdue, unresolved tasks — notify daily
            const overdue = await taskModel.find({
                deadline: { $lt: now },
                status: { $nin: ["completed"] },
                assignedTo: { $ne: null }
            });

            for (const task of overdue) {
                await Notification.create({
                    userId: task.assignedTo,
                    title: "Task Overdue",
                    message: `Task '${task.title}' is overdue. Please update its status.`,
                    type: "alert",
                    link: "/tasks"
                });
            }

            if (overdue.length > 0) {
                await ActivityService.log(
                    "Deadline Check Run",
                    `${overdue.length} task(s) found overdue`,
                    "",
                    null
                );
            }

            console.log(`[deadline-cron] Reminders: ${dueSoon.length}, Overdue: ${overdue.length}`);
        } catch (error) {
            console.log("Deadline Cron Error:", error);
        }
    });
};
