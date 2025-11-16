"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BetAnalysis from "./BetAnalysis"
import BetComparison from "./BetComparison"
import ExtendedStatistics from "./ExtendedStatistics"
import { BarChart3, Search, GitCompare, LayoutDashboard } from "lucide-react"

interface DashboardTabsProps {
  overviewContent: React.ReactNode
}

export function DashboardTabs({ overviewContent }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
        <TabsTrigger value="overview" className="gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Visão Geral</span>
          <span className="sm:hidden">Início</span>
        </TabsTrigger>
        <TabsTrigger value="analysis" className="gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Análise</span>
          <span className="sm:hidden">Análise</span>
        </TabsTrigger>
        <TabsTrigger value="comparison" className="gap-2">
          <GitCompare className="h-4 w-4" />
          <span className="hidden sm:inline">Comparar</span>
          <span className="sm:hidden">Comparar</span>
        </TabsTrigger>
        <TabsTrigger value="statistics" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Estatísticas</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        {overviewContent}
      </TabsContent>

      <TabsContent value="analysis" className="mt-0">
        <BetAnalysis />
      </TabsContent>

      <TabsContent value="comparison" className="mt-0">
        <BetComparison />
      </TabsContent>

      <TabsContent value="statistics" className="mt-0">
        <ExtendedStatistics />
      </TabsContent>
    </Tabs>
  )
}
