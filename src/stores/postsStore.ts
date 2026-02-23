import { create } from 'zustand';
import { Post, Comment } from '../types';
import api from '../services/api';

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
      set({
        error: error.message || 'Erreur lors du chargement des publications',
        isLoading: false,
      });
    }
  },

  fetchMorePosts: async () => {
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
    try {
      const post = await api.getPost(id);
      set({ currentPost: post, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors du chargement de la publication',
        isLoading: false,
      });
    }
  },

  createPost: async (content: string, image?: string) => {
    set({ isCreating: true, error: null });
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

    const wasLiked = post.liked_by_me;

    // Optimistic update
    const updatePost = (p: Post): Post =>
      p.id === postId
        ? {
            ...p,
            liked_by_me: !wasLiked,
            likes_count: wasLiked ? p.likes_count - 1 : p.likes_count + 1,
          }
        : p;

    set((state) => ({
      posts: state.posts.map(updatePost),
      currentPost: state.currentPost?.id === postId ? updatePost(state.currentPost) : state.currentPost,
    }));

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
                liked_by_me: wasLiked,
                likes_count: wasLiked ? p.likes_count + 1 : p.likes_count - 1,
              }
            : p
        ),
        currentPost:
          state.currentPost?.id === postId
            ? {
                ...state.currentPost,
                liked_by_me: wasLiked,
                likes_count: wasLiked ? state.currentPost.likes_count + 1 : state.currentPost.likes_count - 1,
              }
            : state.currentPost,
      }));
    }
  },

  fetchComments: async (postId: string) => {
    set({ isLoadingComments: true });
    try {
      const response = await api.getComments(postId);
      set({ comments: response.data, isLoadingComments: false });
    } catch (error) {
      set({ isLoadingComments: false });
    }
  },

  addComment: async (postId: string, content: string) => {
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
