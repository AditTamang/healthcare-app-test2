"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createHealthPackage, updateHealthPackage } from "@/lib/health-packages"
import type { HealthPackage } from "@prisma/client"

export function HealthPackageForm({
  healthPackage,
}: {
  healthPackage?: HealthPackage
}) {
  const [name, setName] = useState(healthPackage?.name || "")
  const [description, setDescription] = useState(healthPackage?.description || "")
  const [price, setPrice] = useState(healthPackage?.price.toString() || "")
  const [duration, setDuration] = useState(healthPackage?.duration.toString() || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("duration", duration)

      let result
      if (healthPackage) {
        result = await updateHealthPackage(healthPackage.id, formData)
      } else {
        result = await createHealthPackage(formData)
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: healthPackage ? "Health package updated successfully" : "Health package created successfully",
      })

      router.push("/admin/health-packages")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{healthPackage ? "Edit Health Package" : "Create New Health Package"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Package Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Basic Checkup, Comprehensive Exam"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's included in this health package"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 99.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 30, 60"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading
              ? healthPackage
                ? "Updating..."
                : "Creating..."
              : healthPackage
                ? "Update Package"
                : "Create Package"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

