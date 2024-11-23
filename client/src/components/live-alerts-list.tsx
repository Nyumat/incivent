"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "./ui/animated-list";
import { Badge } from "./ui/badge";

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
  category: string;
}

let notifications = [
  {
    name: "Suspicious Activity Reported",
    description: "Person looking into parked vehicles on Main St",
    time: "2m ago",
    icon: "🚨",
    color: "#FF3D71",
    category: "Alert",
  },
  {
    name: "Traffic Hazard Alert",
    description: "Large pothole on 5th Avenue",
    time: "5m ago",
    icon: "⚠️",
    color: "#FFB800",
    category: "Hazard",
  },
  {
    name: "Emergency Response",
    description: "Medical emergency at Central Park",
    time: "8m ago",
    icon: "🚑",
    color: "#FF0000",
    category: "Emergency",
  },
  {
    name: "Community Alert",
    description: "Lost dog spotted near Oak Street",
    time: "12m ago",
    icon: "📢",
    color: "#1E86FF",
    category: "Alert",
  },
  {
    name: "Infrastructure Issue",
    description: "Broken street light on Pine Road",
    time: "15m ago",
    icon: "🔧",
    color: "#00C9A7",
    category: "Hazard",
  },
  {
    name: "Weather Warning",
    description: "Flash flood warning in downtown area",
    time: "18m ago",
    icon: "🌧️",
    color: "#9B51E0",
    category: "Hazard",
  },
];

notifications = Array.from({ length: 5 }, () => notifications).flat();

const Notification = ({
  name,
  description,
  icon,
  color,
  time,
  category,
}: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="absolute top-4 right-4">
        <Badge
          className={cn({
            "bg-red-100 text-red-800": category === "Emergency",
            "bg-yellow-100 text-yellow-800": category === "Hazard",
            "bg-blue-100 text-blue-800": category === "Alert",
          })}
        >
          {category}
        </Badge>
      </div>
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function LiveAlertsLanding({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col p-6 overflow-hidden rounded-lg border bg-background md:shadow-xl",
        className
      )}
    >
      <AnimatedList delay={1500} className="min-w-full">
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  );
}
