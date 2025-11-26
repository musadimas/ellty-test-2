import { create } from "zustand";
import { Post } from "@/hooks/use-posts";

interface PostCacheState {
  posts: Record<string, Post>;
  childrenMap: Record<string, string[]>;
  rootPostIds: string[];
  cursors: Record<string, string | undefined>;
  setPosts: (posts: Post[]) => void;
  setPost: (post: Post) => void;
  setChildren: (parentId: string, children: Post[], cursor?: string) => void;
  setRootPosts: (posts: Post[], cursor?: string) => void;
  appendRootPosts: (posts: Post[], cursor?: string) => void;
  appendChildren: (parentId: string, children: Post[], cursor?: string) => void;
  getPost: (id: string) => Post | undefined;
  getChildren: (parentId: string) => Post[];
  getRootPosts: () => Post[];
  getCursor: (key: string) => string | undefined;
  hasPost: (id: string) => boolean;
  clear: () => void;
}

export const usePostCache = create<PostCacheState>((set, get) => ({
  posts: {},
  childrenMap: {},
  rootPostIds: [],
  cursors: {},

  setPosts: (posts) => {
    set((state) => {
      const newPosts = { ...state.posts };
      posts.forEach((post) => {
        newPosts[post.id] = post;
      });
      return { posts: newPosts };
    });
  },

  setPost: (post) => {
    set((state) => ({
      posts: {
        ...state.posts,
        [post.id]: post,
      },
    }));
  },

  setChildren: (parentId, children, cursor) => {
    set((state) => {
      const newPosts = { ...state.posts };
      const childIds = children.map((post) => {
        newPosts[post.id] = post;
        return post.id;
      });

      return {
        posts: newPosts,
        childrenMap: {
          ...state.childrenMap,
          [parentId]: childIds,
        },
        cursors: {
          ...state.cursors,
          [`children:${parentId}`]: cursor,
        },
      };
    });
  },

  setRootPosts: (posts, cursor) => {
    set((state) => {
      const newPosts = { ...state.posts };
      const rootIds = posts.map((post) => {
        newPosts[post.id] = post;
        return post.id;
      });

      return {
        posts: newPosts,
        rootPostIds: rootIds,
        cursors: {
          ...state.cursors,
          root: cursor,
        },
      };
    });
  },

  appendRootPosts: (posts, cursor) => {
    set((state) => {
      const newPosts = { ...state.posts };
      const newIds = posts.map((post) => {
        newPosts[post.id] = post;
        return post.id;
      });

      // merge and deduplicate
      const mergedIds = [...new Set([...state.rootPostIds, ...newIds])];

      return {
        posts: newPosts,
        rootPostIds: mergedIds,
        cursors: {
          ...state.cursors,
          root: cursor,
        },
      };
    });
  },

  appendChildren: (parentId, children, cursor) => {
    set((state) => {
      const newPosts = { ...state.posts };
      const newIds = children.map((post) => {
        newPosts[post.id] = post;
        return post.id;
      });

      const existingIds = state.childrenMap[parentId] || [];
      // merge and deduplicate

      const mergedIds = [...new Set([...existingIds, ...newIds])];

      return {
        posts: newPosts,
        childrenMap: {
          ...state.childrenMap,
          [parentId]: mergedIds,
        },
        cursors: {
          ...state.cursors,
          [`children:${parentId}`]: cursor,
        },
      };
    });
  },

  getPost: (id) => {
    return get().posts[id];
  },

  getChildren: (parentId) => {
    const childIds = get().childrenMap[parentId] || [];
    const posts = get().posts;
    return childIds.map((id) => posts[id]).filter(Boolean);
  },

  getRootPosts: () => {
    const rootIds = get().rootPostIds;
    const posts = get().posts;
    return rootIds.map((id) => posts[id]).filter(Boolean);
  },

  getCursor: (key) => {
    return get().cursors[key];
  },

  hasPost: (id) => {
    return !!get().posts[id];
  },

  clear: () => {
    set({
      posts: {},
      childrenMap: {},
      rootPostIds: [],
      cursors: {},
    });
  },
}));
