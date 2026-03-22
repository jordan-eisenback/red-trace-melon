import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "danger",
}: ConfirmDialogProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          iconBg: "bg-red-100",
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          iconBg: "bg-orange-100",
          button: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
        };
      case "info":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
          iconBg: "bg-blue-100",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in z-50">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 rounded-full p-3 ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-gray-600 mb-6">
                {description}
              </AlertDialog.Description>
              <div className="flex gap-3 justify-end">
                <AlertDialog.Cancel asChild>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                    {cancelLabel}
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    onClick={onConfirm}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
                  >
                    {confirmLabel}
                  </button>
                </AlertDialog.Action>
              </div>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
