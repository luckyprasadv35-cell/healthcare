import cron from 'node-cron';
import { getSupabaseAdmin } from '../middlewares/authMiddleware';
import { sendWorkoutReminder } from '../services/emailService';

// Run every day at 8:00 AM server time
export const startCronJobs = () => {
  console.log('Cron jobs initialized.');

  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily workout reminder cron job...');
    const supabaseAdmin = getSupabaseAdmin();

    try {
      // 1. Fetch all users and their active plans
      // Since 'user_plans' has user_id, we need to join it with auth.users if possible.
      // But auth.users is not queryable directly by postgrest easily without joining profiles.
      // We'll fetch profiles, then fetch auth.users using admin api.
      
      const { data: plans, error: planError } = await supabaseAdmin
        .from('user_plans')
        .select('*')
        .eq('is_active', true);
        
      if (planError) throw planError;
      if (!plans || plans.length === 0) {
        console.log('No active plans found for today.');
        return;
      }

      // 2. Fetch all users from Auth Admin to get emails
      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      if (usersError) throw usersError;
      const users = usersData.users;

      const userEmailMap = new Map();
      users.forEach((u: any) => userEmailMap.set(u.id, u.email));

      // 3. Determine "day" of the plan
      // A simple implementation: Just send day 1 for now, or cycle based on current day of week (1-7)
      const currentDayOfWeek = new Date().getDay() || 7; // 1 (Mon) - 7 (Sun)

      for (const plan of plans) {
        const email = userEmailMap.get(plan.user_id);
        if (!email) continue;

        const workoutDay = plan.workout_plan.find((d: any) => d.day === currentDayOfWeek) || plan.workout_plan[0];
        const nutritionDay = plan.nutrition_plan.find((d: any) => d.day === currentDayOfWeek) || plan.nutrition_plan[0];

        await sendWorkoutReminder(email, workoutDay, nutritionDay);
      }
      
      console.log('Daily workout reminders sent successfully.');
    } catch (error) {
      console.error('Error executing daily workout reminder job:', error);
    }
  });
};
