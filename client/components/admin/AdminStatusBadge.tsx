interface AdminStatusBadgeProps {
  status: string;
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const normalized = status.toUpperCase();
  
  let styles = "bg-muted text-muted-foreground"; // default
  
  if (normalized === 'APPROVED' || normalized === 'DELIVERED' || normalized === 'SUCCESS' || normalized === 'CUSTOMER') {
    styles = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  } else if (normalized === 'REJECTED' || normalized === 'CANCELLED' || normalized === 'FAILED') {
    styles = "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
  } else if (normalized === 'PENDING' || normalized === 'PROCESSING') {
    styles = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  } else if (normalized === 'DISPATCHED' || normalized === 'ADMIN') {
    styles = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  } else if (normalized === 'SHOPKEEPER') {
    styles = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles}`}>
      {status}
    </span>
  );
}
