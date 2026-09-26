import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('your_supabase')) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in your .env file.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const fallbackPlan = {
  macros: { daily_calories: 2200, protein_g: 150, carbs_g: 220, fats_g: 70 },
  workout_plan: Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    focus: "Full Body",
    exercises: [
      { name: "Squats", sets: 3, reps: "10-12", rest_sec: 60 },
      { name: "Push-ups", sets: 3, reps: "10-15", rest_sec: 60 }
    ]
  })),
  nutrition_plan: Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    meals: [
      { type: "Breakfast", description: "Oatmeal", calories: 450 },
      { type: "Lunch", description: "Chicken salad", calories: 650 },
      { type: "Dinner", description: "Salmon and rice", calories: 800 }
    ]
  }))
};

async function seedUsers(count = 100) {
  console.log(`🚀 Starting to seed ${count} users into Supabase...`);
  
  for (let i = 1; i <= count; i++) {
    const email = `testuser${i}_${Date.now()}@example.com`;
    const password = 'Password123!';
    
    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) throw authError;
      const userId = authData.user.id;

      // 2. Create Profile
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        age: Math.floor(Math.random() * 40) + 18, // 18-58
        weight_kg: Math.floor(Math.random() * 50) + 50, // 50-100kg
        height_cm: Math.floor(Math.random() * 40) + 150, // 150-190cm
        gender: i % 2 === 0 ? 'male' : 'female',
        activity_level: 'moderately_active',
        goal: 'fat_loss',
        diet_preference: 'standard',
        equipment: 'full_gym',
        medical_notes: ''
      });

      if (profileError) throw profileError;

      // 3. Create User Plan
      const { error: planError } = await supabaseAdmin.from('user_plans').insert({
        user_id: userId,
        workout_plan: fallbackPlan.workout_plan,
        nutrition_plan: fallbackPlan.nutrition_plan,
        macros: fallbackPlan.macros,
        is_active: true
      });

      if (planError) throw planError;

      console.log(`✅ [${i}/${count}] Successfully created user: ${email}`);
    } catch (error: any) {
      console.error(`❌ [${i}/${count}] Failed to create user ${email}:`, error.message);
    }
  }
  
  console.log('🎉 Seeding complete!');
}

seedUsers(100);
