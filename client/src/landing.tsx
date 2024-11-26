import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Map, Menu, Pin, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { LiveAlertsLanding } from "./components/live-alerts-list";
import BlurFade from "./components/ui/blur-fade";
import HeroVideoDialog from "./components/ui/hero-video-dialog";
import Ripple from "./components/ui/ripple";
import { useUser } from "./hooks/use-user";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn } = useUser();

  const navItems = [
    { href: "#features", label: "Capabilities" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "https://github.com/nyumat/incivent", label: "GitHub" },
    { href: "https://devpost.com/software/dwitch", label: "Devpost" },
  ];

  return (
    <div className="min-h-screen bg-background font-serif overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl font-bold text-primary"
          >
            Incivent
          </motion.div>
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink href={item.href} className="px-4 py-2">
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-6 w-6 dark:text-white text-black" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="text-lg px-2 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
        className="container mx-auto px-4 pt-24 sm:pt-32 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl leading-tight tracking-tighter">
              <BlurFade delay={0.1} inView duration={0.6}>
                Alert Your Community. <br />
              </BlurFade>
              <BlurFade delay={1} inView duration={0.6}>
                Stay Informed. <br />
              </BlurFade>
              <BlurFade delay={2} inView duration={1}>
                Make a Difference.
              </BlurFade>
            </h1>
            <BlurFade delay={3} inView duration={0.5}>
              <p className="text-lg sm:text-xl text-muted-foreground">
                {isLoggedIn
                  ? "Welcome back to Incivent. Start exploring incidents in your area or report new ones to keep your community informed."
                  : "Welcome to the real-time incident tracking application to keep your neighborhood informed and safe; at any time and from anywhere."}
              </p>
            </BlurFade>
            <div className="flex gap-4 flex-wrap">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to={isLoggedIn ? "/platform" : "/platform?signup=true"}>
                  {isLoggedIn ? "Start Exploring" : "Get Started"}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link target="_blank" to="https://devpost.com/software/dwitch">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          <BlurFade delay={0} inView duration={1}>
            <div className="relative mt-8 lg:mt-0">
              <AspectRatio
                ratio={16 / 9}
                className="bg-muted rounded-lg overflow-hidden"
              >
                <img
                  src="/preview.png"
                  alt="Incivent Dashboard Preview"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-black/80 via-transparent" />
              </AspectRatio>
            </div>
          </BlurFade>
        </div>
      </motion.section>
      <section id="features" className="bg-muted/50 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={container}
          viewport={{ once: true }}
          className="container mx-auto px-4"
        >
          <motion.h2
            variants={item}
            className="text-4xl tracking-tighter font-bold text-center mb-12"
          >
            What Incivent Does
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-4 md:max-w-7xl mx-auto">
            <motion.div
              variants={item}
              className="col-span-1 md:col-span-2 row-span-1 md:row-span-3"
            >
              <Card className="h-full w-full">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Bell className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Live Alerts</h3>
                    <p className="text-muted-foreground">
                      Stay updated on emergencies, crimes, and incidents in your
                      area with real-time alerts.
                    </p>
                  </div>
                  <LiveAlertsLanding />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              variants={item}
              className="col-span-1 md:col-span-2 row-span-1 md:row-span-2"
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Map className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Interactive Map</h3>
                    <p className="text-muted-foreground">
                      Easily visualize incidents around the world with our
                      interactive map.
                    </p>
                  </div>
                  <AspectRatio
                    ratio={16 / 9}
                    className="bg-muted rounded-lg overflow-hidden"
                  >
                    <img
                      src="/main.png"
                      alt="Incident Map Preview"
                      className="object-cover"
                    />
                  </AspectRatio>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item} className="col-span-1">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold">Community Chat</h3>
                  <p className="text-muted-foreground">
                    Talk to others on the platform and share information about
                    incidents and emergencies.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item} className="col-span-1">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <Pin className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold">
                    Mark Points of Interest
                  </h3>
                  <p className="text-muted-foreground">
                    Mark points of interest on the map to stay informed and make
                    a difference in your community.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>
      <HowItWorksSection />
      <section id="get-started">
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={container}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center"
        >
          <div className="relative flex h-[600px] sm:h-[800px] w-full flex-col items-center justify-center rounded-lg bg-background space-y-4 overflow-hidden">
            <h2 className="z-10 text-center text-3xl sm:text-5xl font-medium tracking-tighter dark:text-white px-4">
              <span className="translate-y-12">Get Started Today</span>
              <Ripple className="absolute inset-0" />
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
              Join all the others using Incivent to stay informed{" "}
              <br className="hidden sm:block" />
              and make a difference in their communities.
            </p>
            <Button size="lg" asChild className="z-10">
              <Link
                to={isLoggedIn ? "/platform" : "/platform?signup=true"}
                className="gap-2"
              >
                {isLoggedIn ? "Start Exploring" : "Sign Up Now"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Incivent was created by{" "}
              <a href="https://tomnyuma.rocks" className="text-[#dc4405]">
                Nyumat
              </a>{" "}
              for the Fall 2024{" "}
              <a href="https://beaverhacks.org/" className="text-[#dc4405]">
                BeaverHacks
              </a>{" "}
              Hackathon.
            </p>
            <nav className="flex gap-4 sm:gap-6 flex-wrap justify-center">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                How It Works
              </a>
              <a
                href="https://github.com/nyumat/incivent"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href="https://devpost.com/software/dwitch"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                DevPost
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 mb-24">
      <motion.div
        initial="hidden"
        whileInView="show"
        variants={container}
        viewport={{ once: true }}
        className="container mx-auto px-4"
      >
        <motion.h2
          variants={item}
          className="text-4xl tracking-tighter font-bold text-center mb-16"
        >
          How It Works
        </motion.h2>
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight text-center md:text-justify">
              Explore & Report Incidents
            </h3>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                  1
                </div>
                <p className="text-muted-foreground text-xl">
                  Open the app and explore live incidents on a real-time map
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                  2
                </div>
                <p className="text-muted-foreground text-xl">
                  Filter incidents by type to focus on what matters most to you
                </p>
              </div>
            </div>
          </div>
          <AspectRatio
            ratio={16 / 9}
            className="bg-muted rounded-lg overflow-hidden"
          >
            <div className="relative">
              <HeroVideoDialog
                className="block"
                animationStyle="from-center"
                videoSrc="/demo.mov"
                thumbnailSrc="/main.png"
                thumbnailAlt="Incivent Main Demo"
              />
            </div>
          </AspectRatio>
        </motion.div>
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24"
        >
          <AspectRatio
            ratio={16 / 8}
            className="bg-muted rounded-lg overflow-hidden md:order-2"
          >
            <div className="relative">
              <HeroVideoDialog
                className="block"
                animationStyle="from-center"
                videoSrc="/real-time-demo.mov"
                thumbnailSrc="/real-time.png"
                thumbnailAlt="Real-time Incident Updates Demo"
              />
            </div>
          </AspectRatio>
          <div className="space-y-4 md:order-1">
            <h3 className="text-2xl font-semibold tracking-tight text-center md:text-justify">
              Real-time Incident Updates
            </h3>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                  3
                </div>
                <p className="text-muted-foreground text-xl">
                  Receive instant notifications when new incidents are reported
                  in your area
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                  4
                </div>
                <p className="text-muted-foreground text-xl">
                  Stay synchronized with other users as incidents are reported
                  and updated
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-tight text-center md:text-justify">
              Interactive Map Features
            </h3>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                  5
                </div>
                <p className="text-muted-foreground text-xl">
                  Click any incident to fly to its location and view detailed
                  information
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                  6
                </div>
                <p className="text-muted-foreground text-xl">
                  Incident creators can remove reports, with changes reflected
                  instantly for all users
                </p>
              </div>
            </div>
          </div>
          <AspectRatio
            ratio={16 / 9}
            className="bg-muted rounded-lg overflow-hidden"
          >
            <div className="relative">
              <HeroVideoDialog
                className="block"
                animationStyle="from-center"
                videoSrc="/flyto-delete-demo.mov"
                thumbnailSrc="/fly-to.png"
                thumbnailAlt="Interactive Map Features Demo"
              />
            </div>
          </AspectRatio>
        </motion.div>
      </motion.div>
    </section>
  );
}
