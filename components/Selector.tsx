"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getStandardsList,
  getClassesForStandard,
  getSubjectsForStandard,
  getAllClasses,
  getAllSubjects,
  type StandardKey,
} from "@/lib/constants/index";

interface StandardSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function StandardSelector({
  value,
  onValueChange,
  placeholder = "Select Standard",
  label,
  className,
}: StandardSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-slate-200">{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={className || "bg-slate-700/50 border-slate-600 text-white"}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {getStandardsList().map((standard) => (
            <SelectItem key={standard} value={standard} className="text-white">
              {standard === "KG1" || standard === "KG2"
                ? standard
                : `Standard ${standard}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ClassSelectorProps {
  standard: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  showAll?: boolean;
}

export function ClassSelector({
  standard,
  value,
  onValueChange,
  placeholder = "Select Class",
  label,
  className,
  showAll = false,
}: ClassSelectorProps) {
  const classes = showAll
    ? getAllClasses()
    : getClassesForStandard(standard as StandardKey);

  return (
    <div className="space-y-2">
      {label && <Label className="text-slate-200">{label}</Label>}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={!showAll && !standard}
      >
        <SelectTrigger
          className={className || "bg-slate-700/50 border-slate-600 text-white"}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {classes.map((className) => (
            <SelectItem
              key={className}
              value={className}
              className="text-white"
            >
              {className}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface SubjectSelectorProps {
  standard: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  showAll?: boolean;
}

export function SubjectSelector({
  standard,
  value,
  onValueChange,
  placeholder = "Select Subject",
  label,
  className,
  showAll = false,
}: SubjectSelectorProps) {
  const subjects = showAll
    ? getAllSubjects()
    : getSubjectsForStandard(standard as StandardKey);

  return (
    <div className="space-y-2">
      {label && <Label className="text-slate-200">{label}</Label>}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={!showAll && !standard}
      >
        <SelectTrigger
          className={className || "bg-slate-700/50 border-slate-600 text-white"}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {subjects.map((subject) => (
            <SelectItem key={subject} value={subject} className="text-white">
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Teacher selector component
interface TeacherSelectorProps {
  teachers: Array<{ id: string; name: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function TeacherSelector({
  teachers,
  value,
  onValueChange,
  placeholder = "Select Teacher",
  label,
  className,
}: TeacherSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-slate-200">{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={className || "bg-slate-700/50 border-slate-600 text-white"}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {teachers.map((teacher) => (
            <SelectItem
              key={teacher.id}
              value={teacher.id}
              className="text-white"
            >
              {teacher.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Combined selector for easier use
interface SchoolSelectorProps {
  standard: string;
  className: string;
  subject: string;
  onStandardChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  layout?: "grid" | "inline";
}

export function SchoolSelector({
  standard,
  className,
  subject,
  onStandardChange,
  onClassChange,
  onSubjectChange,
  layout = "grid",
}: SchoolSelectorProps) {
  const containerClass =
    layout === "grid" ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "flex gap-4";

  return (
    <div className={containerClass}>
      <StandardSelector
        value={standard}
        onValueChange={(value) => {
          onStandardChange(value);
          onClassChange("");
          onSubjectChange("");
        }}
        label="Standard"
      />
      <ClassSelector
        standard={standard}
        value={className}
        onValueChange={onClassChange}
        label="Class"
      />
      <SubjectSelector
        standard={standard}
        value={subject}
        onValueChange={onSubjectChange}
        label="Subject"
      />
    </div>
  );
}
