"use client";

import { IconCheck, IconSettings } from "@tabler/icons-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlanInterval,
  PlanLimit,
  PlanType,
  usePlanLimits,
} from "@/hooks/admin/plan-limits/use-plan-limits";
import { useUpdateFeatures } from "@/hooks/admin/plan-limits/use-update-features";
import { useUpdatePlanLimits } from "@/hooks/admin/plan-limits/use-update-plan-limits";

const PLAN_LABEL: Record<PlanType, string> = {
  FREE: "Free",
  PRO: "Pro",
  BUSINESS: "Business",
};

const INTERVAL_LABEL: Record<PlanInterval, string> = {
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function PlanLimitsClient() {
  const [interval, setInterval] = React.useState<PlanInterval>("MONTHLY");
  const [editingPlan, setEditingPlan] = React.useState<PlanLimit | null>(null);
  const [editingFeatures, setEditingFeatures] = React.useState(editingPlan?.features ?? []);

  const { data, isLoading } = usePlanLimits();
  const updateLimits = useUpdatePlanLimits();
  const updateFeatures = useUpdateFeatures();

  React.useEffect(() => {
    if (editingPlan) {
      setEditingFeatures(editingPlan.features ?? []);
    }
  }, [editingPlan]);

  const filteredPlans = React.useMemo(
    () => (data || []).filter((p) => p.interval === interval),
    [data, interval]
  );

  const handleUpdateLimitField = (
    plan: PlanLimit,
    field: "monthlyCredits" | "maxProjectsPerMonth" | "maxAssetsPerProject",
    value: string
  ) => {
    const parsed = value === "" ? null : Number.isNaN(Number(value)) ? null : Number(value);

    const payload: any = {
      plan: plan.plan,
      interval: plan.interval,
    };

    if (field === "monthlyCredits") {
      payload.monthlyCredits = parsed ?? 0;
    } else {
      payload[field] = parsed;
    }

    updateLimits.mutate(payload, {
      onSuccess: () => {
        toast.success("Plan limits updated");
      },
      onError: () => {
        toast.error("Error updating plan limits");
      },
    });
  };

  const handleSaveFeatures = () => {
    if (!editingPlan) return;

    updateFeatures.mutate(
      {
        plan: editingPlan.plan,
        interval: editingPlan.interval,
        features: editingFeatures,
      },
      {
        onSuccess: () => {
          toast.success("Features updated");
          setEditingPlan(null);
        },
        onError: () => {
          toast.error("Error updating features");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plan Limits</h1>
          <p className="text-muted-foreground text-sm">
            Configure monthly credits, usage limits and features for each plan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">Billing interval</Label>
          <Tabs
            value={interval}
            onValueChange={(val) => setInterval(val as PlanInterval)}
            className="w-fit"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
              <TabsTrigger value="YEARLY">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <PlanLimitsSkeleton />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Plan</TableHead>
                <TableHead className="w-[160px] text-right">Monthly credits</TableHead>
                <TableHead className="w-[160px] text-right">Max projects / month</TableHead>
                <TableHead className="w-[180px] text-right">Max assets / project</TableHead>
                <TableHead className="w-[140px] text-right">Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-0.5">
                      <span>{PLAN_LABEL[plan.plan]}</span>
                      <span className="text-muted-foreground text-xs">
                        {INTERVAL_LABEL[plan.interval]}
                      </span>
                    </div>
                  </TableCell>

                  {/* Monthly credits */}
                  <TableCell className="text-right">
                    <Input
                      defaultValue={plan.monthlyCredits}
                      type="number"
                      min={0}
                      className="ml-auto h-8 w-24 text-right"
                      onBlur={(e) => handleUpdateLimitField(plan, "monthlyCredits", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </TableCell>

                  {/* Max projects */}
                  <TableCell className="text-right">
                    <Input
                      defaultValue={plan.maxProjectsPerMonth ?? ""}
                      placeholder="Unlimited"
                      type="number"
                      min={0}
                      className="ml-auto h-8 w-28 text-right"
                      onBlur={(e) =>
                        handleUpdateLimitField(plan, "maxProjectsPerMonth", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </TableCell>

                  {/* Max assets per project */}
                  <TableCell className="text-right">
                    <Input
                      defaultValue={plan.maxAssetsPerProject ?? ""}
                      placeholder="Unlimited"
                      type="number"
                      min={0}
                      className="ml-auto h-8 w-32 text-right"
                      onBlur={(e) =>
                        handleUpdateLimitField(plan, "maxAssetsPerProject", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </TableCell>

                  {/* Features */}
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <IconSettings className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredPlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No plans found for this interval.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Drawer de features */}
      <Drawer open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DrawerContent className="max-h-[90vh] overflow-hidden">
          <DrawerHeader>
            <DrawerTitle>Plan features</DrawerTitle>
            <DrawerDescription>
              Toggle and configure the features available for this plan.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
            {editingPlan && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{PLAN_LABEL[editingPlan.plan]}</span>
                    <span className="text-muted-foreground text-xs">
                      {INTERVAL_LABEL[editingPlan.interval]}
                    </span>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <IconCheck className="h-3 w-3" />
                    {editingFeatures.filter((f) => f.enabled).length} enabled
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  {editingFeatures.map((feature, index) => (
                    <div
                      key={feature.name}
                      className="flex items-start justify-between gap-4 rounded-md border px-3 py-2"
                    >
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{feature.name}</span>
                          {!feature.enabled && (
                            <Badge variant="outline" className="border-dashed text-[10px]">
                              Disabled
                            </Badge>
                          )}
                        </div>

                        {typeof feature.limit !== "undefined" && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Label className="text-xs">Limit</Label>
                            <Input
                              type="number"
                              min={0}
                              className="h-7 w-20"
                              defaultValue={typeof feature.limit === "number" ? feature.limit : ""}
                              onBlur={(e) => {
                                const val = e.target.value;
                                setEditingFeatures((prev) =>
                                  prev.map((f, i) =>
                                    i === index
                                      ? {
                                          ...f,
                                          limit: val === "" ? undefined : Number(val),
                                        }
                                      : f
                                  )
                                );
                              }}
                            />
                          </div>
                        )}

                        {typeof feature.variations !== "undefined" && (
                          <p className="text-xs text-muted-foreground">
                            {feature.variations} variations included.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={feature.enabled}
                          onCheckedChange={(checked) =>
                            setEditingFeatures((prev) =>
                              prev.map((f, i) => (i === index ? { ...f, enabled: checked } : f))
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {editingFeatures.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      No features configured for this plan.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <DrawerFooter>
            <Button onClick={handleSaveFeatures} disabled={updateFeatures.isPending}>
              {updateFeatures.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function PlanLimitsSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Monthly credits</TableHead>
            <TableHead className="text-right">Max projects / month</TableHead>
            <TableHead className="text-right">Max assets / project</TableHead>
            <TableHead className="text-right">Features</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-8 w-24" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-8 w-28" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-8 w-32" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-8 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
