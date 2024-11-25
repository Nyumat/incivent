import { BASE_URL } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();

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
          console.log("Failed to fetch user");
          navigate("/platform?login=true");
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
