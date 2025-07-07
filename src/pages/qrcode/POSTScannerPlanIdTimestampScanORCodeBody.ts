export interface POSTScannerPlanIdTimestampScanQRcodeBody {
  code: string;
  groupId?: string;
}

export interface POSTScannerParticipantScanQRcodeBody {
  currentUserId: string;
  timestamp: string;
  groupId?: string;
}
