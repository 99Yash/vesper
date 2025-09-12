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
				<Wifi className="h-4 w-4 text-green-500" />
			</TooltipTrigger>
			<TooltipContent>
				Online
			</TooltipContent>
		</Tooltip>
	)

  const getStatusIcon = () => {
    switch (overallStatus) {
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
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
        return 'border-red-200 bg-red-50 text-red-800';
      case 'error':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
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
