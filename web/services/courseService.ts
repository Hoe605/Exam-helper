import { apiClient } from '@/lib/api-client';

export interface Course {
  id: number;
  name: string;
  desc: string | null;
  code: string;
  is_active: boolean;
  created_at: string;
  creator_id: number;
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

  async getCourseOutlines(courseId: number): Promise<any[]> {
    return apiClient.get(`/courses/${courseId}/outlines`);
  },

  async getCourse(id: number | string): Promise<Course> {
    return apiClient.get(`/courses/${id}`);
  },

  async getCourseStudents(id: number | string): Promise<any[]> {
    return apiClient.get(`/courses/${id}/students`);
  },

  async linkOutline(courseId: number | string, outlineId: number): Promise<any> {
    return apiClient.post(`/courses/${courseId}/outlines`, { outlineId });
  }
};
