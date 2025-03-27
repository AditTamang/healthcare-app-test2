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
import { createDoctorProfile, updateDoctorProfile } from "@/lib/doctor-profile"
import type { DoctorProfile } from "@prisma/client"

export function DoctorProfileForm({
  userId,
  doctorProfile,
}: {
  userId: string
  doctorProfile: DoctorProfile | null
}) {
  const [specialty, setSpecialty] = useState(doctorProfile?.specialty || "")
  const [bio, setBio] = useState(doctorProfile?.bio || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("specialty", specialty)
      formData.append("bio", bio)

      let result
      if (doctorProfile) {
        result = await updateDoctorProfile(userId, formData)
      } else {
        result = await createDoctorProfile(userId, formData)
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
        description: doctorProfile ? "Profile updated successfully" : "Profile created successfully",
      })

      router.push("/dashboard")
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
        <CardTitle>{doctorProfile ? "Update Your Profile" : "Create Your Doctor Profile"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g., Cardiology, Dermatology, etc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell patients about your experience, qualifications, and approach to care."
              rows={6}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading
              ? doctorProfile
                ? "Updating..."
                : "Creating..."
              : doctorProfile
                ? "Update Profile"
                : "Create Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

