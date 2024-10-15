import { useState, memo, useCallback } from "react";
import { MyDialog } from "./MyDialog";
import { ja } from "date-fns/locale";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";
import { useFetchData } from "../hook/useFetchData";
import ReactLoading, { LoadingType } from 'react-loading';
import { getHolidaysOfYear } from "holiday-jp-since";
import { format } from "date-fns";

const Roading = ({ type, color }: { type: LoadingType; color: string }) => (
  <ReactLoading type={type} color={color} height={50} width={50}
    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  />
);

export const MyDatePicker = memo(() => {
  const defaultClassNames = getDefaultClassNames();
  const [selected, setSelected] = useState<Date>();
  const [clickedDate, setClickedDate] = useState<Date>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  const handleDayClick = useCallback((day: Date) => {
    setClickedDate(day);
    setIsDialogOpen(true);
  }, []);

  // データを取得
  const { posts, isLoading, fetchPosts } = useFetchData();

  // 投稿がある日付を判定する関数
  const isPostDate = useCallback((date: Date) => {
    return posts.some(post => {
      const postDate = new Date(post.post_date);
      return (
        date.getFullYear() === postDate.getFullYear() &&
        date.getMonth() === postDate.getMonth() &&
        date.getDate() === postDate.getDate()
      );
    });
  }, [posts]);

  // 月が変わった時に実行される関数
  const handleMonthChange = useCallback((date: Date) => {
    setCurrentYear(date.getFullYear()); // 年をセット
    setCurrentMonth(date); // 月をセット
  }, []);

  // 祝日かどうかを判定する関数
  const constCheckHoliday = useCallback((date: Date) => {
    const hoildays = getHolidaysOfYear(currentYear);
    return hoildays.some(holiday => {
      return (
        date.getFullYear() === currentYear &&
        date.getMonth()+1 === holiday.month &&
        date.getDate() === holiday.day
      );
    });
  }, [currentYear]);

  return (
    <>
      {isLoading && <Roading type='spin' color='green' />}

      {!isLoading && <DayPicker
        locale={ja}
        mode="single"
        selected={selected}
        showOutsideDays={true}
        onSelect={setSelected}
        onDayClick={handleDayClick}
        onMonthChange={handleMonthChange}
        defaultMonth={currentMonth}
        formatters={{
          formatCaption: (date, options) => format(date, "yyyy年 LLLL", options)
        }}

        modifiers={{
          saturday: (date) => date.getDay() === 6 && date.getMonth() === currentMonth.getMonth(),
          sunday: (date) => date.getDay() === 0 && date.getMonth() === currentMonth.getMonth(),
          hasPost: isPostDate,
          isHoliday:  constCheckHoliday,
          outMonth: (date) => date.getMonth() !== currentMonth.getMonth(),
        }}
        modifiersClassNames={{
          saturday: "text-blue-600",
          sunday: "text-red-600",
          hasPost: "bg-gray-100",
          isHoliday: "bg-red-100 text-red-600",
          outMonth: "text-gray-300",
        }}

        classNames={{
          root: `${defaultClassNames.root} sm:mt-10 mt-3 w-full lg:max-w-4xl mx-auto my-0`,
          month_caption: `font-bold text-center text-xl mb-2`,
          nav: `${defaultClassNames.nav} items-stretch`,
          today: `text-purple-700 font-bold animate-pulse`,
          chevron: `${defaultClassNames.chevron} fill-amber-500`,
          months: `max-w-none`,
          month_grid: `w-full`,
          weekdays: `bg-gray-200 text-sm`,
          day: `border border-gray-200 hover:bg-gray-100`,
          day_button: `sm:h-28 w-full flex p-1 h-24`,
          selected: ``,
        }}
      />}

      <MyDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        clickedDate={clickedDate}
        posts={posts}
        fetchPosts={fetchPosts}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
    </>
  );
});