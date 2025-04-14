import { useEffect } from "react";
import { useRouter } from "next/router";

const GitHubCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const code = router.query.code;

      if (code) {
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/github/callback?code=${code}`
          );
          const data = await res.json();

          if (data.jwt_token) {
            localStorage.setItem("token", data.jwt_token);
            router.push("/dashboard"); // redirect to a protected page
          } else {
            console.error("Login failed", data);
          }
        } catch (error) {
          console.error("Callback error", error);
        }
      }
    };

    fetchToken();
  }, [router]);

  return <div>Logging in...</div>;
};

export default GitHubCallback;