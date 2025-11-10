"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface UnsavedChangesNoticeProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function UnsavedChangesNotice({
  onSave,
  onCancel,
  isSaving = false,
}: UnsavedChangesNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-3 rounded-xl border  bg-card/10 p-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Unsaved changes</p>
          <p className="text-sm">
            You have updates that haven&apos;t been saved yet. Save or discard them to continue.
          </p>
        </div>
      </div>

      <div className="flex gap-2 md:items-center">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button className="text-white" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </motion.div>
  );
}
