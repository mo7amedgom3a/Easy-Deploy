"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

export function useMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const isMobile = useMobile()
  const [open, setOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)

  // Set cookie when sidebar state changes
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }
  }, [open])

  // Read cookie on initial load
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";")
      const sidebarCookie = cookies.find((cookie) => cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`))

      if (sidebarCookie) {
        const sidebarState = sidebarCookie.split("=")[1]
        setOpen(sidebarState === "true")
      }
    }
  }, [])

  // Add keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setOpen((prev) => !prev)
    }
  }, [isMobile])

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }}
    >
      <TooltipProvider delayDuration={0}>
        <div
          className={cn("group/sidebar-wrapper flex min-h-screen w-full", className)}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            } as React.CSSProperties
          }
          data-sidebar-open={open}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}

const sidebarVariants = cva(
  "duration-300 fixed inset-y-0 z-30 flex h-full flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-r transition-all ease-in-out",
  {
    variants: {
      variant: {
        default: "",
        floating: "m-2 rounded-xl border shadow-lg",
        inset: "bg-muted/50",
      },
      side: {
        left: "left-0",
        right: "right-0 border-l border-r-0",
      },
      collapsible: {
        icon: "",
        offcanvas: "",
        none: "",
      },
    },
    compoundVariants: [
      {
        side: "left",
        collapsible: "offcanvas",
        className: "data-[state=closed]:-translate-x-full",
      },
      {
        side: "right",
        collapsible: "offcanvas",
        className: "data-[state=closed]:translate-x-full",
      },
    ],
    defaultVariants: {
      variant: "default",
      side: "left",
      collapsible: "icon",
    },
  },
)

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

export function Sidebar({
  children,
  className,
  variant = "default",
  side = "left",
  collapsible = "icon",
  ...props
}: SidebarProps) {
  const { open, isMobile, openMobile } = useSidebar()
  const state = open ? "open" : "closed"

  if (isMobile) {
    return (
      <aside
        data-state={openMobile ? "open" : "closed"}
        data-side={side}
        data-variant={variant}
        className={cn(
          sidebarVariants({ variant, side, collapsible }),
          "md:hidden",
          openMobile ? "translate-x-0" : "-translate-x-full",
          className,
        )}
        {...props}
      >
        <div className="flex h-full flex-col">{children}</div>
      </aside>
    )
  }

  return (
    <>
      <aside
        data-state={state}
        data-side={side}
        data-variant={variant}
        data-collapsible={!open ? collapsible : ""}
        className={cn(
          sidebarVariants({ variant, side, collapsible }),
          "hidden md:flex",
          open ? "w-[var(--sidebar-width)]" : collapsible === "icon" ? "w-[var(--sidebar-width-icon)]" : "w-0",
          className,
        )}
        {...props}
      >
        <div className="flex h-full flex-col">{children}</div>
        <SidebarRail />
      </aside>
    </>
  )
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar()

  return (
    <div
      className={cn("flex h-16 items-center border-b px-4", open || isMobile ? "justify-between" : "justify-center")}
    >
      {open || isMobile ? (
        children
      ) : (
        <div className="flex items-center justify-center">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === "div") {
      const firstChild = React.Children.toArray((child.props as React.HTMLAttributes<HTMLDivElement>).children)[0]
              if (React.isValidElement(firstChild)) {
                return React.cloneElement(firstChild)
              }
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-auto py-2">{children}</div>
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t py-2">{children}</div>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1 px-2">{children}</ul>
}

export function SidebarMenuItem({ children, className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("group/menu-item relative", className)} {...props}>
      {children}
    </li>
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-ring transition-[width,height,padding] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[state=open]:hover:bg-accent data-[state=open]:hover:text-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-accent hover:text-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--border))] hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  isActive?: boolean
  asChild?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
}

export function SidebarMenuButton({
  children,
  className,
  variant,
  size,
  isActive = false,
  asChild = false,
  tooltip,
  ...props
}: SidebarMenuButtonProps) {
  const { open, isMobile } = useSidebar()
  const Comp = asChild ? Slot : "button"

  const button = (
    <Comp
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), open || isMobile ? "" : "justify-center", className)}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (index === 0 || open || isMobile) {
          return child
        }
        return null
      })}
    </Comp>
  )

  if (!tooltip || isMobile) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={open || isMobile}
        {...(typeof tooltip === "string" ? { children: tooltip } : tooltip)}
      />
    </Tooltip>
  )
}

export function SidebarMenuSub({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar()
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="space-y-1">
      {React.Children.map(children, (child, index) => {
        if (index === 0 && React.isValidElement(child) && child.type === SidebarMenuSubButton) {
          return React.cloneElement(child as React.ReactElement, {
            onClick: () => setExpanded(!expanded),
            expanded,
          })
        }
        if ((open || isMobile) && expanded) {
          return child
        }
        return null
      })}
    </div>
  )
}

interface SidebarMenuSubButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  expanded?: boolean
}

export function SidebarMenuSubButton({ children, expanded, ...props }: SidebarMenuSubButtonProps) {
  const { open, isMobile } = useSidebar()

  return (
    <button
      {...props}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        open || isMobile ? "justify-between" : "justify-center",
      )}
    >
      <div className="flex items-center gap-2">
        {React.Children.map(children, (child, index) => {
          if (index === 0 || open || isMobile) {
            return child
          }
          return null
        })}
      </div>
      {(open || isMobile) && (
        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded ? "rotate-180" : "")} />
      )}
    </button>
  )
}

export function SidebarMenuSubItem({ children }: { children: React.ReactNode }) {
  return <li className="pl-4">{children}</li>
}

export function SidebarSeparator() {
  return <div className="my-2 border-t" />
}

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", className)}
        onClick={(event) => {
          onClick?.(event)
          toggleSidebar()
        }}
        {...props}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-1 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-border data-[side=left]:right-0 data-[side=right]:left-0 md:flex",
          "cursor-col-resize",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  const { open, isMobile } = useSidebar()

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-screen flex-1 flex-col bg-background transition-all duration-300 ease-in-out",
        !isMobile && open ? "md:ml-[var(--sidebar-width)]" : !isMobile ? "md:ml-[var(--sidebar-width-icon)]" : "",
        className,
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        data-sidebar="input"
        className={cn("h-8 w-full bg-background shadow-none focus-visible:ring-2", className)}
        {...props}
      />
    )
  },
)
SidebarInput.displayName = "SidebarInput"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    const { open, isMobile } = useSidebar()

    if (!open && !isMobile) {
      return null
    }

    return (
      <Comp
        ref={ref}
        data-sidebar="group-label"
        className={cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { open, isMobile } = useSidebar()

    if (!open && !isMobile) {
      return null
    }

    return (
      <Comp
        ref={ref}
        data-sidebar="group-action"
        className={cn(
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-muted-foreground outline-none transition-transform hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          // Increases the hit area of the button on mobile.
          "after:absolute after:-inset-2 after:md:hidden",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />
  ),
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

// Define SidebarMenuAction and SidebarMenuBadge
const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean; showOnHover?: boolean }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { open, isMobile } = useSidebar()

  if (!open && !isMobile) {
    return null
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-muted-foreground outline-none transition-transform hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-accent-foreground md:opacity-0",
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    const { open, isMobile } = useSidebar()

    return (
      <div
        ref={ref}
        data-sidebar="menu-badge"
        className={cn(
          "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-foreground select-none pointer-events-none",
          "peer-hover/menu-button:text-accent-foreground peer-data-[active=true]/menu-button:text-accent-foreground",
          "peer-data-[size=sm]/menu-button:top-1",
          "peer-data-[size=default]/menu-button:top-1.5",
          "peer-data-[size=lg]/menu-button:top-2.5",
          !open && !isMobile ? "opacity-0" : "",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

export {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarInset,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarTrigger,
}

