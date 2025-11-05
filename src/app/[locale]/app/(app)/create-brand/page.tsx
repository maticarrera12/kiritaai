"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateBrandPage() {
  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Create Brand Project
          </h1>
          <p className="text-sm text-muted-foreground">
            Define your brand basics and choose which assets to generate.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button className="">Generate</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Brand details */}
        <Card className="p-4 lg:col-span-2">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input id="name" placeholder="Acme Inc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input id="businessType" placeholder="e.g. SaaS, eCommerce" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select>
                  <SelectTrigger id="industry" className="w-full">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g. freelancers, SMBs, Gen Z"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vibe">Brand Vibe (comma separated)</Label>
              <Input id="vibe" placeholder="modern, minimal, playful" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Short description of your brand, values and positioning..."
                className="min-h-28 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Checkbox id="public" />
                <Label htmlFor="public">Make project public</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="favorite" />
                <Label htmlFor="favorite">Mark as favorite</Label>
              </div>
            </div>
          </form>
        </Card>

        {/* Right: Assets + AI brief */}
        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="mb-3 text-base font-medium text-foreground">
              Assets to generate
            </h2>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <Checkbox id="asset-logo" defaultChecked />
                <Label htmlFor="asset-logo">Logo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="asset-avatar" />
                <Label htmlFor="asset-avatar">Avatar</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="asset-brand-name" defaultChecked />
                <Label htmlFor="asset-brand-name">Brand Name</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="asset-tagline" defaultChecked />
                <Label htmlFor="asset-tagline">Tagline</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="asset-colors" defaultChecked />
                <Label htmlFor="asset-colors">Color Palette</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="asset-voice" />
                <Label htmlFor="asset-voice">Brand Voice</Label>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-base font-medium text-foreground">
              AI Brief
            </h2>
            <p className="mb-2 text-xs text-muted-foreground">
              Describe what you want the AI to consider (tone, references,
              constraints).
            </p>
            <textarea
              placeholder="e.g. Modern fintech brand, trust + innovation, blue primary, avoid gradients."
              className="min-h-32 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline">Clear</Button>
              <Button>Use Template</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
