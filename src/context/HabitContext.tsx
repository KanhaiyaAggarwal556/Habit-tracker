import { createContext, useState, useContext, useEffect } from "react";

export interface Habit {
  habitId: string;
  habitName: string;
  trackingType: "daily" | "weekly";
  datesCompleted: string[];
  streakCurrent: number;
  streakMaximum: number;
  targetWeekly: number;
}

interface HabitCtx {
  habitsList: Habit[];
  createHabit: (habitInfo: { habitName: string; trackingType: "daily" | "weekly"; targetWeekly?: number }) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabit: (habitId: string, dateString?: string) => void;
  updateTracking: (habitId: string, newTrackingType: "daily" | "weekly") => void;
  isDoneToday: (habitId: string) => boolean;
  isDoneOnDate: (habitId: string, dateString: string) => boolean;
  getHistory: (habitId: string, days?: number) => { dateString: string; isCompleted: boolean; dayNumber: number; isToday: boolean }[];
}

const HabitContext = createContext<HabitCtx | null>(null);
const getDateStr = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

const calcDailyStreak = (dates: string[]) => {
  if (!dates.length) return { current: 0, max: 0 };

  const sorted = [...dates].sort().reverse();
  const today = getDateStr();
  const yesterday = getDateStr(1);

  let current = 0;
  let max = 1;
  let tmp = 1;

  let checkDate = new Date();
  let started = false;

  if (sorted.includes(today)) {
    current = 1;
    started = true;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (sorted.includes(yesterday)) {
    current = 1;
    started = true;
    checkDate = new Date(yesterday);
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (started) {
    const str = checkDate.toISOString().split("T")[0];
    if (sorted.includes(str)) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }

  // max streak loop
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i]);
    const prev = new Date(sorted[i - 1]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      tmp++;
    } else {
      max = Math.max(max, tmp);
      tmp = 1;
    }
  }

  max = Math.max(max, tmp);

  return { current, max };
};
const calcWeeklyStreak = (dates: string[], weeklyTarget: number) => {
  if (!dates.length) return { current: 0, max: 0 };

  const weekMap: Record<string, number> = {};

  dates.forEach(dateStr => {
    const d = new Date(dateStr);
    const startOfWeek = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
    const key = startOfWeek.toISOString().split("T")[0];
    weekMap[key] = (weekMap[key] || 0) + 1;
  });

  const completedWeeks = Object.keys(weekMap)
    .filter(wk => weekMap[wk] >= weeklyTarget)
    .sort()
    .reverse();

  if (!completedWeeks.length) return { current: 0, max: 0 };

  let current = 0;
  let max = 1;
  let tmp = 1;

  const today = new Date();
  const thisWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const wkCheck = new Date(thisWeek);
  let started = false;

  for (let i = 0; i < completedWeeks.length; i++) {
    const key = wkCheck.toISOString().split("T")[0];

    if (completedWeeks.includes(key)) {
      if (!started) {
        current = 1;
        started = true;
      } else {
        current++;
      }
      wkCheck.setDate(wkCheck.getDate() - 7);
    } else {
      if (started) break;
      wkCheck.setDate(wkCheck.getDate() - 7);
    }
  }

  for (let i = 1; i < completedWeeks.length; i++) {
    const curr = new Date(completedWeeks[i]);
    const prev = new Date(completedWeeks[i - 1]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 7) {
      tmp++;
    } else {
      max = Math.max(max, tmp);
      tmp = 1;
    }
  }

  max = Math.max(max, tmp);

  return { current, max };
};

export const HabitProvider = ({ children }: { children: React.ReactNode }) => {
  const [habitsList, setHabitsList] = useState<Habit[]>(() => {
    try {
      const stored = localStorage.getItem("habitsData");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("couldn't parse habitsData", err);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("habitsData", JSON.stringify(habitsList));
  }, [habitsList]);

  const createHabit = (info: { habitName: string; trackingType: "daily" | "weekly"; targetWeekly?: number }) => {
    const newHabit: Habit = {
      habitId: Date.now().toString(),
      habitName: info.habitName,
      trackingType: info.trackingType,
      datesCompleted: [],
      streakCurrent: 0,
      streakMaximum: 0,
      targetWeekly: info.targetWeekly || 3, // default weekly target = 3
    };
    setHabitsList(prev => [...prev, newHabit]);
  };

  const deleteHabit = (habitId: string) => {
    setHabitsList(prev => prev.filter(h => h.habitId !== habitId));
  };

  const toggleHabit = (habitId: string, dateString?: string) => {
    const targetDate = dateString || getDateStr();

    setHabitsList(prev =>
      prev.map(habit => {
        if (habit.habitId !== habitId) return habit;

        const already = habit.datesCompleted.includes(targetDate);
        const newDates = already ? habit.datesCompleted.filter(d => d !== targetDate) : [...habit.datesCompleted, targetDate];

        // kinda messy but works
        const streak =
          habit.trackingType === "daily" ? calcDailyStreak(newDates) : calcWeeklyStreak(newDates, habit.targetWeekly);

        return {
          ...habit,
          datesCompleted: newDates,
          streakCurrent: streak.current,
          streakMaximum: streak.max,
        };
      })
    );
  };

  const updateTracking = (habitId: string, newType: "daily" | "weekly") => {
    setHabitsList(prev =>
      prev.map(habit => {
        if (habit.habitId !== habitId) return habit;

        const streak = newType === "daily" ? calcDailyStreak(habit.datesCompleted) : calcWeeklyStreak(habit.datesCompleted, habit.targetWeekly);

        return { ...habit, trackingType: newType, streakCurrent: streak.current, streakMaximum: streak.max };
      })
    );
  };

  const isDoneToday = (habitId: string) => {
    const h = habitsList.find(x => x.habitId === habitId);
    return h?.datesCompleted.includes(getDateStr()) ?? false;
  };

  const isDoneOnDate = (habitId: string, dateString: string) => {
    const h = habitsList.find(x => x.habitId === habitId);
    return h?.datesCompleted.includes(dateString) ?? false;
  };

  const getHistory = (habitId: string, days = 14) => {
    const h = habitsList.find(x => x.habitId === habitId);
    if (!h) return [];

    const res = [];
    const today = getDateStr();

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split("T")[0];

      res.push({
        dateString: str,
        isCompleted: h.datesCompleted.includes(str),
        dayNumber: d.getDate(),
        isToday: str === today,
      });
    }

    return res;
  };

  const value: HabitCtx = {
    habitsList,
    createHabit,
    deleteHabit,
    toggleHabit,
    updateTracking,
    isDoneToday,
    isDoneOnDate,
    getHistory,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};

export const useHabits = () => {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be inside HabitProvider");
  return ctx;
};
