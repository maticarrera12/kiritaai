"use client";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <CardDescription>
              <Skeleton className="h-4 w-24" />
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              <Skeleton className="h-8 w-32" />
            </CardTitle>
            <CardAction>
              <Skeleton className="h-6 w-20 rounded-full" />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium w-full">
              <Skeleton className="h-4 flex-1" />
            </div>
            <Skeleton className="h-4 w-48" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function SectionCards() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading) return <SectionCardsSkeleton />;

  const { revenue, users, accounts, growthRate } = data;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            ${revenue.total.toLocaleString()}
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              {revenue.trendingUp ? <IconTrendingUp /> : <IconTrendingDown />}
              {revenue.growth.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {revenue.trendingUp ? "Trending up" : "Trending down"} this month
            {revenue.trendingUp ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>

          <div className="text-muted-foreground">Total purchases last 30 days</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>New Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">{users.new}</CardTitle>

          <CardAction>
            <Badge variant="outline">
              {users.trendingUp ? <IconTrendingUp /> : <IconTrendingDown />}
              {users.prev === 0
                ? "+100%"
                : (((users.new - users.prev) / users.prev) * 100).toFixed(1) + "%"}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {users.trendingUp ? "More signups than last period" : "Fewer signups than last period"}
            {users.trendingUp ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>

          <div className="text-muted-foreground">Comparison with previous 30 days</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">{accounts.active}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp /> Active
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="text-sm text-muted-foreground">
          Users with an active subscription
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {growthRate.percentage.toFixed(1)}%
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              {growthRate.trendingUp ? <IconTrendingUp /> : <IconTrendingDown />}
              {growthRate.percentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {growthRate.trendingUp ? "User growth improving" : "User growth slowing"}

            {growthRate.trendingUp ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>

          <div className="text-muted-foreground">Comparing 2 periods</div>
        </CardFooter>
      </Card>
    </div>
  );
}
