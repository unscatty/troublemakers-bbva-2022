import {
  FirebaseApp,
  FirebaseAppSettings,
  FirebaseOptions,
  initializeApp,
} from 'firebase/app'
import {
  collection,
  CollectionReference,
  doc,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore'
import { ATMUserReport } from '../models/atm-user-report'

const ENV = import.meta.env

// Your web app's Firebase configuration
export const defaultFirebaseConfig = {
  apiKey: ENV.VITE_FIREBASE_API_KEY,
  authDomain: ENV.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.VITE_FIREBASE_PROJECT_ID,
  storageBucket: ENV.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.VITE_FIREBASE_APP_ID,
}

export default class FirestoreService {
  app: FirebaseApp
  db: Firestore

  userReportsCollection: CollectionReference<ATMUserReport>

  constructor(options: FirebaseOptions, config?: FirebaseAppSettings) {
    this.app = initializeApp(options, config)
    this.db = getFirestore(this.app)

    this.userReportsCollection = collection(
      this.db,
      'user-reports'
    ) as CollectionReference<ATMUserReport>
  }

  async getAllUserReports() {
    const docs = await getDocs(this.userReportsCollection)

    return docs.docs
  }

  async getAllReportsForAtm(atmID: number | string) {
    const reportsInAtmQuery = query(
      this.userReportsCollection,
      where('atmID', '==', atmID),
      // Order by upvotes first
      orderBy('upvotes', 'desc'),
      // Then order by date
      orderBy('timestamp', 'desc')
    )

    const docs = await getDocs(reportsInAtmQuery)

    return docs.docs
  }

  async addUserReport(report: Partial<ATMUserReport>) {
    report.timestamp = Timestamp.now()
    report.upvotes = 0
    // Document id gets generated automatically
    return setDoc(doc(this.userReportsCollection), report)
  }

  private async increaseVotes(reportID: string, increase: number) {
    const reportDoc = doc(this.userReportsCollection, reportID)
    const previousDoc = (await getDoc(reportDoc)).data()

    if (!previousDoc) return

    const previousUpvotes = previousDoc.upvotes

    // Update document
    setDoc(reportDoc, {
      ...previousDoc,
      upvotes: previousUpvotes + increase,
    })
  }

  async upvoteUserReport(reportID: string) {
    return this.increaseVotes(reportID, 1)
  }

  async downvoteUserReport(reportID: string) {
    return this.increaseVotes(reportID, -1)
  }

  setOnReportsUpdate(
    atmID: number | string,
    // eslint-disable-next-line no-unused-vars
    onNext: (snapshot: QuerySnapshot<ATMUserReport>) => void
  ) {
    const reportsInAtmQuery = query(
      this.userReportsCollection,
      where('atmID', '==', atmID),
      // Order by upvotes first
      orderBy('upvotes', 'desc'),
      // Then order by date
      orderBy('timestamp', 'desc')
    )

    return onSnapshot(reportsInAtmQuery, onNext)
  }
}

export const defaultFirestoreService = new FirestoreService(
  defaultFirebaseConfig
)
