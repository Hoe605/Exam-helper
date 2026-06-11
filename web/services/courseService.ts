import { apiClient } from '@/lib/api-client';
import { Outline } from './outlineService';

export interface Course {
  id: number;
  name: string;
  desc: string | null;
  code: string;
  is_active: boolean;
  created_at: string;
  creator_id: number;
}

export interface CourseStudent {
  id: number;
  email: string;
  role: string;
}

export interface CourseOutlineLink {
  course_id: number;
  outline_id: number;
}

export const courseService = {
  async createCourse(name: string, desc?: string): Promise<Course> {
    return apiClient.post('/courses', { name, desc });
  },

  async joinCourse(code: string): Promise<Course> {
    return apiClient.post('/courses/join', { code });
  },

  async getMyCourses(): Promise<Course[]> {
    return apiClient.get('/courses');
  },

  async getCourseOutlines(courseId: number): Promise<Outline[]> {
    return apiClient.get<Outline[]>(`/courses/${courseId}/outlines`);
  },

  async getCourse(id: number | string): Promise<Course> {
    return apiClient.get(`/courses/${id}`);
  },

  async getCourseStudents(id: number | string): Promise<CourseStudent[]> {
    return apiClient.get<CourseStudent[]>(`/courses/${id}/students`);
  },

  async linkOutline(courseId: number | string, outlineId: number): Promise<CourseOutlineLink> {
    return apiClient.post<CourseOutlineLink>(`/courses/${courseId}/outlines`, { outline_id: outlineId });
  }
};
