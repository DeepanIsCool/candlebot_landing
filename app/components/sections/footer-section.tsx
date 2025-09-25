import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

const footerLinks = {
  product: [
    { name: "Trading Platform", href: "#" },
    { name: "Mobile App", href: "#" },
    { name: "Calculators", href: "#" },
    { name: "Market Data", href: "#" },
    { name: "API Access", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Documentation", href: "#" },
    { name: "Community", href: "#" },
    { name: "Status", href: "#" },
    { name: "Security", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "Disclaimer", href: "#" },
    { name: "Compliance", href: "#" },
  ],
};

export function FooterSection() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/moneystocks_logo_ani.gif"
                  alt="MoneyStocks Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-foreground">
                MoneyStocks
              </span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Empowering traders and investors with cutting-edge technology,
              real-time data, and comprehensive financial tools.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-5 h-5 mr-3 text-primary" />
                <span>support@moneystocks.in</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <span>+91 70591 14483</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <span>Kolkata, West Bengal, India</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-2 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-foreground font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-1">
            <h3 className="text-foreground font-semibold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">
              Get the latest market insights and platform updates.
            </p>
            <div className="space-y-3">
              <Input
                placeholder="Enter your email"
                className="bg-card border-border text-foreground placeholder-muted-foreground"
              />
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Subscribe
              </Button>
            </div>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 MoneyStocks. All rights reserved. | SEBI Reg: INZ000123456
            </div>
            <div className="flex space-x-6">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
