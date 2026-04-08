import { create } from 'zustand';
import { courseService } from '@/services/courseService';

interface Student {
  id: number;
  email: string;
  role: string;
}

interface CourseState {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  
  fetchStudents: (courseId: string | number) => Promise<void>;
  // 可以在以后扩展更多功能，比如移除学生、更改角色等
}

export const useCourseStore = create<CourseState>((set) => ({
  students: [],
  isLoading: false,
  error: null,

  fetchStudents: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await courseService.getCourseStudents(courseId);
      set({ students: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || '获取学生列表失败', isLoading: false });
    }
  },
}));
