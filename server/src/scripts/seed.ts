import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { connectDatabase } from '../config/database.js';
import { ActivityLog } from '../models/ActivityLog.model.js';
import { Comment } from '../models/Comment.model.js';
import { Property } from '../models/Property.model.js';
import { Ticket } from '../models/Ticket.model.js';
import { User } from '../models/User.model.js';

const SEED_PASSWORD = 'StrongPass123';

export const runSeed = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDatabase();

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      Property.deleteMany({}),
      User.deleteMany({}),
      Ticket.deleteMany({}),
      Comment.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

    console.log('🏢 Creating demo property...');
    const property = await Property.create({
      name: 'Skyline Heights',
      address: {
        line1: '100 Panorama Way',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
      },
      unitCount: 48,
      contactEmail: 'manager@tenantpro.com',
    });

    console.log('👥 Creating user accounts...');
    const manager = await User.create({
      name: 'Sarah Jenkins',
      email: 'manager@tenantpro.com',
      passwordHash,
      role: 'manager',
      property: property._id,
      isActive: true,
    });

    property.manager = manager._id;
    await property.save();

    const tenant1 = await User.create({
      name: 'Alex Rivera',
      email: 'tenant1@tenantpro.com',
      passwordHash,
      role: 'tenant',
      unitNumber: '4B',
      property: property._id,
      isActive: true,
    });

    const tenant2 = await User.create({
      name: 'Emily Chen',
      email: 'tenant2@tenantpro.com',
      passwordHash,
      role: 'tenant',
      unitNumber: '7A',
      property: property._id,
      isActive: true,
    });

    const techPlumber = await User.create({
      name: 'Marcus Vance',
      email: 'tech.plumbing@tenantpro.com',
      passwordHash,
      role: 'technician',
      specialization: 'Plumbing & Water Systems',
      property: property._id,
      isActive: true,
    });

    const techElectric = await User.create({
      name: 'David Miller',
      email: 'tech.electric@tenantpro.com',
      passwordHash,
      role: 'technician',
      specialization: 'Electrical & HVAC',
      property: property._id,
      isActive: true,
    });

    console.log('🎫 Generating sample tickets and workflows...');
    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 3600 * 1000);
    const oneDayAgo = new Date(now - 24 * 3600 * 1000);
    const threeDaysAgo = new Date(now - 72 * 3600 * 1000);

    // Ticket 1: Urgent Plumbing (Open)
    const ticket1 = await Ticket.create({
      title: 'Kitchen sink pipe leaking into cabinet',
      description: 'Water is dripping from the P-trap whenever the disposal runs. Have placed a bucket underneath to catch water.',
      category: 'plumbing',
      priority: 'high',
      status: 'open',
      location: 'Unit 4B - Kitchen Sink',
      imageUrls: [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      ],
      property: property._id,
      tenant: tenant1._id,
      createdAt: twoHoursAgo,
    });

    await ActivityLog.create({
      ticket: ticket1._id,
      actor: tenant1._id,
      type: 'ticket_created',
      description: 'Reported kitchen sink leak.',
    });

    // Ticket 2: Electrical Hazard (Assigned)
    const ticket2 = await Ticket.create({
      title: 'Master bedroom breaker tripping repeatedly',
      description: 'Plugging in the space heater causes the 15A bedroom breaker to immediately trip with a loud click.',
      category: 'electrical',
      priority: 'urgent',
      status: 'assigned',
      location: 'Unit 7A - Master Bedroom',
      imageUrls: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      ],
      property: property._id,
      tenant: tenant2._id,
      assignedTechnician: techElectric._id,
      createdAt: oneDayAgo,
    });

    await ActivityLog.create({
      ticket: ticket2._id,
      actor: tenant2._id,
      type: 'ticket_created',
      description: 'Reported breaker tripping issue.',
    });

    await ActivityLog.create({
      ticket: ticket2._id,
      actor: manager._id,
      type: 'ticket_assigned',
      description: `Assigned to ${techElectric.name}.`,
    });

    await Comment.create({
      ticket: ticket2._id,
      author: manager._id,
      message: 'David, please inspect the bedroom circuit breaker load today.',
    });

    await Comment.create({
      ticket: ticket2._id,
      author: techElectric._id,
      message: 'On it. Will drop by at 3:00 PM with a multimeter.',
    });

    // Ticket 3: HVAC (In Progress)
    const ticket3 = await Ticket.create({
      title: 'Central AC blowing room-temperature air',
      description: 'Thermostat displays 78°F while set to 70°F. Exterior condenser fan is running but compressor seems silent.',
      category: 'appliance',
      priority: 'high',
      status: 'in_progress',
      location: 'Unit 4B - Rooftop Unit #4',
      imageUrls: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
      ],
      property: property._id,
      tenant: tenant1._id,
      assignedTechnician: techElectric._id,
      createdAt: oneDayAgo,
    });

    await ActivityLog.create({
      ticket: ticket3._id,
      actor: tenant1._id,
      type: 'ticket_created',
      description: 'Tenant reported AC issue.',
    });

    await ActivityLog.create({
      ticket: ticket3._id,
      actor: manager._id,
      type: 'ticket_assigned',
      description: `Assigned to ${techElectric.name}.`,
    });

    await ActivityLog.create({
      ticket: ticket3._id,
      actor: techElectric._id,
      type: 'status_changed',
      description: 'Technician started inspection.',
    });

    // Ticket 4: Plumbing (Resolved)
    const ticket4 = await Ticket.create({
      title: 'Guest bathroom faucet cartridge leaking',
      description: 'Hot water valve had continuous steady drip, roughly 1 drop every 2 seconds.',
      category: 'plumbing',
      priority: 'medium',
      status: 'resolved',
      location: 'Unit 7A - Guest Bath',
      imageUrls: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      ],
      property: property._id,
      tenant: tenant2._id,
      assignedTechnician: techPlumber._id,
      resolvedAt: new Date(now - 5 * 3600 * 1000),
      createdAt: threeDaysAgo,
    });

    await ActivityLog.create({
      ticket: ticket4._id,
      actor: tenant2._id,
      type: 'ticket_created',
      description: 'Tenant reported leaky faucet valve.',
    });

    await ActivityLog.create({
      ticket: ticket4._id,
      actor: techPlumber._id,
      type: 'ticket_resolved',
      description: 'Replaced hot water ceramic cartridge and O-ring seal. Leak resolved.',
    });

    // Ticket 5: Security / Gate (Closed)
    const ticket5 = await Ticket.create({
      title: 'Courtyard electronic gate latch sticking',
      description: 'Magnetic gate lock on Gate B took multiple key fob attempts to disengage.',
      category: 'security',
      priority: 'high',
      status: 'closed',
      location: 'Courtyard Pedestrian Gate B',
      imageUrls: [],
      property: property._id,
      tenant: tenant1._id,
      assignedTechnician: techPlumber._id,
      resolvedAt: new Date(now - 20 * 3600 * 1000),
      createdAt: threeDaysAgo,
    });

    await ActivityLog.create({
      ticket: ticket5._id,
      actor: techPlumber._id,
      type: 'ticket_resolved',
      description: 'Cleaned magnetic contact strike plate and adjusted alignment.',
    });

    await ActivityLog.create({
      ticket: ticket5._id,
      actor: manager._id,
      type: 'ticket_closed',
      description: 'Ticket closed after tenant confirmed smooth gate operation.',
    });

    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('\n================ DEMO ACCOUNTS ================\n');
    console.table([
      { Role: 'Property Manager', Name: 'Sarah Jenkins', Email: 'manager@tenantpro.com', Password: SEED_PASSWORD, Unit: 'Office' },
      { Role: 'Tenant (Resident)', Name: 'Alex Rivera', Email: 'tenant1@tenantpro.com', Password: SEED_PASSWORD, Unit: 'Unit 4B' },
      { Role: 'Tenant (Resident)', Name: 'Emily Chen', Email: 'tenant2@tenantpro.com', Password: SEED_PASSWORD, Unit: 'Unit 7A' },
      { Role: 'Technician', Name: 'Marcus Vance', Email: 'tech.plumbing@tenantpro.com', Password: SEED_PASSWORD, Unit: 'Plumbing' },
      { Role: 'Technician', Name: 'David Miller', Email: 'tech.electric@tenantpro.com', Password: SEED_PASSWORD, Unit: 'Electrical' },
    ]);
    console.log('================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

void runSeed();
