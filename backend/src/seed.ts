import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.booking.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const password = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@university.edu',
      password,
      phone: '+1-555-0101',
      isStudent: true,
      university: 'University of Toronto',
      bio: 'CS student who loves road trips and meeting new people!',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@gmail.com',
      password,
      phone: '+1-555-0102',
      isStudent: false,
      bio: 'Regular commuter, always on time.',
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: 'Carol Davis',
      email: 'carol@college.edu',
      password,
      phone: '+1-555-0103',
      isStudent: true,
      university: 'McGill University',
      bio: 'Engineering student, love carpooling to save money!',
    },
  });

  const dave = await prisma.user.create({
    data: {
      name: 'Dave Wilson',
      email: 'dave@example.com',
      password,
      phone: '+1-555-0104',
      isStudent: false,
      bio: 'Frequent traveler between Toronto and Montreal.',
    },
  });

  const emma = await prisma.user.create({
    data: {
      name: 'Emma Brown',
      email: 'emma@mit.edu',
      password,
      phone: '+1-555-0105',
      isStudent: true,
      university: 'MIT',
      bio: 'Physics student, happy to share rides around campus!',
    },
  });

  console.log('✅ Users created');

  // Create rides
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Long distance rides
  const ride1 = await prisma.ride.create({
    data: {
      driverId: bob.id,
      fromCity: 'Toronto',
      toCity: 'Montreal',
      fromAddress: 'Union Station, Toronto',
      toAddress: 'Gare Centrale, Montreal',
      departureDate: new Date(tomorrow.setHours(8, 0, 0, 0)),
      seats: 3,
      seatsLeft: 3,
      pricePerSeat: 45,
      rideType: 'LONG_DISTANCE',
      description: 'Comfortable SUV, stopping at Kingston for a break. Non-smoker, no pets please.',
    },
  });

  const ride2 = await prisma.ride.create({
    data: {
      driverId: dave.id,
      fromCity: 'Montreal',
      toCity: 'Ottawa',
      fromAddress: 'Berri-UQAM Metro, Montreal',
      toAddress: 'Rideau Centre, Ottawa',
      departureDate: new Date(dayAfter.setHours(9, 30, 0, 0)),
      seats: 2,
      seatsLeft: 2,
      pricePerSeat: 30,
      rideType: 'LONG_DISTANCE',
      description: 'Direct route, no stops. Music welcome!',
    },
  });

  const ride3 = await prisma.ride.create({
    data: {
      driverId: alice.id,
      fromCity: 'Toronto',
      toCity: 'Waterloo',
      fromAddress: 'Bloor-Yonge Station, Toronto',
      toAddress: 'University of Waterloo',
      departureDate: new Date(nextWeek.setHours(7, 0, 0, 0)),
      seats: 4,
      seatsLeft: 4,
      pricePerSeat: 20,
      rideType: 'LONG_DISTANCE',
      description: 'Weekly trip to Waterloo. Students preferred but all welcome!',
    },
  });

  // Short distance / campus rides (student only)
  const ride4 = await prisma.ride.create({
    data: {
      driverId: alice.id,
      fromCity: 'Toronto',
      toCity: 'Scarborough',
      fromAddress: 'St. George Campus, U of T',
      toAddress: 'UTSC Campus, Scarborough',
      departureDate: new Date(tomorrow.setHours(10, 0, 0, 0)),
      seats: 3,
      seatsLeft: 3,
      pricePerSeat: 8,
      rideType: 'SHORT_DISTANCE',
      description: 'Quick ride between U of T campuses. Students only!',
    },
  });

  const ride5 = await prisma.ride.create({
    data: {
      driverId: carol.id,
      fromCity: 'Montreal',
      toCity: 'Laval',
      fromAddress: 'McGill University, Montreal',
      toAddress: 'Laval University',
      departureDate: new Date(dayAfter.setHours(14, 0, 0, 0)),
      seats: 2,
      seatsLeft: 2,
      pricePerSeat: 10,
      rideType: 'SHORT_DISTANCE',
      description: 'Heading to Laval for a study group. Fellow students welcome!',
    },
  });

  const ride6 = await prisma.ride.create({
    data: {
      driverId: emma.id,
      fromCity: 'Cambridge',
      toCity: 'Boston',
      fromAddress: 'MIT Campus, Cambridge',
      toAddress: 'South Station, Boston',
      departureDate: new Date(tomorrow.setHours(16, 0, 0, 0)),
      seats: 3,
      seatsLeft: 3,
      pricePerSeat: 12,
      rideType: 'SHORT_DISTANCE',
      description: 'Heading downtown after classes. MIT/Harvard students welcome!',
    },
  });

  console.log('✅ Rides created');

  // Create some bookings
  await prisma.booking.create({
    data: {
      rideId: ride1.id,
      userId: alice.id,
      seats: 1,
      status: 'CONFIRMED',
    },
  });
  await prisma.ride.update({
    where: { id: ride1.id },
    data: { seatsLeft: { decrement: 1 } },
  });

  await prisma.booking.create({
    data: {
      rideId: ride1.id,
      userId: carol.id,
      seats: 1,
      status: 'CONFIRMED',
    },
  });
  await prisma.ride.update({
    where: { id: ride1.id },
    data: { seatsLeft: { decrement: 1 } },
  });

  await prisma.booking.create({
    data: {
      rideId: ride3.id,
      userId: emma.id,
      seats: 2,
      status: 'CONFIRMED',
    },
  });
  await prisma.ride.update({
    where: { id: ride3.id },
    data: { seatsLeft: { decrement: 2 } },
  });

  await prisma.booking.create({
    data: {
      rideId: ride4.id,
      userId: carol.id,
      seats: 1,
      status: 'CONFIRMED',
    },
  });
  await prisma.ride.update({
    where: { id: ride4.id },
    data: { seatsLeft: { decrement: 1 } },
  });

  console.log('✅ Bookings created');

  console.log('\n🎉 Seed complete! Test accounts:');
  console.log('  Student: alice@university.edu / password123');
  console.log('  Student: carol@college.edu / password123');
  console.log('  Student: emma@mit.edu / password123');
  console.log('  Regular: bob@gmail.com / password123');
  console.log('  Regular: dave@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
