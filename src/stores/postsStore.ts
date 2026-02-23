import { create } from 'zustand';
import { Post, Comment } from '../types';
import api from '../services/api';
import { MOCK_POSTS, MOCK_COMMENTS } from '../services/mockData';

const DEMO_MODE = true;

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  comments: Comment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingComments: boolean;
  isCreating: boolean;
  currentPage: number;
  hasMore: boolean;
  error: string | null;

  fetchPosts: (refresh?: boolean) => Promise<void>;
  fetchMorePosts: () => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (content: string, image?: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  clearCurrentPost: () => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  currentPost: null,
  comments: [],
  isLoading: false,
  isLoadingMore: false,
  isLoadingComments: false,
  isCreating: false,
  currentPage: 1,
  hasMore: true,
  error: null,

  fetchPosts: async (refresh = false) => {
    if (refresh) {
      set({ isLoading: true, currentPage: 1 });
    } else if (get().isLoading) {
      return;
    } else {
      set({ isLoading: true });
    }

    if (DEMO_MODE) {
      set({
        posts: MOCK_POSTS,
        currentPage: 1,
        hasMore: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      const response = await api.getPosts(1);
      set({
        posts: response.data,
        currentPage: 1,
        hasMore: response.meta ? response.meta.current_page < response.meta.total_pages : true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // Fallback to mock data on error
      set({
        posts: MOCK_POSTS,
        currentPage: 1,
        hasMore: false,
        isLoading: false,
        error: null,
      });
    }
  },

  fetchMorePosts: async () => {
    if (DEMO_MODE) return;

    const { isLoadingMore, hasMore, currentPage } = get();
    if (isLoadingMore || !hasMore) return;

    set({ isLoadingMore: true });
    try {
      const nextPage = currentPage + 1;
      const response = await api.getPosts(nextPage);
      set((state) => ({
        posts: [...state.posts, ...response.data],
        currentPage: nextPage,
        hasMore: response.meta ? response.meta.current_page < response.meta.total_pages : response.data.length > 0,
        isLoadingMore: false,
      }));
    } catch (error) {
      set({ isLoadingMore: false });
    }
  },

  fetchPost: async (id: string) => {
    set({ isLoading: true });

    if (DEMO_MODE) {
      const post = MOCK_POSTS.find((p) => p.id === id) || null;
      set({ currentPost: post, isLoading: false });
      return;
    }

    try {
      const post = await api.getPost(id);
      set({ currentPost: post, isLoading: false });
    } catch (error: any) {
      const post = MOCK_POSTS.find((p) => p.id === id) || null;
      set({ currentPost: post, isLoading: false });
    }
  },

  createPost: async (content: string, image?: string) => {
    set({ isCreating: true, error: null });

    if (DEMO_MODE) {
      const newPost: Post = {
        id: String(Date.now()),
        content,
        image_url: image || null,
        author: { id: '1', first_name: 'Renaud', last_name: 'Cosson', avatar_url: 'https://i.pravatar.cc/300?img=12', apartment_number: '4B' },
        likes_count: 0,
        comments_count: 0,
        liked: false,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        posts: [newPost, ...state.posts],
        isCreating: false,
      }));
      return;
    }

    try {
      const newPost = await api.createPost({ content, image });
      set((state) => ({
        posts: [newPost, ...state.posts],
        isCreating: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors de la création de la publication',
        isCreating: false,
      });
      throw error;
    }
  },

  toggleLike: async (postId: string) => {
    const { posts, currentPost } = get();
    const post = posts.find((p) => p.id === postId) || currentPost;
    if (!post) return;

    const wasLiked = post.liked ?? post.liked_by_me ?? false;

    // Optimistic update
    const updatePost = (p: Post): Post =>
      p.id === postId
        ? {
            ...p,
            liked: !wasLiked,
            liked_by_me: !wasLiked,
            likes_count: wasLiked ? p.likes_count - 1 : p.likes_count + 1,
          }
        : p;

    set((state) => ({
      posts: state.posts.map(updatePost),
      currentPost: state.currentPost?.id === postId ? updatePost(state.currentPost) : state.currentPost,
    }));

    if (DEMO_MODE) return;

    try {
      if (wasLiked) {
        await api.unlikePost(postId);
      } else {
        await api.likePost(postId);
      }
    } catch (error) {
      // Revert on error
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked: wasLiked,
                liked_by_me: wasLiked,
                likes_count: wasLiked ? p.likes_count + 1 : p.likes_count - 1,
              }
            : p
        ),
        currentPost:
          state.currentPost?.id === postId
            ? {
                ...state.currentPost,
                liked: wasLiked,
                liked_by_me: wasLiked,
                likes_count: wasLiked ? state.currentPost.likes_count + 1 : state.currentPost.likes_count - 1,
              }
            : state.currentPost,
      }));
    }
  },

  fetchComments: async (postId: string) => {
    set({ isLoadingComments: true });

    if (DEMO_MODE) {
      const comments = MOCK_COMMENTS.filter((c) => c.post_id === postId);
      set({ comments, isLoadingComments: false });
      return;
    }

    try {
      const response = await api.getComments(postId);
      set({ comments: response.data, isLoadingComments: false });
    } catch (error) {
      const comments = MOCK_COMMENTS.filter((c) => c.post_id === postId);
      set({ comments, isLoadingComments: false });
    }
  },

  addComment: async (postId: string, content: string) => {
    if (DEMO_MODE) {
      const newComment: Comment = {
        id: String(Date.now()),
        content,
        author: { id: '1', first_name: 'Renaud', last_name: 'Cosson', avatar_url: 'https://i.pravatar.cc/300?img=12' },
        post_id: postId,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        comments: [...state.comments, newComment],
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
        ),
        currentPost:
          state.currentPost?.id === postId
            ? { ...state.currentPost, comments_count: state.currentPost.comments_count + 1 }
            : state.currentPost,
      }));
      return;
    }

    try {
      const newComment = await api.createComment(postId, content);
      set((state) => ({
        comments: [...state.comments, newComment],
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
        ),
        currentPost:
          state.currentPost?.id === postId
            ? { ...state.currentPost, comments_count: state.currentPost.comments_count + 1 }
            : state.currentPost,
      }));
    } catch (error: any) {
      throw new Error(error.message || "Erreur lors de l'ajout du commentaire");
    }
  },

  clearCurrentPost: () => {
    set({ currentPost: null, comments: [] });
  },
}));
