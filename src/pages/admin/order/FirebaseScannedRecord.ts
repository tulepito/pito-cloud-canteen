export interface FirebaseScannedRecord {
  id: string;
  planId: string;
  timestamp: number;
  barcode: string;
  memberProfileImageUrl?: string;
  memberName: string;
  memberAbbrName: string;
  foodName: string;
  foodThumbnailUrl?: string;
  groupId?: string;
  scannedAt: number;
  state: 'live' | 'offline';
  note?: string;
}
