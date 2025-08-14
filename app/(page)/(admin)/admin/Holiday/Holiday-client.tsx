"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  CalendarDays,
  ArrowLeft,
  Search,
} from "lucide-react";
import {
  addHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/lib/actions/holiday.action";
import Link from "next/link";

interface Holiday {
  id: string;
  date: Date;
  name: string;

  createdAt: Date;
  updatedAt: Date;
}

interface HolidayManagementClientProps {
  initialHolidays: Holiday[];
}
export default function HolidayManagementClient({
  initialHolidays,
}: HolidayManagementClientProps) {
  const [holidays, setHolidays] = useState(initialHolidays);
  const [filteredHolidays, setFilteredHolidays] = useState(initialHolidays);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    date: "",
    name: "",
  });

  // Filter holidays based on search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredHolidays(holidays);
    } else {
      const search = term.toLowerCase();
      const filtered = holidays.filter((holiday) =>
        holiday.name.toLowerCase().includes(search)
      );
      setFilteredHolidays(filtered);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      date: "",
      name: "",
    });
    setEditingHoliday(null);
  };

  // Handle add holiday
  const handleAddHoliday = async () => {
    const result = await addHoliday(formData.date, formData.name);

    if (result.success) {
      // Refresh the page to get updated data
      window.location.reload();
    } else {
      alert(result.error);
    }
  };

  // Handle edit holiday
  const handleEditHoliday = async () => {
    if (!editingHoliday) return;

    const result = await updateHoliday(
      editingHoliday.id,
      formData.date,
      formData.name
    );

    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error);
    }
  };

  // Handle delete holiday
  const handleDeleteHoliday = async (id: string) => {
    const result = await deleteHoliday(id);

    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error);
    }
  };

  // Open edit dialog
  const openEditDialog = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      date: holiday.date.toISOString().split("T")[0],
      name: holiday.name,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Holiday Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage school holidays and events
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Statistics */}

        {/* Search and Add */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search holidays..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white pl-10"
                />
              </div>

              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Add New Holiday
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Create a new holiday entry for the school calendar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-200">Date</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-200">Holiday Name</Label>
                      <Input
                        placeholder="Enter holiday name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="border-slate-600 text-slate-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddHoliday}
                        className="bg-gradient-to-r from-green-500 to-emerald-500"
                        disabled={!formData.date || !formData.name}
                      >
                        Add Holiday
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Holidays List */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Holidays Calendar
            </CardTitle>
            <CardDescription className="text-slate-400">
              {filteredHolidays.length} holidays found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHolidays.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">
                  No Holidays Found
                </h3>
                <p className="text-slate-400">
                  {searchTerm
                    ? `No holidays match "${searchTerm}"`
                    : "No holidays have been added yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="text-white font-medium">
                          {holiday.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-sm">
                            {new Date(holiday.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:bg-blue-500/20"
                            onClick={() => openEditDialog(holiday)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Edit Holiday
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                              Update holiday information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-slate-200">Date</Label>
                              <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    date: e.target.value,
                                  })
                                }
                                className="bg-slate-700/50 border-slate-600 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-200">
                                Holiday Name
                              </Label>
                              <Input
                                placeholder="Enter holiday name"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  })
                                }
                                className="bg-slate-700/50 border-slate-600 text-white"
                              />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                              <Button
                                variant="outline"
                                className="border-slate-600 text-slate-300 bg-transparent"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleEditHoliday}
                                className="bg-gradient-to-r from-blue-500 to-indigo-500"
                                disabled={!formData.date || !formData.name}
                              >
                                Update Holiday
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">
                              Delete Holiday
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Are you sure you want to delete "{holiday.name}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-600 text-slate-300">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
