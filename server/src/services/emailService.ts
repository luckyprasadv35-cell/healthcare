import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendWorkoutReminder = async (email: string, workoutDetails: any, nutritionDetails: any) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set in environment variables. Email will not be sent.');
    return;
  }
  
  if (email.includes('@example.com')) {
    console.log(`Skipping email send for test user: ${email}`);
    return;
  }

  const workoutHTML = workoutDetails?.exercises?.map((ex: any) => 
    `<li><b>${ex.name}</b>: ${ex.sets} sets x ${ex.reps} (Rest: ${ex.rest_sec}s)</li>`
  ).join('') || '<li>Rest day!</li>';

  const mailOptions = {
    from: `"Vitalis AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Daily Health & Fitness Protocol - Vitalis AI',
    html: `
      <h2>Good Morning! Here is your plan for today:</h2>
      
      <h3>💪 Workout Focus: ${workoutDetails?.focus || 'Rest Day'}</h3>
      <ul>${workoutHTML}</ul>
      
      <h3>🥗 Nutrition Plan:</h3>
      <ul>
        ${nutritionDetails?.meals?.map((meal: any) => `<li><b>${meal.type}</b>: ${meal.description} (${meal.calories} kcal)</li>`).join('') || '<li>No specific meals generated.</li>'}
      </ul>
      
      <p>Log in to your dashboard to track your progress today!</p>
      <br>
      <p>Stay healthy,<br>The Vitalis AI Team</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
};
