import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, WorkoutSession, PersonalRecord } from './types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const docRef = doc(db, 'users', profile.uid);
  await setDoc(docRef, profile);
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, updates as Record<string, unknown>);
}

export async function createWorkoutSession(session: WorkoutSession): Promise<void> {
  const docRef = doc(db, 'workoutSessions', session.id);
  await setDoc(docRef, session);
}

export async function getWorkoutSessions(
  userId: string,
  limitCount: number = 20
): Promise<WorkoutSession[]> {
  try {
    const sessionsRef = collection(db, 'workoutSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      firestoreLimit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => d.data() as WorkoutSession);
  } catch (error) {
    console.error('Error getting workout sessions:', error);
    return [];
  }
}

export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  try {
    const prsRef = collection(db, 'personalRecords');
    const q = query(prsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => d.data() as PersonalRecord);
  } catch (error) {
    console.error('Error getting personal records:', error);
    return [];
  }
}

export async function updatePersonalRecord(
  userId: string,
  record: PersonalRecord
): Promise<void> {
  const docId = `${userId}_${record.exerciseId}`;
  const docRef = doc(db, 'personalRecords', docId);
  await setDoc(docRef, { ...record, userId });
}

export async function getWeeklyVolume(userId: string): Promise<number> {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const sessionsRef = collection(db, 'workoutSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('date', '>=', weekAgoStr),
      where('completed', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce((total, d) => {
      const session = d.data() as WorkoutSession;
      return total + (session.totalVolume || 0);
    }, 0);
  } catch (error) {
    console.error('Error getting weekly volume:', error);
    return 0;
  }
}
