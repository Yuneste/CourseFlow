'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { generateAcademicTerms, getCurrentTerm } from '@/lib/academic-systems'

const getCountryName = (code: string) => {
  const countries: Record<string, string> = {
    US: 'United States',
    CA: 'Canada',
    UK: 'United Kingdom',
    DE: 'Germany',
    NL: 'Netherlands',
  }
  return countries[code] || code
}

const getAcademicSystemName = (system: string) => {
  const systems: Record<string, string> = {
    gpa: 'GPA System',
    ects: 'ECTS System',
    uk_honours: 'UK Honours',
    percentage: 'Percentage',
  }
  return systems[system] || system
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    study_program: '',
    degree_type: '',
    country: '',
    academic_system: '',
    current_term: '',
  })
  const [availableTerms, setAvailableTerms] = useState<string[]>([])
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        const country = profileData.country || 'US';
        const terms = generateAcademicTerms(country);
        setAvailableTerms(terms.slice(0, 10)); // Show recent 10 terms
        
        // Use the saved current_term or leave empty for placeholder to show
        const currentTerm = profileData.current_term || '';
        
        console.log('Loaded profile data:', {
          current_term: profileData.current_term,
          country: country,
          availableTerms: terms.slice(0, 3)
        });
        
        setProfile({
          full_name: profileData.full_name || '',
          email: user.email || '',
          study_program: profileData.study_program || '',
          degree_type: profileData.degree_type || '',
          country: country,
          academic_system: profileData.academic_system || '',
          current_term: currentTerm,
        })
        setIsProfileLoaded(true)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMessage('')

    try {
      const updatePayload = {
        full_name: profile.full_name,
        study_program: profile.study_program,
        degree_type: profile.degree_type,
        current_term: profile.current_term,
      };
      
      console.log('Updating profile with:', updatePayload);
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      })

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (response.ok) {
        setSuccessMessage('Profile updated successfully!')
        // Reload profile to show updated data
        console.log('Profile saved successfully, reloading...');
        await loadProfile()
        
        // Show success message for 2 seconds
        setTimeout(() => {
          setSuccessMessage('')
        }, 2000)
      } else {
        console.error('Failed to update profile:', data)
        setSuccessMessage(`Error: ${data.error || 'Failed to update profile'}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setSuccessMessage('Error: Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/settings">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          Profile Settings
        </h1>
        <p className="text-muted-foreground mt-1">Update your personal information</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="study_program">Study Program</Label>
              <Input
                id="study_program"
                value={profile.study_program}
                onChange={(e) => setProfile({ ...profile, study_program: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree_type">Degree Type</Label>
              <Select
                value={profile.degree_type}
                onValueChange={(value) => setProfile({ ...profile, degree_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select degree type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bachelor">Bachelor&apos;s</SelectItem>
                  <SelectItem value="master">Master&apos;s</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="associate">Associate</SelectItem>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_term">Current Academic Term</Label>
              {isProfileLoaded && availableTerms.length > 0 ? (
                <Select
                  key={profile.current_term} // Force re-render when value changes
                  value={profile.current_term}
                  onValueChange={(value) => setProfile({ ...profile, current_term: value })}
                >
                  <SelectTrigger id="current_term">
                    <SelectValue placeholder="Select current term" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTerms.map((term) => {
                      const isSystemDefault = term === getCurrentTerm(profile.country);
                      return (
                        <SelectItem key={term} value={term}>
                          {term}
                          {isSystemDefault && " (System Default)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  Loading terms...
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {profile.current_term 
                  ? `Currently set to: ${profile.current_term}`
                  : "Select your current academic term"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country & Academic System</Label>
              <Input
                id="country"
                value={`${getCountryName(profile.country)} - ${getAcademicSystemName(profile.academic_system)}`}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">Country and academic system are set during initial setup</p>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              {successMessage && (
                <p className={`mt-2 text-sm ${successMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {successMessage}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}