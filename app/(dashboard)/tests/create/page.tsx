"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2, GraduationCap } from "lucide-react"
import Link from "next/link"

// Teacher's assigned classes and subjects
const teacherAssignments = {
  subjects: ["Mathematics", "Science"],
  classes: [
    { id: "8-dhruv", name: "8-Dhruv", standard: 8, class: "Dhruv", subject: "Mathematics" },
    { id: "8-dhruv-science", name: "8-Dhruv", standard: 8, class: "Dhruv", subject: "Science" },
    { id: "9-nachiketa", name: "9-Nachiketa", standard: 9, class: "Nachiketa", subject: "Mathematics" },
    { id: "10-arjun-science", name: "10-Arjun", standard: 10, class: "Arjun", subject: "Science" },
  ],
}

export default function CreateTest() {
  const [teacher, setTeacher] = useState<any>(null)
  const [testData, setTestData] = useState({
    name: "",
    description: "",
    subject: "",
    classId: "",
    date: "",
    duration: "",
    maxMarks: "",
    instructions: "",
    questions: [{ id: 1, question: "", marks: "", type: "short" }],
  })

  useEffect(() => {
    const teacherData = localStorage.getItem("teacher")
    if (teacherData) {
      setTeacher(JSON.parse(teacherData))
    } else {
      window.location.href = "/"
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setTestData((prev) => ({ ...prev, [field]: value }))
  }

  const handleQuestionChange = (index: number, field: string, value: string) => {
    setTestData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    }))
  }

  const addQuestion = () => {
    setTestData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: prev.questions.length + 1,
          question: "",
          marks: "",
          type: "short",
        },
      ],
    }))
  }

  const removeQuestion = (index: number) => {
    if (testData.questions.length > 1) {
      setTestData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSaveTest = () => {
    // Validate required fields
    if (!testData.name || !testData.subject || !testData.classId || !testData.date || !testData.maxMarks) {
      alert("Please fill in all required fields")
      return
    }

    // In real app, this would save to database
    console.log("Saving test:", testData)
    alert("Test created successfully!")

    // Redirect to tests page
    window.location.href = "/tests"
  }

  const getAvailableClasses = () => {
    return teacherAssignments.classes.filter((cls) => (testData.subject ? cls.subject === testData.subject : true))
  }

  const getTotalMarks = () => {
    return testData.questions.reduce((total, q) => total + (Number.parseInt(q.marks) || 0), 0)
  }

  if (!teacher) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tests">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Create New Test</h1>
                <p className="text-slate-400 text-sm">Design a test for your students</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveTest} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Test
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Test Basic Information */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Test Information</CardTitle>
            <CardDescription className="text-slate-400">Basic details about the test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Test Name *</Label>
                <Input
                  value={testData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Mathematics Unit Test 1"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Subject *</Label>
                <Select value={testData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {teacherAssignments.subjects.map((subject) => (
                      <SelectItem key={subject} value={subject} className="text-white">
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Class *</Label>
                <Select value={testData.classId} onValueChange={(value) => handleInputChange("classId", value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {getAvailableClasses().map((cls) => (
                      <SelectItem key={cls.id} value={cls.id} className="text-white">
                        Standard {cls.standard} - {cls.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Test Date *</Label>
                <Input
                  type="date"
                  value={testData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={testData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="60"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Maximum Marks *</Label>
                <Input
                  type="number"
                  value={testData.maxMarks}
                  onChange={(e) => handleInputChange("maxMarks", e.target.value)}
                  placeholder="100"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Description</Label>
              <Textarea
                value={testData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the test"
                className="bg-slate-800/50 border-slate-700 text-white"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Instructions</Label>
              <Textarea
                value={testData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                placeholder="Instructions for students"
                className="bg-slate-800/50 border-slate-700 text-white"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Questions</CardTitle>
                <CardDescription className="text-slate-400">
                  Add questions for your test (Total: {getTotalMarks()} marks)
                </CardDescription>
              </div>
              <Button onClick={addQuestion} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {testData.questions.map((question, index) => (
              <div key={question.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Question {index + 1}</h4>
                  <div className="flex items-center gap-2">
                    <Select value={question.type} onValueChange={(value) => handleQuestionChange(index, "type", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="short" className="text-white">
                          Short
                        </SelectItem>
                        <SelectItem value="long" className="text-white">
                          Long
                        </SelectItem>
                        <SelectItem value="mcq" className="text-white">
                          MCQ
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {testData.questions.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(index)}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-2">
                    <Label className="text-slate-200">Question</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                      placeholder="Enter your question here..."
                      className="bg-slate-700/50 border-slate-600 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-200">Marks</Label>
                    <Input
                      type="number"
                      value={question.marks}
                      onChange={(e) => handleQuestionChange(index, "marks", e.target.value)}
                      placeholder="10"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
