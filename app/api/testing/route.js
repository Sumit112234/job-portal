import connectDB from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { Job } from '@/models/Job';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET()  {
  try {
    await connectDB();
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@jobportal.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });

    const employer1 = await User.create({
      name: 'John Smith',
      email: 'employer@techcorp.com',
      password: hashedPassword,
      role: 'employer',
      phone: '+1 234-567-8900',
      location: 'San Francisco, CA',
      isVerified: true,
    });

    const employer2 = await User.create({
      name: 'Sarah Johnson',
      email: 'hr@innovatelabs.com',
      password: hashedPassword,
      role: 'employer',
      phone: '+1 234-567-8901',
      location: 'New York, NY',
      isVerified: true,
    });

    const seeker1 = await User.create({
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      password: hashedPassword,
      role: 'seeker',
      phone: '+1 234-567-8902',
      location: 'Los Angeles, CA',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      experience: '5 years',
      isVerified: true,
    });

    const seeker2 = await User.create({
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      password: hashedPassword,
      role: 'seeker',
      phone: '+1 234-567-8903',
      location: 'Austin, TX',
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      experience: '3 years',
      isVerified: true,
    });

    console.log('✅ Created users');

    // Create Companies
    const techCorp = await Company.create({
      name: 'TechCorp Inc',
      description: 'Leading technology company specializing in AI and machine learning solutions for enterprises.',
      logo: '🚀',
      website: 'https://techcorp.com',
      location: 'San Francisco, CA',
      size: '1000-5000',
      industry: 'Technology',
      owner: employer1._id,
      isVerified: true,
    });

    const innovateLabs = await Company.create({
      name: 'InnovateLabs',
      description: 'Innovative startup building the future of SaaS products with cutting-edge technology.',
      logo: '💡',
      website: 'https://innovatelabs.com',
      location: 'New York, NY',
      size: '50-200',
      industry: 'Software',
      owner: employer2._id,
      isVerified: true,
    });

    const designStudio = await Company.create({
      name: 'DesignStudio',
      description: 'Creative agency delivering exceptional design experiences for global brands.',
      logo: '🎨',
      website: 'https://designstudio.com',
      location: 'Remote',
      size: '10-50',
      industry: 'Design',
      owner: employer1._id,
      isVerified: true,
    });

    const dataViz = await Company.create({
      name: 'DataViz Co',
      description: 'Data analytics and visualization platform helping businesses make data-driven decisions.',
      logo: '📊',
      website: 'https://dataviz.com',
      location: 'Austin, TX',
      size: '200-500',
      industry: 'Analytics',
      owner: employer2._id,
      isVerified: true,
    });

    const cloudTech = await Company.create({
      name: 'CloudTech',
      description: 'Cloud infrastructure provider offering scalable solutions for modern applications.',
      logo: '☁️',
      website: 'https://cloudtech.com',
      location: 'Seattle, WA',
      size: '500-1000',
      industry: 'Cloud Computing',
      owner: employer1._id,
      isVerified: true,
    });

    console.log('✅ Created companies');

    // Update users with companies
    await User.findByIdAndUpdate(employer1._id, { company: techCorp._id });
    await User.findByIdAndUpdate(employer2._id, { company: innovateLabs._id });

    // Create Jobs
    const jobs = [
      {
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer to join our frontend team. You will work on building scalable web applications using modern technologies and best practices.',
        requirements: '• 5+ years of experience with React and JavaScript\n• Strong knowledge of TypeScript\n• Experience with state management (Redux, Context API)\n• Familiarity with modern build tools (Webpack, Vite)\n• Excellent problem-solving skills',
        benefits: '• Competitive salary and equity\n• Health, dental, and vision insurance\n• Flexible work hours and remote options\n• Professional development budget\n• Modern office with great amenities',
        company: techCorp._id,
        location: 'San Francisco, CA',
        salary: { min: 120000, max: 150000, currency: 'USD' },
        type: 'full-time',
        experience: '5+ years',
        category: 'Software Development',
        skills: ['React', 'TypeScript', 'Node.js', 'Redux', 'GraphQL'],
        status: 'active',
        featured: true,
        views: 245,
        applicationCount: 12,
      },
      {
        title: 'Product Manager',
        description: 'Join our product team to lead the development of innovative SaaS products. You will work closely with engineering, design, and business teams to deliver exceptional user experiences.',
        requirements: '• 3-5 years of product management experience\n• Strong analytical and communication skills\n• Experience with agile methodologies\n• Technical background is a plus\n• Proven track record of successful product launches',
        benefits: '• Competitive compensation package\n• Stock options\n• Remote-first culture\n• Unlimited PTO\n• Learning and development opportunities',
        company: innovateLabs._id,
        location: 'New York, NY',
        salary: { min: 100000, max: 130000, currency: 'USD' },
        type: 'full-time',
        experience: '3-5 years',
        category: 'Product Management',
        skills: ['Product Strategy', 'Agile', 'User Research', 'SQL', 'Analytics'],
        status: 'active',
        featured: true,
        views: 189,
        applicationCount: 8,
      },
      {
        title: 'UX/UI Designer',
        description: 'Create beautiful and intuitive user experiences for web and mobile applications. Work with a talented design team on exciting projects for global brands.',
        requirements: '• 2-4 years of UX/UI design experience\n• Proficiency in Figma and Adobe Creative Suite\n• Strong portfolio demonstrating design skills\n• Understanding of user-centered design principles\n• Experience with design systems',
        benefits: '• Competitive salary\n• Remote work flexibility\n• Creative freedom\n• Latest design tools and equipment\n• Collaborative team environment',
        company: designStudio._id,
        location: 'Remote',
        salary: { min: 80000, max: 100000, currency: 'USD' },
        type: 'full-time',
        experience: '2-4 years',
        category: 'Design',
        skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
        status: 'active',
        featured: false,
        views: 156,
        applicationCount: 15,
      },
      {
        title: 'Data Scientist',
        description: 'Analyze complex data sets and build machine learning models to drive business insights. Work on challenging problems in data analytics and visualization.',
        requirements: '• 4+ years of data science experience\n• Strong Python and SQL skills\n• Experience with ML frameworks (TensorFlow, PyTorch)\n• Statistical analysis expertise\n• PhD or Masters in related field preferred',
        benefits: '• Excellent compensation\n• Cutting-edge technology stack\n• Conference and training budget\n• Health and wellness programs\n• Collaborative research environment',
        company: dataViz._id,
        location: 'Austin, TX',
        salary: { min: 110000, max: 140000, currency: 'USD' },
        type: 'full-time',
        experience: '4+ years',
        category: 'Data Science',
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
        status: 'active',
        featured: false,
        views: 198,
        applicationCount: 6,
      },
      {
        title: 'DevOps Engineer',
        description: 'Build and maintain cloud infrastructure for scalable applications. Implement CI/CD pipelines and ensure system reliability and performance.',
        requirements: '• 3+ years of DevOps experience\n• Strong knowledge of AWS/Azure/GCP\n• Experience with Docker and Kubernetes\n• Proficiency in scripting (Bash, Python)\n• Understanding of security best practices',
        benefits: '• Competitive salary\n• Cloud certifications support\n• Flexible schedule\n• Latest tools and technologies\n• Growth opportunities',
        company: cloudTech._id,
        location: 'Seattle, WA',
        salary: { min: 115000, max: 145000, currency: 'USD' },
        type: 'contract',
        experience: '3+ years',
        category: 'DevOps',
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
        status: 'active',
        featured: false,
        views: 167,
        applicationCount: 9,
      },
      {
        title: 'Frontend Developer',
        description: 'Build responsive and performant web applications using modern frontend technologies. Collaborate with designers to implement pixel-perfect UIs.',
        requirements: '• 2+ years of frontend development experience\n• Proficiency in HTML, CSS, JavaScript\n• Experience with React or Vue.js\n• Understanding of responsive design\n• Good communication skills',
        benefits: '• Competitive pay\n• Remote work options\n• Team events and outings\n• Learning budget\n• Casual work environment',
        company: techCorp._id,
        location: 'San Francisco, CA',
        salary: { min: 90000, max: 120000, currency: 'USD' },
        type: 'full-time',
        experience: '2+ years',
        category: 'Frontend Development',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design'],
        status: 'active',
        featured: false,
        views: 134,
        applicationCount: 18,
      },
      {
        title: 'Backend Developer',
        description: 'Design and implement robust backend systems and APIs. Work on high-scale distributed systems.',
        requirements: '• 3+ years backend development\n• Node.js or Python expertise\n• Database design skills\n• API development experience\n• Problem-solving abilities',
        benefits: '• Great salary\n• Stock options\n• Health benefits\n• Learning opportunities\n• Team collaboration',
        company: innovateLabs._id,
        location: 'Remote',
        salary: { min: 95000, max: 125000, currency: 'USD' },
        type: 'full-time',
        experience: '3+ years',
        category: 'Backend Development',
        skills: ['Node.js', 'MongoDB', 'Express', 'REST APIs', 'GraphQL'],
        status: 'active',
        featured: false,
        views: 112,
        applicationCount: 14,
      },
    ];

    await Job.insertMany(jobs);
    console.log('✅ Created jobs');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Companies: ${await Company.countDocuments()}`);
    console.log(`   Jobs: ${await Job.countDocuments()}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@jobportal.com / password123');
    console.log('   Employer: employer@techcorp.com / password123');
    console.log('   Job Seeker: jane.doe@email.com / password123');
    console.log('\n✨ You can now login and explore the platform!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}


export async function PUT() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find all companies where owner is not an array
    const companies = await Company.find({});
    
    let migratedCount = 0;
    let alreadyArrayCount = 0;

    for (const company of companies) {

      console.log(`Checking company: ${company.owner} `);
      
        // Convert single owner to array
        const singleOwner = company.owner;
        company.owner = singleOwner ? [singleOwner] : [];
        await company.save();
        migratedCount++;
        console.log(`Migrated company: ${company.name} (ID: ${company._id})`);
     
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Total companies: ${companies.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Already arrays: ${alreadyArrayCount}`);
    
    // process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

