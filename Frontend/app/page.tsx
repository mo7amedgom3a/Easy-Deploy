import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Code, Github, GitMerge, Rocket, Server, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Rocket className="h-6 w-6" />
            <span>DeployWave</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section with Background Image */}
        <section className="relative min-h-[90vh] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/cloud-deployment.png"
              alt="Cloud deployment infrastructure"
              fill
              className="object-cover"
              priority
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          </div>

          {/* Content */}
          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Deploy Your Code with Zero DevOps Hassle
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl">
                Connect your GitHub repository and we'll handle the entire DevOps pipeline. Build, test, deploy, and
                scale your applications automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90" asChild>
                  <Link href="/login">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/login">
                    <Github className="h-4 w-4" /> Connect GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to deploy and manage your applications without DevOps expertise.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border bg-background">
                  <CardHeader>
                    <div className="p-2 w-fit rounded-md bg-primary/10 mb-3">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Deploy your application in three simple steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <span className="text-xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-16 text-center">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/login">
                  Start Deploying Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your needs. All plans include our core features.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`border ${plan.featured ? "border-primary shadow-lg" : ""}`}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4 mb-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 mr-2 text-primary"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.featured ? "default" : "outline"} asChild>
                      <Link href="/login">{plan.featured ? "Get Started" : "Choose Plan"}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of developers who have simplified their deployment process.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="font-semibold">{testimonial.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Simplify Your Deployment?</h2>
              <p className="text-lg md:text-xl max-w-2xl">
                Join thousands of developers who have streamlined their workflow with our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" variant="secondary" className="gap-2" asChild>
                  <Link href="/login">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/login">
                    <Github className="h-4 w-4" /> Connect GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                <Rocket className="h-6 w-6" />
                <span>DeployWave</span>
              </div>
              <p className="text-muted-foreground">Simplifying DevOps for developers since 2023.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>© 2023 DeployWave. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: <Github className="h-5 w-5 text-primary" />,
    title: "GitHub Integration",
    description: "Connect your GitHub repository with a single click and we'll handle the rest.",
  },
  {
    icon: <GitMerge className="h-5 w-5 text-primary" />,
    title: "Automated CI/CD",
    description: "Automatic builds and deployments on every push to your repository.",
  },
  {
    icon: <Server className="h-5 w-5 text-primary" />,
    title: "Scalable Infrastructure",
    description: "Your application automatically scales based on traffic and demand.",
  },
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "Instant Rollbacks",
    description: "One-click rollbacks to any previous deployment if something goes wrong.",
  },
  {
    icon: <Code className="h-5 w-5 text-primary" />,
    title: "Environment Variables",
    description: "Securely manage environment variables across all your deployments.",
  },
  {
    icon: <Rocket className="h-5 w-5 text-primary" />,
    title: "Custom Domains",
    description: "Connect your own domain and we'll handle SSL certificates automatically.",
  },
]

const steps = [
  {
    title: "Connect Repository",
    description: "Link your GitHub repository to our platform with a single click.",
  },
  {
    title: "Configure Settings",
    description: "Set your environment variables and deployment preferences.",
  },
  {
    title: "Deploy & Scale",
    description: "We'll automatically build, deploy, and scale your application.",
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for side projects and experiments.",
    features: ["1 project", "Automated deployments", "GitHub integration", "Community support"],
    featured: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "For professional developers and small teams.",
    features: ["10 projects", "Automated deployments", "Custom domains", "Environment variables", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "99",
    description: "For growing teams with advanced needs.",
    features: [
      "Unlimited projects",
      "Advanced security",
      "Team collaboration",
      "Custom integrations",
      "Dedicated support",
    ],
    featured: false,
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Frontend Developer",
    quote:
      "DeployWave has completely transformed our deployment process. What used to take hours now happens automatically with every push.",
  },
  {
    name: "Michael Chen",
    role: "CTO at StartupX",
    quote:
      "We eliminated an entire DevOps position by switching to DeployWave. The ROI has been incredible for our small team.",
  },
  {
    name: "Jessica Williams",
    role: "Full Stack Developer",
    quote:
      "The simplicity is what sold me. I can focus on writing code instead of managing infrastructure and deployment pipelines.",
  },
  {
    name: "David Rodriguez",
    role: "Lead Developer",
    quote:
      "Our team's productivity increased by 30% after moving our deployment process to DeployWave. Highly recommended!",
  },
  {
    name: "Emma Thompson",
    role: "Indie Developer",
    quote:
      "As a solo developer, I don't have time for complex DevOps. DeployWave lets me deploy professional-grade apps effortlessly.",
  },
  {
    name: "Alex Patel",
    role: "Engineering Manager",
    quote:
      "We've tried several deployment platforms, but DeployWave offers the perfect balance of simplicity and power for our team.",
  },
]

