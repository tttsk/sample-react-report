import { useState, useEffect, useCallback } from "react";

type Post = {
  id: string;
  post_date: string;
  content: string;
};

export const useFetchData = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("../../api/firebase", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(data.results);
      } else {
        console.error("データ取得エラー:", data.error);
      }
    } catch (error) {
      console.error("データ取得中にエラーが発生しました。", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, isLoading, fetchPosts };
};
