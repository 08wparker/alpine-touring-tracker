import {
  collection,
  doc,
  getDocs,
  getDoc,
  writeBatch,
  setDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { StravaActivity } from './strava'
import { GeoPhoto } from './photoGeo'

interface UserMetadata {
  name: string
  profileImage: string
  lastSynced: Date
  totalActivities: number
}

// Convert StravaActivity to a flat Firestore-friendly object
function activityToFirestore(activity: StravaActivity): Record<string, unknown> {
  return {
    id: activity.id,
    name: activity.name,
    type: activity.type,
    sport_type: activity.sport_type,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    start_date: activity.start_date,
    start_date_local: activity.start_date_local,
    achievement_count: activity.achievement_count,
    kudos_count: activity.kudos_count,
    comment_count: activity.comment_count,
    athlete_count: activity.athlete_count,
    photo_count: activity.photo_count,
    summaryPolyline: activity.map?.summary_polyline || '',
    mapId: activity.map?.id || '',
    mapResourceState: activity.map?.resource_state || 0,
    startLat: activity.start_latlng?.[0] ?? null,
    startLng: activity.start_latlng?.[1] ?? null,
    endLat: activity.end_latlng?.[0] ?? null,
    endLng: activity.end_latlng?.[1] ?? null,
    location_city: activity.location_city || '',
    location_state: activity.location_state || '',
    location_country: activity.location_country || '',
    suffer_score: activity.suffer_score ?? null,
  }
}

// Convert Firestore doc back to StravaActivity
function firestoreToActivity(data: Record<string, unknown>): StravaActivity {
  return {
    id: data.id as number,
    name: data.name as string,
    type: data.type as string,
    sport_type: data.sport_type as string,
    distance: data.distance as number,
    moving_time: data.moving_time as number,
    elapsed_time: data.elapsed_time as number,
    total_elevation_gain: data.total_elevation_gain as number,
    start_date: data.start_date as string,
    start_date_local: data.start_date_local as string,
    achievement_count: data.achievement_count as number,
    kudos_count: data.kudos_count as number,
    comment_count: data.comment_count as number,
    athlete_count: data.athlete_count as number,
    photo_count: data.photo_count as number,
    map: {
      id: (data.mapId as string) || '',
      summary_polyline: (data.summaryPolyline as string) || '',
      resource_state: (data.mapResourceState as number) || 0,
    },
    start_latlng:
      data.startLat != null && data.startLng != null
        ? [data.startLat as number, data.startLng as number]
        : [0, 0],
    end_latlng:
      data.endLat != null && data.endLng != null
        ? [data.endLat as number, data.endLng as number]
        : [0, 0],
    location_city: (data.location_city as string) || '',
    location_state: (data.location_state as string) || '',
    location_country: (data.location_country as string) || '',
    suffer_score: data.suffer_score as number | undefined,
  }
}

// Save user metadata + all activities to Firestore
export async function saveUserActivities(
  userId: string,
  name: string,
  profileImage: string,
  activities: StravaActivity[]
): Promise<void> {
  // Save user metadata
  await setDoc(doc(db, 'users', userId), {
    name,
    profileImage,
    lastSynced: Timestamp.now(),
    totalActivities: activities.length,
  })

  // Batch write activities (max 500 per batch)
  const activitiesRef = collection(db, 'users', userId, 'activities')
  const batchSize = 500

  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = writeBatch(db)
    const chunk = activities.slice(i, i + batchSize)

    for (const activity of chunk) {
      const activityDoc = doc(activitiesRef, activity.id.toString())
      batch.set(activityDoc, activityToFirestore(activity))
    }

    await batch.commit()
  }
}

// Load all activities for a user from Firestore
export async function getUserActivities(userId: string): Promise<StravaActivity[] | null> {
  const meta = await getUserMetadata(userId)
  if (!meta) return null

  const activitiesRef = collection(db, 'users', userId, 'activities')
  const snapshot = await getDocs(activitiesRef)

  if (snapshot.empty) return null

  return snapshot.docs.map((doc) => firestoreToActivity(doc.data()))
}

// Get user metadata (check if user exists and when last synced)
export async function getUserMetadata(userId: string): Promise<UserMetadata | null> {
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (!userDoc.exists()) return null

  const data = userDoc.data()
  return {
    name: data.name,
    profileImage: data.profileImage,
    lastSynced: data.lastSynced.toDate(),
    totalActivities: data.totalActivities,
  }
}

// --- Photo CRUD ---

interface FirestorePhoto {
  userId: string
  uploaderName: string
  timestamp: string | null
  lat: number | null
  lng: number | null
  source: string
  caption: string
  storageUrl: string
  thumbnailUrl: string
  activityId: number | null
  region: string
  createdAt: Timestamp
}

function geoPhotoToFirestore(photo: GeoPhoto, region: string): FirestorePhoto {
  return {
    userId: photo.userId || '',
    uploaderName: photo.uploaderName,
    timestamp: photo.timestamp ? photo.timestamp.toISOString() : null,
    lat: photo.coordinates?.[0] ?? null,
    lng: photo.coordinates?.[1] ?? null,
    source: photo.source,
    caption: photo.caption,
    storageUrl: photo.storageUrl || '',
    thumbnailUrl: photo.thumbnailUrl || '',
    activityId: photo.activityId ?? null,
    region,
    createdAt: Timestamp.now(),
  }
}

function firestoreToGeoPhoto(id: string, data: FirestorePhoto): GeoPhoto {
  return {
    id,
    previewUrl: data.thumbnailUrl || data.storageUrl || '',
    timestamp: data.timestamp ? new Date(data.timestamp) : undefined,
    coordinates: data.lat != null && data.lng != null ? [data.lat, data.lng] : undefined,
    source: data.source as GeoPhoto['source'],
    caption: data.caption,
    uploaderName: data.uploaderName,
    storageUrl: data.storageUrl || undefined,
    thumbnailUrl: data.thumbnailUrl || undefined,
    activityId: data.activityId ?? undefined,
    region: data.region,
    userId: data.userId,
  }
}

export async function savePhoto(photo: GeoPhoto, region: string): Promise<void> {
  const photoDoc = doc(db, 'photos', photo.id)
  await setDoc(photoDoc, geoPhotoToFirestore(photo, region))
}

export async function getRegionPhotos(region: string): Promise<GeoPhoto[]> {
  const photosRef = collection(db, 'photos')
  const q = query(photosRef, where('region', '==', region))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(d => firestoreToGeoPhoto(d.id, d.data() as FirestorePhoto))
}

export async function deletePhoto(photoId: string): Promise<void> {
  await deleteDoc(doc(db, 'photos', photoId))
}

// --- Multi-user loading ---

export interface UserWithActivities {
  userId: string
  name: string
  profileImage: string
  activities: StravaActivity[]
}

export async function getAllUsersActivities(): Promise<UserWithActivities[]> {
  const usersSnapshot = await getDocs(collection(db, 'users'))
  if (usersSnapshot.empty) return []

  const results: UserWithActivities[] = []

  for (const userDoc of usersSnapshot.docs) {
    const meta = userDoc.data()
    const activitiesRef = collection(db, 'users', userDoc.id, 'activities')
    const activitiesSnapshot = await getDocs(activitiesRef)

    const activities = activitiesSnapshot.docs.map(d => firestoreToActivity(d.data()))

    results.push({
      userId: userDoc.id,
      name: meta.name,
      profileImage: meta.profileImage,
      activities,
    })
  }

  return results
}
