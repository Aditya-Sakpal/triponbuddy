import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  isOwner?: boolean;
  onSuccess?: () => void;
}

export const IssueReportModal = ({ isOpen, onClose, tripId, isOwner = false, onSuccess }: IssueReportModalProps) => {
  const { user } = useUser();
  interface MinimalUser { id?: string; fullName?: string; firstName?: string }
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("technical");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const u = user as unknown as MinimalUser;
  const reporterName = u?.fullName || u?.firstName || "User";

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to report an issue.", variant: "destructive" });
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast({ title: "Missing fields", description: "Please provide a subject and message.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const queryParams = new URLSearchParams({
        user_id: user.id,
        user_name: reporterName,
        trip_id: tripId,
        is_owner: String(isOwner),
      });

      const body: Record<string, string> = { subject: subject.trim(), message: message.trim() };
      if (!isOwner) (body as Record<string, string> & { category?: string }).category = category;

      const response = await fetch(`${API_BASE_URL}/api/issues/report?${queryParams.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to send report");

      toast({ title: "Reported", description: "Your issue has been submitted." });
      setSubject("");
      setMessage("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error("Issue report error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: errMsg || "Failed to submit report.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Submit details about an issue related to this trip. Our team or the trip owner will be notified.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>

          {!isOwner && (
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2"><input type="radio" name="cat" value="technical" checked={category==="technical"} onChange={() => setCategory("technical")} /> Technical</label>
                <label className="flex items-center gap-2"><input type="radio" name="cat" value="personal" checked={category==="personal"} onChange={() => setCategory("personal")} /> Personal</label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Sending...</>) : ("Send Report")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
