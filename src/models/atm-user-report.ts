import { Timestamp } from "firebase/firestore"

/* eslint-disable no-unused-vars */
export enum ATMUserReportKind {
  NO_CASH = 'NO_CASH',
  NOT_WORKING = 'NOT_WORKING',
  TOO_MUCH_PEOPLE = 'TOO_MUCH_PEOPLE',
  OTHER = 'OTHER',
}

export interface ATMUserReport {
  atmID: string
  kind: ATMUserReportKind
  description: string
  upvotes: number
  timestamp: Timestamp
}

export const generateDescriptionTitle = (alertKind: ATMUserReportKind) => {
  switch (alertKind) {
    case ATMUserReportKind.NOT_WORKING:
      return 'No está en funcionamiento'
    case ATMUserReportKind.NO_CASH:
      return 'Sin efectivo'
    case ATMUserReportKind.TOO_MUCH_PEOPLE:
      return 'Hay demasiadas personas'
    default:
      return 'Otro'
  }
}
