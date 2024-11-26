import { BASE_URL } from "@/lib/utils";
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
        const response = await fetch(`${BASE_URL}/api/auth/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          setUser(undefined);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(undefined);
        setIsLoggedIn(false);
      }
    };

    if (!isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn]);

  return { user, isLoggedIn };
};
