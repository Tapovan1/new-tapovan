// "use client";

// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   ExternalLink,
//   Calendar,
//   Users,
//   BookOpen,
//   Settings,
// } from "lucide-react";
// import Link from "next/link";
// import { getPendingActionDetails } from "@/lib/actions/admin.action";

// interface PendingActionsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   actionType: string;
//   actionTitle: string;
// }

// export default function PendingActionsModal({
//   isOpen,
//   onClose,
//   actionType,
//   actionTitle,
// }: PendingActionsModalProps) {
//   const [loading, setLoading] = useState(false);
//   const [details, setDetails] = useState<any>(null);

//   useEffect(() => {
//     if (isOpen && actionType) {
//       loadDetails();
//     }
//   }, [isOpen, actionType]);

//   const loadDetails = async () => {
//     setLoading(true);
//     try {
//       const data = await getPendingActionDetails(actionType);
//       setDetails(data);
//     } catch (error) {
//       console.error("Error loading pending action details:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getIcon = (type: string) => {
//     switch (type) {
//       case "attendance":
//         return <Calendar className="h-5 w-5 text-blue-400" />;
//       case "marks":
//         return <BookOpen className="h-5 w-5 text-green-400" />;
//       case "system":
//         return <Settings className="h-5 w-5 text-purple-400" />;
//       default:
//         return <Users className="h-5 w-5 text-slate-400" />;
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "high":
//         return "bg-red-500/20 text-red-300";
//       case "medium":
//         return "bg-yellow-500/20 text-yellow-300";
//       case "low":
//         return "bg-blue-500/20 text-blue-300";
//       default:
//         return "bg-slate-500/20 text-slate-300";
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-xl">
//             {getIcon(actionType)}
//             {actionTitle}
//           </DialogTitle>
//           <DialogDescription className="text-slate-400">
//             Review and take action on pending items
//           </DialogDescription>
//         </DialogHeader>

//         <div className="mt-6">
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
//               <span className="ml-3 text-slate-400">Loading details...</span>
//             </div>
//           ) : details ? (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-medium text-white">
//                   {details.title}
//                 </h3>
//                 <Badge className="bg-slate-700 text-slate-300">
//                   {details.items.length} items
//                 </Badge>
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {details.items.map((item: any) => (
//                   <div
//                     key={item.id}
//                     className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1">
//                         <h4 className="font-medium text-white mb-1">
//                           {item.title}
//                         </h4>
//                         <p className="text-sm text-slate-400">
//                           {item.description}
//                         </p>
//                         {item.date && (
//                           <p className="text-xs text-slate-500 mt-1">
//                             {new Date(item.date).toLocaleDateString()}
//                           </p>
//                         )}
//                       </div>
//                       <Link href={item.actionUrl}>
//                         <Button
//                           size="sm"
//                           className="bg-blue-600 hover:bg-blue-700 text-white ml-3"
//                           onClick={onClose}
//                         >
//                           <ExternalLink className="h-3 w-3 mr-1" />
//                           {actionType === "attendance" ? "Mark" : "Review"}
//                         </Button>
//                       </Link>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {details.items.length === 0 && (
//                 <div className="text-center py-8 text-slate-400">
//                   <div className="mb-2">{getIcon(actionType)}</div>
//                   <p>No pending items found</p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="text-center py-8 text-slate-400">
//               <p>Failed to load details</p>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end mt-6 pt-4 border-t border-slate-800">
//           <Button
//             variant="outline"
//             onClick={onClose}
//             className="border-slate-700 text-slate-300 bg-transparent"
//           >
//             Close
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
import React from "react";

const PendingActionModel = () => {
  return <div>PendingActionModel</div>;
};

export default PendingActionModel;
