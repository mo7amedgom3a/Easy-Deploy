"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HOST, PORT, API_URL } from "@/lib/constants";

const LOGIN_ENDPOINT = `${API_URL}/github/callback`;

const GitHubCallback = () => {
    const router = useRouter();

    useEffect(() => {
        const fetchToken = async () => {
            const code = new URLSearchParams(window.location.search).get("code");

            if (code) {
                try {
                    const res = await fetch(`${LOGIN_ENDPOINT}?code=${code}`);
                    const data = await res.json();

                    if (data.jwt_token) {
                        if (typeof window !== 'undefined') {
                            localStorage.setItem("token", data.jwt_token);
                        }
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
