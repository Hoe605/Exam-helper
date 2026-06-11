import { create } from 'zustand';
import { courseService, CourseStudent } from '@/services/courseService';

interface CourseState {
  students: CourseStudent[];
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
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : '获取学生列表失败', isLoading: false });
    }
  },
}));
