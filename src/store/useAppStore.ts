import { create } from 'zustand';

export type FeedPost = {
  id: string;
  userName: string;
  userAvatar: string;
  placeName: string;
  neighborhood: string;
  timeAgo: string;
  points: number;
  image: string;
  text: string;
  likes: number;
  comments: number;
};

type PointsReason = 'checkin' | 'review' | 'qr';

const POINTS_BY_REASON: Record<PointsReason, number> = {
  checkin: 50,
  review: 30,
  qr: 75,
};

type AppState = {
  points: number;
  petName: string;
  ownerName: string;
  feed: FeedPost[];
  addPoints: (reason: PointsReason) => void;
  addFeedPost: (post: FeedPost) => void;
};

export const useAppStore = create<AppState>((set) => ({
  points: 240,
  petName: 'Tita',
  ownerName: 'Pachi',
  feed: [],
  addPoints: (reason) =>
    set((state) => ({ points: state.points + POINTS_BY_REASON[reason] })),
  addFeedPost: (post) =>
    set((state) => ({ feed: [post, ...state.feed] })),
}));
