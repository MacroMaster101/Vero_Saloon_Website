// The four account roles, mirroring the profiles.role check in the DB.
// 'owner' is the shop owner: shop-ops powers plus their own stylist schedule.
export type Role = 'user' | 'staff' | 'admin' | 'owner';
