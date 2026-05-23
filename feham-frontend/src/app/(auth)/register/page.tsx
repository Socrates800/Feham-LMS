'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const cities = ['Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Quetta', 'Other'];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    school_name: '',
    school_address: '',
    city: 'Lahore',
    school_phone: '',
    school_email: '',
    student_range: '100-500',
    admin_name: '',
    admin_email: '',
    password: '',
    password_confirmation: '',
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register-school', {
        school_name: form.school_name,
        school_address: `${form.school_address}, ${form.city}`,
        school_phone: form.school_phone,
        school_email: form.school_email || form.admin_email,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setAuth(data.user, data.token, data.school);
      toast.success('Your school is ready!');
      router.push('/admin');
    } catch {
      toast.error('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg border-neutral-200">
      <CardHeader>
        <CardTitle>Launch your school on Feham</CardTitle>
        <CardDescription>Step {step} of 3</CardDescription>
        <div className="flex gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-indigo-600' : 'bg-neutral-200'}`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div>
              <Label>School name</Label>
              <Input className="mt-1" value={form.school_name} onChange={(e) => update('school_name', e.target.value)} required />
            </div>
            <div>
              <Label>Address</Label>
              <Input className="mt-1" value={form.school_address} onChange={(e) => update('school_address', e.target.value)} />
            </div>
            <div>
              <Label>City</Label>
              <select
                className="mt-1 w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              >
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <Button className="w-full bg-indigo-600" onClick={() => setStep(2)} disabled={!form.school_name}>
              Continue
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <div>
              <Label>Admin full name</Label>
              <Input className="mt-1" value={form.admin_name} onChange={(e) => update('admin_name', e.target.value)} />
            </div>
            <div>
              <Label>Admin email</Label>
              <Input type="email" className="mt-1" value={form.admin_email} onChange={(e) => update('admin_email', e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" className="mt-1" value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input type="password" className="mt-1" value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 bg-indigo-600" onClick={() => setStep(3)}>Continue</Button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="rounded-lg bg-neutral-50 p-4 text-sm space-y-1">
              <p><strong>School:</strong> {form.school_name}</p>
              <p><strong>Admin:</strong> {form.admin_name} ({form.admin_email})</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1 bg-indigo-600" onClick={submit} disabled={loading}>
                {loading ? 'Launching...' : 'Launch Your School'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


