import { useState, useEffect, memo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

type MyDialogProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  clickedDate: Date | undefined;
  posts: any;
  fetchPosts: () => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

export const MyDialog: React.FC<MyDialogProps> = memo(({ isDialogOpen, setIsDialogOpen, clickedDate, posts, fetchPosts, currentMonth, setCurrentMonth }) => {
  const [content, setContent] = useState<string>("");
  const [docId, setDocId] = useState<string>('');

  useEffect(() => {
    // postsの中からクリックされた日付があるか検索
    if (clickedDate) {
      const matchedPost = posts.find(
        (post: {post_date: string; content: string, id: string}) => new Date(post.post_date).toLocaleDateString('ja-JP') === clickedDate.toLocaleDateString('ja-JP')
      );
      setContent(matchedPost?.content || '');
      setDocId(matchedPost?.id || '');
    }
  }, [isDialogOpen]);

  // 日報の内容を更新する関数
  const handleUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("../../api/firebase", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ docId, content }),  // 更新するデータを送信
      });
      const data = await response.json();

      if (response.ok) {
        // console.log("ドキュメントの更新に成功しました:", data.message);
        setIsDialogOpen(false);
        fetchPosts();
        setCurrentMonth(currentMonth);
      } else {
        console.error("ドキュメント更新エラー:", data.error);
      }
    } catch (error) {
      console.error("ドキュメント更新中にエラーが発生しました。", error);
    }
  }, [docId, content]);

  // 新しい日報を追加する関数
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const newData = {
      post_date: clickedDate?.toLocaleDateString('ja-JP'),
      content: content,
      created_at: new Date().getTime()
    };
    try {
      const response = await fetch("../../api/firebase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newData }),
      });
      const data = await response.json();

      if (response.ok) {
        // console.log("新しいポストが追加されました:", data.docId);
        setIsDialogOpen(false);
        fetchPosts();
        setCurrentMonth(currentMonth);
      } else {
        console.error("ポスト追加エラー:", data.error);
      }
    } catch (error) {
      console.error("ポスト追加中にエラーが発生しました。", error);
    }
  }, [clickedDate, content]);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className='md:w-[600px] max-w-[90%]'>
        <DialogHeader>
          <DialogTitle className='text-left'>
            {clickedDate ? clickedDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            }) : '日付が選択されていません'}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          <textarea
            name="contents"
            placeholder="日報入力欄"
            className="w-full h-60 border border-gray-500 outline-none p-2 rounded-md resize-none"
            onChange={(e) => setContent(e.target.value)}
            value={content}
            autoFocus={false}
          >
          </textarea>
          <button
            onClick={docId ? handleUpdate : onSubmit}
            className={`w-full text-center ${docId ? 'bg-red-400' : 'bg-green-400'} mt-2 sm:p-4 p-3 rounded-md text-white`}>
            {docId ? '日報更新' : '日報送信'}
          </button>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
});