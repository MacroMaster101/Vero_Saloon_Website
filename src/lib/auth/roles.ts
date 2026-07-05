// The four account roles, mirroring the profiles.role check in the DB.
// 'owner' is the shop owner: shop-ops powers plus their own stylist schedule.
export type Role = 'user' | 'staff' | 'admin' | 'owner';

// Staff work the chairs — they don't place customer bookings. Everyone else
// (including signed-out guests) may book.
export function roleCanBook(role: Role | null): boolean {
  return role !== 'staff';
}
