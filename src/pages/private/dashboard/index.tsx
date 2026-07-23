import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { useRequests } from "@/hooks/useRequests"
import { orgApi } from "@/api/organizations.api"
import { useOutlets } from "@/hooks/useOutlets"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  IconBuildingStore,
  IconListDetails,
  IconArrowRight,
  IconClock,
  IconUsers,
  IconSettings,
  IconFileText,
} from "@tabler/icons-react"
import { APP_NAME } from "@/utils/constants"

// QK for Query Cache
const QK = {
  orgs: ["organizations"] as const,
  outlets: ["outlets"] as const,
}

export default function Dashboard() {
  // Queries
  const { data: requests = [], isLoading: requestsLoading } = useRequests()
  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: QK.orgs,
    queryFn: orgApi.list,
  })
  const { data: outlets = [], isLoading: outletsLoading } = useOutlets()

  // Statistics
  const activeOrgsCount = orgs.filter((o) => !o.deletedAt).length
  const activeOutletsCount = outlets.filter((o) => !o.deletedAt).length
  const pendingRequestsCount = requests.length // Active requests represent the waitlist

  // Get top 3 most recent requests
  const recentRequests = [...requests]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Admin Portal Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">
          Welcome to the {APP_NAME} management suite. Monitor system statistics
          and perform administration task.
        </p>
      </div>

      <Separator />

      {/* ── Statistics Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <IconClock className="size-4 animate-pulse text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requestsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                pendingRequestsCount
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Waitlisted partners
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Organizations
            </CardTitle>
            <IconBuildingStore className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orgsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                activeOrgsCount
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Onboarded restaurant entities
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Outlets
            </CardTitle>
            <IconListDetails className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outletsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                activeOutletsCount
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Live operating restaurant branches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Dashboard Columns ── */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Recent Requests Summary */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <Card className="flex h-full flex-col justify-between shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">
                    Recent Early Access Signups
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Latest submissions looking for {APP_NAME} platform
                    onboarding.
                  </CardDescription>
                </div>
                <Link to="/requests">
                  <Button variant="link" size="sm" className="gap-1 text-xs">
                    View All
                    <IconArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {requestsLoading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <IconFileText className="mb-2 size-8 opacity-20" />
                  <p className="text-xs">
                    No restaurant requests registered in waitlist.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentRequests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">
                          {req.restaurantName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Contact: {req.name} ({req.email})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.city && (
                          <Badge variant="secondary" className="text-[10px]">
                            {req.city}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Admin Shortcuts & Quicklinks */}
        <div className="flex flex-col gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                Quick Administrative Links
              </CardTitle>
              <CardDescription className="text-xs">
                Jump directly to specific portal management sectors.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link to="/requests" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  size="sm"
                >
                  <span className="flex items-center gap-2">
                    <IconClock className="size-4 text-primary" />
                    Manage Requests Waitlist
                  </span>
                  <IconArrowRight className="size-3.5" />
                </Button>
              </Link>

              <Link to="/organizations" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  size="sm"
                >
                  <span className="flex items-center gap-2">
                    <IconBuildingStore className="size-4 text-primary" />
                    Manage Organizations
                  </span>
                  <IconArrowRight className="size-3.5" />
                </Button>
              </Link>

              <Link to="/plans" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  size="sm"
                >
                  <span className="flex items-center gap-2">
                    <IconSettings className="size-4 text-primary" />
                    System Pricing Plans
                  </span>
                  <IconArrowRight className="size-3.5" />
                </Button>
              </Link>

              <Link to="/staff" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  size="sm"
                >
                  <span className="flex items-center gap-2">
                    <IconUsers className="size-4 text-primary" />
                    System Administrators
                  </span>
                  <IconArrowRight className="size-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
