import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { motion } from "framer-motion";
import { ArrowRight, Bell, List, Map, Users } from "lucide-react";
import { Link } from "react-router";
import { LiveAlertsLanding } from "./components/live-alerts-list";
import BlurFade from "./components/ui/blur-fade";
import HeroVideoDialog from "./components/ui/hero-video-dialog";
import Ripple from "./components/ui/ripple";

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
  return (
    <div className="min-h-screen bg-background font-serif">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-primary"
          >
            Incivent
          </motion.div>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="#features" className="px-4 py-2">
                  Capabilities
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#how-it-works" className="px-4 py-2">
                  How It Works
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="https://github.com/nyumat/incivent"
                  className="px-4 py-2"
                >
                  GitHub
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
        className="container mx-auto px-4 pt-32 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-6xl leading-tight tracking-tighter">
              <BlurFade delay={0.1} inView duration={0.6}>
                Alert Your Community. <br />
              </BlurFade>
              <BlurFade delay={1} inView duration={0.6}>
                Save Lives. <br />
              </BlurFade>
              <BlurFade delay={2} inView duration={1}>
                Incivent.
              </BlurFade>
            </h1>

            <BlurFade delay={3} inView duration={0.5}>
              <p className="text-xl text-muted-foreground">
                A real-time incident tracking application to keep your
                neighborhood informed and safe, at any time and from anywhere.
              </p>
            </BlurFade>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/platform?signup=true">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link target="_blank" to="https://github.com/nyumat">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          <BlurFade delay={0} inView duration={1}>
            <div className="relative">
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
          <div className="grid grid-cols-4 grid-rows-3 gap-4 max-w-7xl mx-auto">
            <motion.div variants={item} className="col-span-2 row-span-3">
              <Card className="h-full w-full">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Bell className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Live Alerts</h3>
                    <p className="text-muted-foreground">
                      Stay updated on emergencies, crimes, and events as they
                      happen.
                    </p>
                  </div>
                  <LiveAlertsLanding />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item} className="col-span-2 row-span-2">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Map className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Interactive Map</h3>
                    <p className="text-muted-foreground">
                      Easily visualize incidents around your area with a dynamic
                      interface.
                    </p>
                  </div>
                  <AspectRatio
                    ratio={16 / 9}
                    className="bg-muted rounded-lg overflow-hidden"
                  >
                    <img
                      src="/main.png"
                      alt="Incivent Map Preview"
                      className="object-cover"
                    />
                  </AspectRatio>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold">Community Reporting</h3>
                  <p className="text-muted-foreground">
                    Report incidents and share information with your neighbors
                    to improve safety together.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <List className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold">Neighborhood Forums</h3>
                  <p className="text-muted-foreground">
                    Engage in discussions and share resources with your
                    geographical community.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>
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
            className="text-4xl tracking-tighter font-bold text-center my-12"
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-12">
            <motion.div variants={item} className="space-y-8">
              {[
                "Open the app and explore live incidents on a real-time map.",
                "Filter incidents by type to focus on what matters most to you.",
                "Access detailed information for each report, including updates and community insights.",
                "Enable notifications to stay informed wherever you are.",
              ].map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground text-xl">{step}</p>
                </div>
              ))}
            </motion.div>
            <motion.div variants={item}>
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
                    thumbnailAlt="Incivent Demo"
                  />
                </div>
              </AspectRatio>
            </motion.div>
          </div>
        </motion.div>
      </section>
      <section id="get-started">
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={container}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center"
        >
          <div className="relative flex h-[800px] w-full flex-col items-center justify-center  rounded-lg bg-background space-y-4">
            <h2 className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
              <span className="translate-y-12">Get Started Today</span>
              <Ripple />
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join all the others using Incivent to stay informed <br />
              and make a difference in their communities.
            </p>
            <Button size="lg" asChild>
              <a href="/platform?signup=true" className="gap-2">
                Sign Up Now <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.div>
      </section>
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
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
            <nav className="flex gap-6">
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
                href="https://devpost.com/software/incivent"
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
