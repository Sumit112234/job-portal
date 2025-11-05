import cron from 'node-cron';
import connectDB from './mongodb.js';
import { JobAlert } from '../models/JobAlert.js';
import { Job } from '../models/Job.js';
import { sendJobAlertEmail } from './email.js';

// Run daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily job alerts...');
  
  try {
    await connectDB();
    
    const alerts = await JobAlert.find({ 
      isActive: true,
      frequency: 'daily'
    }).populate('user');

    for (const alert of alerts) {
      const query = {
        status: 'active',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      };

      if (alert.keywords && alert.keywords.length > 0) {
        query.$or = alert.keywords.map(keyword => ({
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
          ]
        }));
      }

      if (alert.location) {
        query.location = { $regex: alert.location, $options: 'i' };
      }

      if (alert.type) {
        query.type = alert.type;
      }

      if (alert.minSalary) {
        query['salary.min'] = { $gte: alert.minSalary };
      }

      const jobs = await Job.find(query)
        .populate('company')
        .limit(10);

      if (jobs.length > 0) {
        await sendJobAlertEmail(alert.user.email, jobs);
        console.log(`Sent ${jobs.length} jobs to ${alert.user.email}`);
      }
    }

    console.log('Daily job alerts completed');
  } catch (error) {
    console.error('Error running job alerts:', error);
  }
});

// Run weekly on Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('Running weekly job alerts...');
  
  try {
    await connectDB();
    
    const alerts = await JobAlert.find({ 
      isActive: true,
      frequency: 'weekly'
    }).populate('user');

    for (const alert of alerts) {
      const query = {
        status: 'active',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      };

      if (alert.keywords && alert.keywords.length > 0) {
        query.$or = alert.keywords.map(keyword => ({
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
          ]
        }));
      }

      if (alert.location) {
        query.location = { $regex: alert.location, $options: 'i' };
      }

      if (alert.type) {
        query.type = alert.type;
      }

      if (alert.minSalary) {
        query['salary.min'] = { $gte: alert.minSalary };
      }

      const jobs = await Job.find(query)
        .populate('company')
        .limit(20);

      if (jobs.length > 0) {
        await sendJobAlertEmail(alert.user.email, jobs);
        console.log(`Sent ${jobs.length} jobs to ${alert.user.email}`);
      }
    }

    console.log('Weekly job alerts completed');
  } catch (error) {
    console.error('Error running weekly job alerts:', error);
  }
});

export default cron;