export type MockBooking = {
  id: string;
  experience_id: string;
  slot_id: string;
  date: string;
  time: string;
  participants: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  price: number;
};

export const mockBookings: MockBooking[] = [
  {
    id: 'booking_001',
    experience_id: 'exp_001',
    slot_id: 's_001_1',
    date: '2025-10-01',
    time: '14:00-15:00',
    participants: 1,
    status: 'confirmed',
    created_at: '2025-09-20',
    price: 1500
  },
  {
    id: 'booking_002',
    experience_id: 'exp_004',
    slot_id: 's_004_1',
    date: '2025-10-05',
    time: '10:00-11:00',
    participants: 1,
    status: 'confirmed',
    created_at: '2025-09-22',
    price: 2500
  },
  {
    id: 'booking_003',
    experience_id: 'exp_002',
    slot_id: 's_002_1',
    date: '2025-10-08',
    time: '15:00-16:00',
    participants: 1,
    status: 'confirmed',
    created_at: '2025-09-01',
    price: 1800
  },
  {
    id: 'booking_004',
    experience_id: 'exp_003',
    slot_id: 's_003_1',
    date: '2025-10-12',
    time: '13:00-14:00',
    participants: 1,
    status: 'confirmed',
    created_at: '2025-09-23',
    price: 2000
  },
  {
    id: 'booking_005',
    experience_id: 'exp_005',
    slot_id: 's_005_1',
    date: '2025-10-15',
    time: '16:00-17:00',
    participants: 1,
    status: 'confirmed',
    created_at: '2025-09-24',
    price: 1200
  },
  {
    id: 'booking_006',
    experience_id: 'exp_006',
    slot_id: 's_006_1',
    date: '2025-09-15',
    time: '11:00-12:00',
    participants: 1,
    status: 'completed',
    created_at: '2025-09-01',
    price: 2200
  }
];

export function findMockBooking(id?: string | null) {
  if (!id) return null;
  return mockBookings.find((b) => b.id === id) || null;
}
