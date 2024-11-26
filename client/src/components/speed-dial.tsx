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
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  actionButtons: Array<{
    icon: React.ReactNode;
    label: string;
    action: () => void;
    variant?: "default" | "ghost" | "outline";
    size?: "default" | "sm" | "lg";
  }>;
  className?: string;
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
}: SpeedDialProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const variants = directionVariants[direction];

  return (
    <TooltipProvider>
      <motion.div
        className={cn("relative flex gap-4", variants.container, className)}
        onHoverEnd={() => setIsOpen(false)}
      >
        <Button
          variant={variant}
          size={size}
          className={cn("relative z-20")}
          onMouseEnter={() => setIsOpen(true)}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={cn("absolute z-10 flex gap-4", variants.list)}
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={action.variant || variant}
                        size={action.size || size}
                        onClick={action.action}
                        className="relative z-10"
                      >
                        {action.icon}
                      </Button>
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
