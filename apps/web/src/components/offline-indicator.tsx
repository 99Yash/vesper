"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, Wifi, WifiOff } from "lucide-react";
import { useConnectivityStatus } from "~/hooks/use-connectivity-status";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const OfflineIndicator = () => {
  const { overallStatus, lastSyncTime } = useConnectivityStatus();

  if (overallStatus === 'online') return (
	    <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-status-done)] bg-[var(--color-status-done)]/10 px-3 py-2 text-sm font-medium text-[var(--color-status-done)]">
            <Wifi className="h-4 w-4 text-[var(--color-status-done)]" />
            <span>Online</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>Connected and synced</TooltipContent>
      </Tooltip>
	)

  const getStatusIcon = () => {
    switch (overallStatus) {
      case 'offline':
        return <WifiOff className="h-4 w-4 text-[var(--color-destructive)]" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-[var(--color-priority-high)]" />;
      default:
        return <Wifi className="h-4 w-4 text-[var(--color-muted-foreground)]" />;
    }
  };

  const getStatusText = () => {
    switch (overallStatus) {
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Connection issues';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (overallStatus) {
      case 'offline':
        return 'border-[var(--color-destructive)] bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]';
      case 'error':
        return 'border-[var(--color-priority-high)] bg-[var(--color-priority-high)]/10 text-[var(--color-priority-high)]';
      default:
        return 'border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]';
    }
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      
      {/* Show additional details when offline or in error state */}
      {(overallStatus === 'offline' || overallStatus === 'error') && lastSyncTime && (
        <div className="flex items-center gap-1 text-xs opacity-75">
          <Clock className="h-3 w-3" />
          <span>
            Last sync {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
          </span>
        </div>
      )}
    </div>
  );
};
