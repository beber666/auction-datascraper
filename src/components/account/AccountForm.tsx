import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/lib/countries";

interface ProfileData {
  first_name: string;
  last_name: string;
  country: string;
}

interface AccountFormProps {
  profile: ProfileData;
  loading: boolean;
  onProfileChange: (profile: ProfileData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSignOut: () => void;
}

export const AccountForm = ({
  profile,
  loading,
  onProfileChange,
  onSubmit,
  onSignOut,
}: AccountFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={profile.first_name}
            onChange={(e) => onProfileChange({ ...profile, first_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={profile.last_name}
            onChange={(e) => onProfileChange({ ...profile, last_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Select
            value={profile.country}
            onValueChange={(value) => onProfileChange({ ...profile, country: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="submit" disabled={loading}>
          Save Changes
        </Button>
        <Button type="button" variant="destructive" onClick={onSignOut}>
          Sign Out
        </Button>
      </div>
    </form>
  );
};