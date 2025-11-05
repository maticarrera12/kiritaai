import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function PricingSkeleton() {
  return (
    <div className="w-full py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-96 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-64 bg-muted rounded-lg mx-auto animate-pulse" />

          {/* Toggle Skeleton */}
          <div className="mt-8 flex justify-center">
            <div className="h-12 w-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Plan Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <PlanCardSkeleton key={i} isPopular={i === 2} />
          ))}
        </div>

        {/* Credit Packs Section Skeleton */}
        <div className="mt-20">
          <div className="h-8 w-64 bg-muted rounded-lg mx-auto mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-md mx-auto">
            <CreditPackCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCardSkeleton({ isPopular }: { isPopular?: boolean }) {
  return (
    <Card
      className={`relative ${
        isPopular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="h-6 w-28 bg-primary/80 rounded-full animate-pulse" />
        </div>
      )}

      <CardHeader className="text-center pb-4">
        {/* Plan Name */}
        <div className="h-8 w-24 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />

        {/* Price */}
        <div className="mt-4 flex items-baseline justify-center gap-2">
          <div className="h-14 w-24 bg-muted rounded-lg animate-pulse" />
          <div className="h-6 w-16 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Billing Description */}
        <div className="h-4 w-32 bg-muted rounded-lg mx-auto mt-2 animate-pulse" />
      </CardHeader>

      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded-full animate-pulse flex-shrink-0" />
              <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <div className="w-full h-12 bg-muted rounded-lg animate-pulse" />
      </CardFooter>
    </Card>
  );
}

function CreditPackCardSkeleton() {
  return (
    <Card>
      <CardHeader className="text-center pb-4">
        {/* Pack Name */}
        <div className="h-8 w-32 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />

        {/* Price */}
        <div className="mt-4 flex items-baseline justify-center">
          <div className="h-14 w-28 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Credits */}
        <div className="h-5 w-24 bg-muted rounded-lg mx-auto mt-2 animate-pulse" />

        {/* Savings */}
        <div className="h-4 w-20 bg-muted rounded-lg mx-auto mt-1 animate-pulse" />
      </CardHeader>

      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded-full animate-pulse flex-shrink-0" />
              <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <div className="w-full h-12 bg-muted rounded-lg animate-pulse" />
      </CardFooter>
    </Card>
  );
}
