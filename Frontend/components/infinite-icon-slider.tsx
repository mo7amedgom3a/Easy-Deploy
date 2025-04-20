"use client"

import { useRef } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { useState } from "react"

export default function InfiniteIconSlider() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const controls = useAnimationControls()

  const icons = [
    { src: "/github.svg", name: "GitHub" },
    { src: "/docker.svg", name: "Docker" },
    { src: "/aws.svg", name: "AWS" },
    { src: "/terraform.svg", name: "Terraform" },
    { src: "/kubernetes.svg", name: "Kubernetes" },
    { src: "/ansible.svg", name: "Ansible" },
    { src: "/python.svg", name: "Python" },
    { src: "/nodejs.svg", name: "Node.js" }
  ]

  const duplicatedIcons = [...icons, ...icons]

  const handleMouseEnter = () => {
    setIsPaused(true)
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
    <div className="relative m-auto overflow-hidden  before:absolute before:left-0 before:top-0 before:z-[2] before:h-full before:w-[100px] before:bg-[linear-gradient(to_right,white_0%,rgba(255,255,255,0)_100%)] before:content-[''] after:absolute after:right-0 after:top-0 after:z-[2] after:h-full after:w-[100px] after:-scale-x-100 after:bg-[linear-gradient(to_right,white_0%,rgba(255,255,255,0)_100%)] after:content-['']">
      <div
        ref={sliderRef}
        className="animate-infinite-slider flex w-[calc(250px*10)]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="flex"
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
            <div
              key={`${item.name}-${index}`}
              className="slide flex w-[125px] flex-col items-center justify-center group"
            >
              <img
                src={item.src}
                alt={item.name}
                className="w-10 h-10 text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
              />
              <span className="mt-2 text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                {item.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}