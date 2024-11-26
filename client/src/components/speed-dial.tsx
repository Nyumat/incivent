/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import React from "react";

interface SpeedDialProps {
  direction?: "up" | "down" | "left" | "right";
  variant?: any;
  size?: "default" | "sm" | "lg";
  actionButtons: Array<{
    icon: React.ReactNode;
    label: string;
    trigger?: React.ReactNode;
    action?: () => void;
    variant?: any;
    size?: "default" | "sm" | "lg";
  }>;
  className?: string;
  loggedIn?: boolean;
}

const directionVariants = {
  up: {
    container: "flex-col",
    list: "flex-col-reverse items-center",
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    item: (index: number) => ({
      y: 20,
      opacity: 0,
      transition: { delay: index * 0.05 },
    }),
    itemAnimate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  },
  down: {
    container: "flex-col",
    list: "flex-col items-center",
    initial: { y: 0, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 0, opacity: 0 },
    item: (index: number) => ({
      y: 0,
      opacity: 0,
      transition: { delay: index * 0.05 },
    }),
    itemAnimate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  },
  left: {
    container: "flex-row",
    list: "flex-row-reverse items-center",
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    item: (index: number) => ({
      x: 20,
      opacity: 0,
      transition: { delay: index * 0.05 },
    }),
    itemAnimate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  },
  right: {
    container: "flex-row",
    list: "flex-row items-center",
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    item: (index: number) => ({
      x: -20,
      opacity: 0,
      transition: { delay: index * 0.05 },
    }),
    itemAnimate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  },
};

export const SpeedDial = ({
  direction = "up",
  variant = "default",
  size = "default",
  actionButtons,
  className,
  loggedIn,
}: SpeedDialProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const variants = directionVariants[direction];

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <TooltipProvider>
      <motion.div
        className={cn("relative flex gap-4", variants.container, className)}
        id="speed-dial"
      >
        <Tooltip delayDuration={0}>
          <TooltipContent side="left">
            <p>{loggedIn ? "Report Incident / Logout" : "Login / Signup"}</p>
          </TooltipContent>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className="relative z-20"
                          onClick={toggleOpen}
                          id="speed-dial-trigger"
            >
              <motion.div
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-4 h-4" />
              </motion.div>
            </Button>
          </TooltipTrigger>
        </Tooltip>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={cn("absolute z-10 mt-12 flex gap-4", variants.list)}
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
            >
              {actionButtons.map((action, index) => (
                <motion.div
                  key={index}
                  initial={variants.item(index)}
                  animate={variants.itemAnimate}
                >
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div>
                        {action.trigger || (
                          <Button
                            variant={action.variant || variant}
                            size={action.size || size}
                            onClick={action.action}
                          >
                            {action.icon}
                          </Button>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};
