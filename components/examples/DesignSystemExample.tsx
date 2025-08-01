/**
 * Example component demonstrating CourseFlow Design System
 * This serves as a reference for future implementations
 */

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { BookOpen, Calendar, FileText, TrendingUp } from 'lucide-react';
import { colors } from '@/lib/constants/colors';

export function DesignSystemExample() {
  return (
    <div className="space-y-8 p-8">
      {/* Page Title Example */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-courseflow-sectionHeader mb-2">
          Page Title Example
        </h1>
        <p className="text-muted-foreground">
          This demonstrates the CourseFlow design system patterns
        </p>
      </motion.div>

      {/* Section with Cards */}
      <section>
        <h2 className="text-base font-semibold text-courseflow-sectionHeader mb-3">
          Section Header Example
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Stats Card Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-courseflow-primaryLight">
                  <BookOpen className="h-5 w-5 text-courseflow-primary" />
                </div>
                <div>
                  <p className="text-xs text-courseflow-cardTitle font-medium">
                    Card Title
                  </p>
                  <h3 className="text-xl font-bold text-foreground">42</h3>
                  <span className="text-xs text-courseflow-termStatus">
                    Current Status
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Feature Card Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-card border-border shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-courseflow-cardTitle group-hover:text-primary transition-colors">
                  Feature Card
                </h3>
                <p className="text-sm text-muted-foreground">
                  This is a description of the feature with hover effects
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-courseflow-termStatus">
                    Sommersemester 2025
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Card Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-courseflow-primaryLight to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative space-y-2">
                <div className="p-3 rounded-lg bg-courseflow-primaryMedium w-fit">
                  <FileText className="h-6 w-6 text-courseflow-primary" />
                </div>
                <h3 className="text-base font-semibold text-courseflow-cardTitle">
                  Action Item
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click to perform this action
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Color Reference */}
      <section>
        <h2 className="text-base font-semibold text-courseflow-sectionHeader mb-3">
          Color Reference
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-16 rounded-lg bg-courseflow-primary" />
            <p className="text-xs text-muted-foreground">Primary Teal</p>
            <code className="text-xs">#8CC2BE</code>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-lg bg-courseflow-sectionHeader" />
            <p className="text-xs text-muted-foreground">Section Headers</p>
            <code className="text-xs">#49C993</code>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-lg bg-courseflow-cardTitle" />
            <p className="text-xs text-muted-foreground">Card Titles</p>
            <code className="text-xs">#FFC194</code>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-lg bg-courseflow-termStatus" />
            <p className="text-xs text-muted-foreground">Term/Status</p>
            <code className="text-xs">#FF7878</code>
          </div>
        </div>
      </section>

      {/* Shadow Examples */}
      <section>
        <h2 className="text-base font-semibold text-courseflow-sectionHeader mb-3">
          Shadow & Glow Effects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 shadow-lg">
            <p className="text-sm">Default Shadow (shadow-lg)</p>
          </Card>
          <Card className="p-6 shadow-xl">
            <p className="text-sm">Hover Shadow (shadow-xl)</p>
          </Card>
          <Card className="p-6 shadow-[0_0_50px_rgba(140,194,190,0.8)]">
            <p className="text-sm">Teal Glow Effect</p>
          </Card>
        </div>
      </section>
    </div>
  );
}