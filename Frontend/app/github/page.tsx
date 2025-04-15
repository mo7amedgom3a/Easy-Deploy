"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const GitHubCallback = () => {
  const router = useRouter()
  const [stage, setStage] = useState(0)
  const [dots, setDots] = useState("")

  // Animate loading dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)

    return () => clearInterval(dotsInterval)
  }, [])

  // Progress through authentication stages
  useEffect(() => {
    const stages = [
      800, // Connecting to GitHub
      1000, // Authenticating
      800, // Verifying credentials
      500, // Fetching profile
      1000, // Generating token
      500, // Redirecting
    ]

    if (stage < stages.length) {
      const timer = setTimeout(() => {
        setStage(stage + 1)
      }, stages[stage])

      return () => clearTimeout(timer)
    } else {
      // Redirect to dashboard when complete
      const redirectTimer = setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100)

      return () => clearTimeout(redirectTimer)
    }
  }, [stage, router])

  return (
    <div className="github-auth-container">
      <div className="github-auth-card">
        <div className="github-logo">
          <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.48 0-.236-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
        </div>

        <div className="auth-stages">
          <div className={`auth-stage ${stage >= 1 ? "active" : ""} ${stage > 1 ? "completed" : ""}`}>
            <div className="stage-indicator"></div>
            <div className="stage-content">
              <div className="stage-label">
                Connecting to GitHub{stage === 1 ? <span className="loading-dots">{dots}</span> : ""}</div>
              {stage > 1 && <div className="stage-checkmark">✓</div>}
            </div>
          </div>

          <div className={`auth-stage ${stage >= 2 ? "active" : ""} ${stage > 2 ? "completed" : ""}`}>
            <div className="stage-indicator"></div>
            <div className="stage-content">
              <div className="stage-label">
                Authenticating{stage === 2 ? <span className="loading-dots">{dots}</span> : ""}</div>
              {stage > 2 && <div className="stage-checkmark">✓</div>}
            </div>
          </div>

          <div className={`auth-stage ${stage >= 3 ? "active" : ""} ${stage > 3 ? "completed" : ""}`}>
            <div className="stage-indicator"></div>
            <div className="stage-content">
              <div className="stage-label">
                Verifying credentials{stage === 3 ? <span className="loading-dots">{dots}</span> : ""}</div>
              {stage > 3 && <div className="stage-checkmark">✓</div>}
            </div>
          </div>

          <div className={`auth-stage ${stage >= 4 ? "active" : ""} ${stage > 4 ? "completed" : ""}`}>
            <div className="stage-indicator"></div>
            <div className="stage-content">
              <div className="stage-label">
                Fetching profile{stage === 4 ? <span className="loading-dots">{dots}</span> : ""}</div>
              {stage > 4 && <div className="stage-checkmark">✓</div>}
            </div>
          </div>

          <div className={`auth-stage ${stage >= 5 ? "active" : ""} ${stage > 5 ? "completed" : ""}`}>
            <div className="stage-indicator"></div>
            <div className="stage-content">
              <div className="stage-label">
                Generating token{stage === 5 ? <span className="loading-dots">{dots}</span> : ""}</div>
              {stage > 5 && <div className="stage-checkmark">✓</div>}
            </div>
          </div>

          <div className={`auth-stage ${stage >= 6 ? "active" : ""}`}>
            <div className="stage-indicator"></div>
            <div className="stage-content">
              <div className="stage-label">
                Redirecting{stage === 6 ? <span className="loading-dots">{dots}</span> : ""}</div>
            </div>
          </div>
        </div>

        <div className="auth-progress-container">
          <div className="auth-progress-bar" style={{ width: `${Math.min(100, (stage / 6) * 100)}%` }}></div>
        </div>
      </div>

      <div className="auth-message">
        {stage < 6
          ? "Please wait while we authenticate your GitHub account"
          : "Authentication successful! Redirecting..."}
      </div>
    </div>
  )
}

export default GitHubCallback;
