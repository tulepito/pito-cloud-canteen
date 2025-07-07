import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/router';

import { convertDateToVNTimezone } from '@helpers/dateHelpers';
import type { FirebaseScannedRecord } from '@pages/admin/order/FirebaseScannedRecord';
import { firestore } from '@services/firebase';

import { ScannerUserListItem } from './ScannerUserListItem';

export const ScannerUserList = () => {
  const router = useRouter();
  const [barcodes, setBarcodes] = useState<FirebaseScannedRecord[]>([]);

  /**
   * Subscribe to the scanned records collection
   */
  useEffect(() => {
    const scannerRecordsRef = collection(
      firestore,
      process.env.NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME,
    );
    const q = query(
      scannerRecordsRef,
      where('planId', '==', router.query.planId),
      where(
        'timestamp',
        '==',
        !!router.query.timestamp && +router.query.timestamp,
      ),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBarcodes(
        snapshot.docs.map((_doc) => ({
          id: _doc.id,
          ...(_doc.data() as Omit<FirebaseScannedRecord, 'id'>),
        })),
      );
    });

    return () => unsubscribe();
  }, [router.query.planId, router.query.timestamp]);

  return (
    <div className="grid grid-cols-1 gap-4 mx-8">
      {!!barcodes.length &&
        barcodes
          .sort((a, b) => +b.scannedAt - +a.scannedAt)
          .map((barcode) => (
            <ScannerUserListItem
              key={barcode.barcode}
              userName={barcode.memberName}
              userAbbrName={barcode.memberAbbrName}
              userProfileImageUrl={barcode.memberProfileImageUrl}
              foodName={barcode.foodName}
              foodThumbnailUrl={barcode.foodThumbnailUrl}
              scannedAt={convertDateToVNTimezone(new Date(barcode.scannedAt), {
                format: 'HH:mm',
              })}
              state={barcode.state}
              onClick={() => {
                const scannedRecordRef = doc(
                  firestore,
                  process.env
                    .NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME,
                  barcode.id,
                );
                updateDoc(scannedRecordRef, {
                  state: barcode.state === 'live' ? 'offline' : 'live',
                });
              }}
            />
          ))}
      {!barcodes.length && (
        <div className="col-span-3 text-center">
          <img
            className="w-1/3 mx-auto opacity-50 grayscale"
            src="/static/scan-user-list-empty-illustration.png"
            alt="Chờ quét mã..."
          />
          <p className="text-lg text-gray-500 mt-4">
            Chờ quét mã từ người dùng...
          </p>
        </div>
      )}
    </div>
  );
};
