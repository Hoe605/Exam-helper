'use client';

import { useEffect } from 'react';
import { useCourseStore } from '@/store/useCourseStore';
import { Loader2 } from 'lucide-react';

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

interface StudentListProps {
  courseId: string | number;
}

export default function StudentList({ courseId }: StudentListProps) {
  const { students, isLoading, fetchStudents } = useCourseStore();

  useEffect(() => {
    if (courseId) {
      fetchStudents(courseId);
    }
  }, [courseId, fetchStudents]);

  if (isLoading && students.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 opacity-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] p-10 border border-[#EDEEEF] shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(s => (
          <div 
            key={s.id} 
            className="p-6 bg-[#F8F9FA] rounded-[2rem] flex items-center gap-4 hover:shadow-lg hover:bg-white transition-all border border-transparent hover:border-[#EDEEEF]"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <UserIcon className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-[#000666]">{s.email.split('@')[0]}</span>
              <span className="text-[10px] font-bold text-[#767683] opacity-60 truncate max-w-[120px]">{s.email}</span>
            </div>
          </div>
        ))}
        
        {students.length === 0 && (
          <div className="col-span-full py-20 text-center text-[#767683] opacity-40 font-bold uppercase tracking-[0.3em] text-xs">
            Waiting for the first student to join...
          </div>
        )}
      </div>
    </div>
  );
}
