import { DashboardShell } from "@/components/finance/dashboard-shell"

import { Providers } from "./providers"

export default function Home() {
  return (
    <Providers>
      <DashboardShell />
    </Providers>
  )
}
