import Activity from '../models/activity.js';

class ActivityService {
    static async log(actionType, title, description = '', performedBy = null) {
        try {
            await Activity.create({
                actionType,
                title,
                description,
                performedBy
            });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    }
}

export default ActivityService;
