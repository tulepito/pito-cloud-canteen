import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

import { convertDateToVNTimezone } from '@helpers/dateHelpers';
import type { FirebaseScannedRecord } from '@pages/admin/order/FirebaseScannedRecord';
import { firestore } from '@services/firebase';

import { removeVietnameseTones } from './ScannerInputForm';
import { ScannerUserListItem } from './ScannerUserListItem';

interface ScannerUserListProps {
  searchValue?: string;
  resetSearchInput: () => void;
}

export const ScannerUserList = ({
  searchValue = '',
  resetSearchInput,
}: ScannerUserListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [barcodes, setBarcodes] = useState<FirebaseScannedRecord[]>([]);
  const [allBarcodes, setAllBarcodes] = useState<FirebaseScannedRecord[]>([]);

  const [lastUpdate, setLastUpdate] = useState<string>('');

  const { groupId } = router.query;
  const screen = searchParams.get('screen') || undefined;

  const now = React.useMemo(() => new Date(), []);

  const timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    .getTime()
    .toString();

  // useEffect để lấy chỉ các records live (cho hiển thị danh sách)
  useEffect(() => {
    if (!router.query.planId || !timestamp) return;

    const scannerRecordsRef = collection(
      firestore,
      process.env.NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME!,
    );

    const conditions = [
      where('planId', '==', router.query.planId),
      where('timestamp', '==', +timestamp),
      where('state', '==', 'live'),
    ];

    if (groupId) {
      conditions.push(where('groupId', '==', groupId));
    }

    if (screen) {
      conditions.push(where('screen', '==', screen));
    }

    const q = query(scannerRecordsRef, ...conditions);

    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        setLastUpdate(now.toLocaleTimeString());

        const newBarcodes = snapshot.docs.map((_doc) => ({
          id: _doc.id,
          ...(_doc.data() as Omit<FirebaseScannedRecord, 'id'>),
        }));

        const limitedBarcodes = newBarcodes.sort(
          (a, b) => +a.scannedAt - +b.scannedAt,
        );

        setAllBarcodes(limitedBarcodes);
      },
      error: (error) => {
        console.error('Firestore error:', error);
      },
    });

    return () => unsubscribe();
  }, [router.query.planId, timestamp, groupId, screen, now]);

  useEffect(() => {
    if (!searchValue) {
      setBarcodes(allBarcodes);

      return;
    }

    const keyword = removeVietnameseTones(searchValue.trim().toLowerCase());

    const filtered = allBarcodes.filter((barcode) => {
      const name = removeVietnameseTones(
        barcode.memberName?.toLowerCase() || '',
      );

      return name.includes(keyword);
    });

    setBarcodes(filtered);
  }, [searchValue, allBarcodes]);

  return (
    <div className="grid grid-cols-1 gap-12 p-4 md:px-8 mx-auto md:py-8 w-full">
      <div className="text-xs text-gray-400 mb-2 hidden">
        Last update: {lastUpdate} | Items: {barcodes.length}
      </div>

      {
        <div className="flex flex-col gap-4 md:gap-10 w-full">
          <AnimatePresence mode="popLayout">
            {!!barcodes.length &&
              barcodes.map((barcode) => (
                <ScannerUserListItem
                  key={barcode.id}
                  userName={barcode.memberName}
                  userAbbrName={barcode.memberAbbrName}
                  userProfileImageUrl={barcode.memberProfileImageUrl}
                  foodName={barcode.foodName}
                  foodThumbnailUrl={barcode.foodThumbnailUrl}
                  scannedAt={convertDateToVNTimezone(
                    new Date(barcode.scannedAt),
                    {
                      format: 'HH:mm',
                    },
                  )}
                  state={barcode.state}
                  note={barcode?.note}
                  onClick={async () => {
                    const scannedRecordRef = doc(
                      firestore,
                      process.env
                        .NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME!,
                      barcode.id,
                    );

                    try {
                      const docSnap = await getDoc(scannedRecordRef);

                      if (docSnap.exists()) {
                        await updateDoc(scannedRecordRef, {
                          state: barcode.state === 'live' ? 'offline' : 'live',
                        });
                      }
                    } catch (error) {
                      console.error('Error updating document:', error);
                    }

                    resetSearchInput();
                  }}
                />
              ))}
          </AnimatePresence>
          {!barcodes.length && (
            <div className="col-span-3 text-center mt-[20%]">
              <img
                className="w-1/3 mx-auto opacity-50 grayscale"
                src="/static/scan-user-list-empty-illustration.webp"
                alt="Chờ quét mã..."
              />
              <p className="text-lg text-gray-500 mt-4">
                Chờ quét mã từ người dùng...
              </p>
            </div>
          )}
        </div>
      }
    </div>
  );
};
