"use client"

import { useRef, useEffect } from "react"
import { motion, useAnimationControls } from "framer-motion"

export default function InfiniteIconSlider() {
  const sliderRef = useRef<HTMLDivElement>(null)
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

  const singleSetWidth = icons.length * 125; // Calculate width of one set of icons (8 * 125 = 1000)
  const animationConfig = {
    x: [0, -singleSetWidth], // Animate by the width of one icon set
    transition: {
      x: {
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
        duration: 30,
        ease: "linear",
      },
    },
  };

  useEffect(() => {
    controls.start(animationConfig);
  }, [controls]);

  return (
    <div className="relative m-auto overflow-hidden before:absolute before:left-0 before:top-0 before:z-[2] before:h-full before:w-[100px] before:bg-[linear-gradient(to_right,var(--slider-gradient-from)_0%,var(--slider-gradient-to)_100%)] before:content-[''] after:absolute after:right-0 after:top-0 after:z-[2] after:h-full after:w-[100px] after:-scale-x-100 after:bg-[linear-gradient(to_right,var(--slider-gradient-from)_0%,var(--slider-gradient-to)_100%)] after:content-['']">
      <div
        ref={sliderRef}
        className="flex"
      >
        <motion.div
          className="flex"
          animate={controls}
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
              <span className="mt-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors duration-300">
                {item.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
