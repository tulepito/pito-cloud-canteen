export interface POSTScannerPlanIdTimestampScanQRcodeBody {
  code: string;
  groupId?: string;
  screen?: string;
}

export interface POSTScannerParticipantScanQRcodeBody {
  currentUserId: string;
  timestamp: string;
  groupId?: string;
  screen?: string;
}
