import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  isLoggedIn: boolean;
}

export const useUser = () => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const userData: User = await response.json();
          console.log(userData);
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          setUser(undefined);
          setIsLoggedIn(false);
          console.log("Failed to fetch user");
          throw new Error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(undefined);
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoggedIn };
};
