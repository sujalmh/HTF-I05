"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReportGenerator } from "./report-generator"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  databaseName?: string
  chatId: string
}

export function ReportDialog({ open, onOpenChange, databaseName, chatId }: ReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>Create a custom report from your database using natural language</DialogDescription> */}
        </DialogHeader>
        <ReportGenerator databaseName={databaseName} chatId={chatId} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

