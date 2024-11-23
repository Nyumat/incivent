import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

type AuthProps = {
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string) => void;
};

export function LoginDialog({ onLogin }: Pick<AuthProps, "onLogin">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("login") === "true") {
      setTimeout(() => {
        setOpen(true);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }, 500);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <LogIn className="w-4 h-4" /> Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(email, password);
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit">Login</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SignupDialog({ onSignup }: Pick<AuthProps, "onSignup">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("signup") === "true") {
      setTimeout(() => {
        setOpen(true);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }, 500);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <UserPlus className="w-4 h-4" /> Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSignup(email, password, name);
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit">Create Account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
