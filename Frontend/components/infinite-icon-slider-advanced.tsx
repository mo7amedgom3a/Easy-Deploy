"use client"

import { useState } from "react"
import { motion, useAnimationControls } from "framer-motion"
import {
  Github,
  DockIcon as Docker,
  Cloud,
  Database,
  Server,
  Code,
  Terminal,
  Cpu,
  Layers,
  GitBranch,
} from "lucide-react"

export default function InfiniteIconSliderAdvanced() {
  const [isPaused, setIsPaused] = useState(false)
  const controls = useAnimationControls()

  // Define the icons with their names
  const icons = [
    { Icon: Github, name: "GitHub" },
    { Icon: Docker, name: "Docker" },
    { Icon: Cloud, name: "AWS" },
    { Icon: Layers, name: "Terraform" },
    { Icon: Cpu, name: "Kubernetes" },
    { Icon: Terminal, name: "Ansible" },
    { Icon: Code, name: "Python" },
    { Icon: Server, name: "Node.js" },
    { Icon: Database, name: "MongoDB" },
    { Icon: GitBranch, name: "GitLab" },
  ]

  // Duplicate the icons to create a seamless loop
  const duplicatedIcons = [...icons, ...icons]

  const handleMouseEnter = () => {
    setIsPaused(true)
    // controls.stop()
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
    controls.start({
      x: [0, -1920],
      transition: {
        x: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: 30,
          ease: "linear",
        },
      },
    })
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <motion.div
            className="flex space-x-12 py-4"
            animate={controls}
            initial={{
              x: 0,
            }}
            onAnimationStart={() => {
              if (!isPaused) {
                controls.start({
                  x: [0, -1920],
                  transition: {
                    x: {
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      duration: 30,
                      ease: "linear",
                    },
                  },
                })
              }
            }}
          >
            {duplicatedIcons.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex flex-col items-center justify-center group">
                <item.Icon
                  size={40}
                  className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
                />
                <span className="mt-2 text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                  {item.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
