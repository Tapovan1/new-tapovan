import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getAllTeacher } from "@/lib/actions/teacher.action";
import TeacherAssignments from "./Teacher";
import { getGroupedAssignments } from "@/lib/actions/teacher-assignment.action";

interface Assignment {
  id: string;
  teacherId: string;
  standardName: string;
  className: string;
  subject: string;
  isClassTeacher: boolean;
  assignedDate: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  assignments: Assignment[]; // Already included in your backend response
}

interface GroupedTeacher {
  id: string;
  name: string;
  email: string;
  assignments: Assignment[];
  classTeacherAssignments: Assignment[];
  totalAssignments: number;
}

// Function to process teachers data that already includes assignments
function processTeachersWithAssignments(teachers: Teacher[]): GroupedTeacher[] {
  return teachers.map((teacher) => {
    // Your backend already provides assignments array
    const teacherAssignments = teacher.assignments || [];
    const classTeacherAssignments = teacherAssignments.filter(
      (assignment) => assignment.isClassTeacher
    );

    console.log(`${teacher.name} has ${teacherAssignments.length} assignments`);

    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      assignments: teacherAssignments,
      classTeacherAssignments,
      totalAssignments: teacherAssignments.length,
    };
  });
}

async function AssignmentsPageContent() {
  try {
    // Only fetch teachers since assignments are already included
    const teachersResult = await getGroupedAssignments();

    // if (!teachersResult.success) {
    //   throw new Error("Failed to fetch teachers data");
    // }

    // Ensure each teacher object has a 'role' property (default to empty string if missing)
    const teachers: Teacher[] = (teachersResult || []).map((teacher: any) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role ?? "",
      assignments: teacher.assignments ?? [],
    }));

    // Process teachers data (assignments already included)
    const groupedTeachers = processTeachersWithAssignments(teachers);

    // All teachers for dropdown (full Teacher structure)
    const allTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role ?? "",
      assignments: teacher.assignments ?? [],
      classTeacherAssignments: teacher.assignments
        ? teacher.assignments.filter((assignment) => assignment.isClassTeacher)
        : [],
      totalAssignments: teacher.assignments ? teacher.assignments.length : 0,
    }));

    return (
      <TeacherAssignments
        groupedTeachers={groupedTeachers}
        allTeachers={allTeachers}
      />
    );
  } catch (error) {
    console.error("Error loading assignments:", error);
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <CardContent className="text-center">
            <p className="text-red-400 mb-2">Failed to load assignments</p>
            <p className="text-slate-400 text-sm">
              Please try refreshing the page
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}



export default function AssignmentsPage() {
  return (
 
      <AssignmentsPageContent />

  );
}
