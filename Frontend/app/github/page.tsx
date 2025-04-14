"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";

const GitHubCallback = () => {
 

  useEffect(() => {
    const fetchToken = async () => {
      const code = window.location.search.split("=")[1];

      if (code) {
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/auth/github/callback?code=${code}`
          );
          const data = await res.json();

          if (data.jwt_token) {
            localStorage.setItem("token", data.jwt_token);
            window.location.href = "/dashboard";
            console.error("Login failed", data);
          }
        } catch (error) {
          console.error("Callback error", error);
        }
      }
    };

    fetchToken();
  }, []);

  return <div>Logging in...</div>;
};

export default GitHubCallback;